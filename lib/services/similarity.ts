import type { SimilarityMetrics, Dataset } from "../types/dataset"

export class SimilarityAnalysisService {
  /**
   * Calculate Jaccard similarity between two datasets
   */
  static calculateJaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter((x) => set2.has(x)))
    const union = new Set([...set1, ...set2])

    return union.size === 0 ? 0 : intersection.size / union.size
  }

  /**
   * Calculate cosine similarity between numerical vectors
   */
  static calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) return 0

    const dotProduct = vector1.reduce((sum, a, i) => sum + a * vector2[i], 0)
    const magnitude1 = Math.sqrt(vector1.reduce((sum, a) => sum + a * a, 0))
    const magnitude2 = Math.sqrt(vector2.reduce((sum, a) => sum + a * a, 0))

    return magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2)
  }

  /**
   * Calculate structural similarity based on schema
   */
  static calculateStructuralSimilarity(schema1: Record<string, string>, schema2: Record<string, string>): number {
    const keys1 = new Set(Object.keys(schema1))
    const keys2 = new Set(Object.keys(schema2))

    const commonKeys = new Set([...keys1].filter((x) => keys2.has(x)))
    const allKeys = new Set([...keys1, ...keys2])

    if (allKeys.size === 0) return 1

    let typeMatches = 0
    commonKeys.forEach((key) => {
      if (schema1[key] === schema2[key]) typeMatches++
    })

    const keysSimilarity = commonKeys.size / allKeys.size
    const typesSimilarity = commonKeys.size === 0 ? 0 : typeMatches / commonKeys.size

    return (keysSimilarity + typesSimilarity) / 2
  }

  /**
   * Calculate comprehensive similarity metrics between two datasets
   */
  static calculateSimilarityMetrics(dataset1: Dataset, dataset2: Dataset): SimilarityMetrics {
    // Extract column names for Jaccard similarity
    const columns1 = new Set(Object.keys(dataset1.metadata.dataTypes))
    const columns2 = new Set(Object.keys(dataset2.metadata.dataTypes))

    const jaccard = this.calculateJaccardSimilarity(columns1, columns2)
    const structural = this.calculateStructuralSimilarity(dataset1.metadata.dataTypes, dataset2.metadata.dataTypes)

    // Create feature vectors for cosine similarity
    const features1 = this.extractFeatureVector(dataset1)
    const features2 = this.extractFeatureVector(dataset2)
    const cosine = this.calculateCosineSimilarity(features1, features2)

    // Calculate semantic similarity (simplified)
    const semantic = this.calculateSemanticSimilarity(dataset1, dataset2)

    // Calculate overall confidence
    const confidence = (jaccard + structural + cosine + semantic) / 4

    return {
      jaccard,
      cosine,
      structural,
      semantic,
      confidence,
    }
  }

  /**
   * Extract numerical feature vector from dataset metadata
   */
  private static extractFeatureVector(dataset: Dataset): number[] {
    return [
      dataset.size,
      dataset.metadata.columnCount,
      dataset.metadata.rowCount,
      dataset.metadata.provenance.quality.completeness,
      dataset.metadata.provenance.quality.consistency,
      dataset.metadata.provenance.quality.accuracy,
      dataset.metadata.provenance.quality.freshness,
      dataset.metadata.provenance.quality.validity,
    ]
  }

  /**
   * Calculate semantic similarity based on metadata
   */
  private static calculateSemanticSimilarity(dataset1: Dataset, dataset2: Dataset): number {
    // Simple text similarity based on title and description
    const text1 = (dataset1.metadata.title + " " + dataset1.metadata.description).toLowerCase()
    const text2 = (dataset2.metadata.title + " " + dataset2.metadata.description).toLowerCase()

    const words1 = new Set(text1.split(/\s+/))
    const words2 = new Set(text2.split(/\s+/))

    return this.calculateJaccardSimilarity(words1, words2)
  }

  /**
   * Determine if datasets are duplicates based on similarity thresholds
   */
  static isDuplicate(
    similarity: SimilarityMetrics,
    thresholds = {
      exact: 0.95,
      similar: 0.8,
      potential: 0.6,
    },
  ): "exact" | "similar" | "potential" | "none" {
    if (similarity.confidence >= thresholds.exact) return "exact"
    if (similarity.confidence >= thresholds.similar) return "similar"
    if (similarity.confidence >= thresholds.potential) return "potential"
    return "none"
  }
}
