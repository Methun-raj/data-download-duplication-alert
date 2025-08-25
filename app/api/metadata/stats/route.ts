import { type NextRequest, NextResponse } from "next/server"
import { metadataRepository } from "@/lib/services/metadata-repository"

export async function GET(request: NextRequest) {
  try {
    const stats = await metadataRepository.getStats()

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error retrieving stats:", error)
    return NextResponse.json({ error: "Failed to retrieve stats" }, { status: 500 })
  }
}
