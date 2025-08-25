import type { Dataset, DuplicationAlert, SimilarityMetrics } from "../types/dataset"
import { SimilarityAnalysisService } from "./similarity"

export class DuplicationDetectionService {
  private datasets: Map<string, Dataset> = new Map()
  private alerts: DuplicationAlert[] = []

  /**
   * Add a dataset to the detection system
   */
  addDataset(dataset: Dataset): void {
    this.datasets.set(dataset.id, dataset)
    this.checkForDuplicates(dataset)
  }

  /**
   * Check for duplicates against existing datasets
   */
  private checkForDuplicates(newDataset: Dataset): void {
    for (const [id, existingDataset] of this.datasets) {
      if (id === newDataset.id) continue

      // Quick hash-based exact match check
      if (this.isExactMatch(newDataset, existingDataset)) {
        this.createAlert(newDataset, existingDataset, "exact", 1.0)
        continue
      }

      // Detailed similarity analysis
      const similarity = SimilarityAnalysisService.calculateSimilarityMetrics(newDataset, existingDataset)

      const duplicationType = SimilarityAnalysisService.isDuplicate(similarity)

      if (duplicationType !== "none") {
        this.createAlert(newDataset, existingDataset, duplicationType, similarity.confidence)
      }
    }
  }

  /**
   * Check for exact match using content hashes
   */
  private isExactMatch(dataset1: Dataset, dataset2: Dataset): boolean {
    return (
      dataset1.fingerprint.contentHash === dataset2.fingerprint.contentHash &&
      dataset1.fingerprint.schemaHash === dataset2.fingerprint.schemaHash
    )
  }

  /**
   * Create duplication alert
   */
  private createAlert(
    newDataset: Dataset,
    existingDataset: Dataset,
    type: "exact" | "similar" | "potential",
    confidence: number,
  ): void {
    const similarity = SimilarityAnalysisService.calculateSimilarityMetrics(newDataset, existingDataset)

    const alert: DuplicationAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      confidence,
      originalDataset: existingDataset,
      duplicateDataset: newDataset,
      similarities: similarity,
      recommendation: this.generateRecommendation(type, similarity),
      createdAt: new Date(),
    }

    this.alerts.push(alert)
  }

  /**
   * Generate recommendation based on duplication type
   */
  private generateRecommendation(type: "exact" | "similar" | "potential", similarity: SimilarityMetrics): string {
    switch (type) {
      case "exact":
        return "This appears to be an exact duplicate. Consider using a reference link instead of downloading."
      case "similar":
        return `High similarity detected (${(similarity.confidence * 100).toFixed(1)}%). Review differences before downloading.`
      case "potential":
        return `Potential duplicate detected (${(similarity.confidence * 100).toFixed(1)}%). Consider if this dataset adds unique value.`
      default:
        return "No specific recommendation available."
    }
  }

  /**
   * Get all alerts
   */
  getAlerts(): DuplicationAlert[] {
    return [...this.alerts]
  }

  /**
   * Get alerts for a specific dataset
   */
  getAlertsForDataset(datasetId: string): DuplicationAlert[] {
    return this.alerts.filter(
      (alert) => alert.originalDataset.id === datasetId || alert.duplicateDataset.id === datasetId,
    )
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(olderThanDays = 30): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    this.alerts = this.alerts.filter((alert) => alert.createdAt > cutoffDate)
  }
}
