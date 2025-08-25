import { type NextRequest, NextResponse } from "next/server"
import { collaborationManager } from "@/lib/services/collaboration-manager"

export async function POST(request: NextRequest) {
  try {
    const { datasetId, sharedBy, targets, permissions, options } = await request.json()

    const share = await collaborationManager.shareDataset(datasetId, sharedBy, targets, permissions, options)

    return NextResponse.json({
      success: true,
      share,
      message: "Dataset shared successfully",
    })
  } catch (error) {
    console.error("Error sharing dataset:", error)
    return NextResponse.json({ error: "Failed to share dataset" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const shares = await collaborationManager.getSharedDatasets(userId)
    return NextResponse.json({ shares })
  } catch (error) {
    console.error("Error fetching shared datasets:", error)
    return NextResponse.json({ error: "Failed to fetch shared datasets" }, { status: 500 })
  }
}
