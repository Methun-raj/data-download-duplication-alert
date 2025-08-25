import { type NextRequest, NextResponse } from "next/server"
import { collaborationManager } from "@/lib/services/collaboration-manager"

export async function POST(request: NextRequest) {
  try {
    const entryData = await request.json()
    const entry = await collaborationManager.createKnowledgeEntry(entryData)

    return NextResponse.json({
      success: true,
      entry,
      message: "Knowledge entry created successfully",
    })
  } catch (error) {
    console.error("Error creating knowledge entry:", error)
    return NextResponse.json({ error: "Failed to create knowledge entry" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || undefined
    const tags = searchParams.get("tags")?.split(",") || undefined

    const entries = await collaborationManager.searchKnowledgeBase(query, { type, tags })

    return NextResponse.json({ entries })
  } catch (error) {
    console.error("Error searching knowledge base:", error)
    return NextResponse.json({ error: "Failed to search knowledge base" }, { status: 500 })
  }
}
