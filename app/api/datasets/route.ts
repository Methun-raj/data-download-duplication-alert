import { type NextRequest, NextResponse } from "next/server"
import type { Dataset } from "@/lib/types/dataset"
import { DatasetFingerprintingService } from "@/lib/services/fingerprinting"
import { DuplicationDetectionService } from "@/lib/services/detection"

// In-memory storage for demo (replace with database in production)
const detectionService = new DuplicationDetectionService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, source, content, metadata } = body

    // Generate fingerprints
    const contentHash = DatasetFingerprintingService.generateContentHash(content)
    const schemaHash = DatasetFingerprintingService.generateSchemaHash(metadata.dataTypes)
    const statisticalHash = DatasetFingerprintingService.generateStatisticalHash(content)

    // Create dataset object
    const dataset: Dataset = {
      id: `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      source,
      size: JSON.stringify(content).length,
      format: "json", // Simplified for demo
      createdAt: new Date(),
      modifiedAt: new Date(),
      fingerprint: {
        contentHash,
        schemaHash,
        statisticalHash,
      },
      metadata: {
        ...metadata,
        provenance: {
          sourceUrl: source,
          downloadedAt: new Date(),
          transformations: [],
          lineage: [],
          quality: {
            completeness: 0.95,
            consistency: 0.9,
            accuracy: 0.85,
            freshness: 1.0,
            validity: 0.92,
          },
        },
      },
    }

    // Add to detection service
    detectionService.addDataset(dataset)

    // Get any alerts generated
    const alerts = detectionService.getAlertsForDataset(dataset.id)

    return NextResponse.json({
      dataset,
      alerts,
      message: alerts.length > 0 ? "Potential duplicates detected" : "Dataset processed successfully",
    })
  } catch (error) {
    console.error("Error processing dataset:", error)
    return NextResponse.json({ error: "Failed to process dataset" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const alerts = detectionService.getAlerts()
    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}
