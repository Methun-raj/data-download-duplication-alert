import { type NextRequest, NextResponse } from "next/server"
import { AIRecommendationEngine } from "@/lib/services/ai-recommendation-engine"

const aiEngine = new AIRecommendationEngine()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "user_123"
    const context = searchParams.get("context") ? JSON.parse(searchParams.get("context")!) : undefined

    const recommendations = await aiEngine.getRecommendations(userId, context)

    return NextResponse.json({ success: true, data: recommendations })
  } catch (error) {
    console.error("Recommendations error:", error)
    return NextResponse.json({ success: false, error: "Failed to get recommendations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, userId } = await request.json()

    const result = await aiEngine.processConversationalQuery(query, userId || "user_123")

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Conversational query error:", error)
    return NextResponse.json({ success: false, error: "Failed to process query" }, { status: 500 })
  }
}
