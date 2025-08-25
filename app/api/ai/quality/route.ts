import { type NextRequest, NextResponse } from "next/server"
import { AIRecommendationEngine } from "@/lib/services/ai-recommendation-engine"

const aiEngine = new AIRecommendationEngine()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const datasetId = searchParams.get("datasetId")

    if (!datasetId) {
      return NextResponse.json({ success: false, error: "Dataset ID is required" }, { status: 400 })
    }

    const assessment = await aiEngine.assessDataQuality(datasetId)

    return NextResponse.json({ success: true, data: assessment })
  } catch (error) {
    console.error("Quality assessment error:", error)
    return NextResponse.json({ success: false, error: "Failed to assess data quality" }, { status: 500 })
  }
}
