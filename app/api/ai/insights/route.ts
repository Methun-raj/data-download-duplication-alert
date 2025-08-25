import { type NextRequest, NextResponse } from "next/server"
import { AIRecommendationEngine } from "@/lib/services/ai-recommendation-engine"

const aiEngine = new AIRecommendationEngine()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "user_123"

    const insights = await aiEngine.getPredictiveInsights(userId)

    return NextResponse.json({ success: true, data: insights })
  } catch (error) {
    console.error("Predictive insights error:", error)
    return NextResponse.json({ success: false, error: "Failed to get predictive insights" }, { status: 500 })
  }
}
