import { type NextRequest, NextResponse } from "next/server"
import { metadataRepository } from "@/lib/services/metadata-repository"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Dataset ID required" }, { status: 400 })
    }

    const lineage = await metadataRepository.getLineage(id)

    return NextResponse.json({ lineage })
  } catch (error) {
    console.error("Error retrieving lineage:", error)
    return NextResponse.json({ error: "Failed to retrieve lineage" }, { status: 500 })
  }
}
