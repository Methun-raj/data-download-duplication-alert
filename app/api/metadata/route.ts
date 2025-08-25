import { type NextRequest, NextResponse } from "next/server"
import { metadataRepository } from "@/lib/services/metadata-repository"
import type { ExtendedDatasetMetadata } from "@/lib/types/metadata"

export async function POST(request: NextRequest) {
  try {
    const metadata: ExtendedDatasetMetadata = await request.json()

    // Add timestamps if not present
    if (!metadata.createdAt) {
      metadata.createdAt = new Date()
    }
    metadata.updatedAt = new Date()

    await metadataRepository.store(metadata)

    return NextResponse.json({
      success: true,
      message: "Metadata stored successfully",
      id: metadata.id,
    })
  } catch (error) {
    console.error("Error storing metadata:", error)
    return NextResponse.json({ error: "Failed to store metadata" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const metadata = await metadataRepository.get(id)
      if (!metadata) {
        return NextResponse.json({ error: "Metadata not found" }, { status: 404 })
      }
      return NextResponse.json({ metadata })
    }

    // Return all metadata if no ID specified
    const allMetadata = await metadataRepository.getAll()
    return NextResponse.json({ metadata: allMetadata })
  } catch (error) {
    console.error("Error retrieving metadata:", error)
    return NextResponse.json({ error: "Failed to retrieve metadata" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Dataset ID required" }, { status: 400 })
    }

    const updates = await request.json()
    await metadataRepository.update(id, updates)

    return NextResponse.json({
      success: true,
      message: "Metadata updated successfully",
    })
  } catch (error) {
    console.error("Error updating metadata:", error)
    return NextResponse.json({ error: "Failed to update metadata" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Dataset ID required" }, { status: 400 })
    }

    await metadataRepository.delete(id)

    return NextResponse.json({
      success: true,
      message: "Metadata deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting metadata:", error)
    return NextResponse.json({ error: "Failed to delete metadata" }, { status: 500 })
  }
}
