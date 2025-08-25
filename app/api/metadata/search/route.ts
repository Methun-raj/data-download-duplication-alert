import { type NextRequest, NextResponse } from "next/server"
import { metadataRepository } from "@/lib/services/metadata-repository"
import type { SearchQuery } from "@/lib/services/metadata-repository"

export async function POST(request: NextRequest) {
  try {
    const query: SearchQuery = await request.json()

    const results = await metadataRepository.search(query)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error searching metadata:", error)
    return NextResponse.json({ error: "Failed to search metadata" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query: SearchQuery = {
      text: searchParams.get("q") || undefined,
      limit: Number.parseInt(searchParams.get("limit") || "50"),
      offset: Number.parseInt(searchParams.get("offset") || "0"),
    }

    // Parse facets from query parameters
    const facets: Record<string, string[]> = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith("facet_")) {
        const facetName = key.replace("facet_", "")
        facets[facetName] = value.split(",")
      }
    })

    if (Object.keys(facets).length > 0) {
      query.facets = facets
    }

    // Parse filters
    const filters = []
    let filterIndex = 0
    while (searchParams.has(`filter_${filterIndex}_field`)) {
      const field = searchParams.get(`filter_${filterIndex}_field`)!
      const operator = searchParams.get(`filter_${filterIndex}_operator`)! as any
      const value = searchParams.get(`filter_${filterIndex}_value`)!

      filters.push({ field, operator, value })
      filterIndex++
    }

    if (filters.length > 0) {
      query.filters = filters
    }

    const results = await metadataRepository.search(query)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error searching metadata:", error)
    return NextResponse.json({ error: "Failed to search metadata" }, { status: 500 })
  }
}
