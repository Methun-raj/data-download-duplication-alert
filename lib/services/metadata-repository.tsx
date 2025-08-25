import type { ExtendedDatasetMetadata } from "../types/metadata"

export interface SearchQuery {
  text?: string
  facets?: Record<string, string[]>
  filters?: SearchFilter[]
  sort?: SortOption[]
  limit?: number
  offset?: number
}

export interface SearchFilter {
  field: string
  operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "in" | "contains"
  value: any
}

export interface SortOption {
  field: string
  direction: "asc" | "desc"
}

export interface SearchResult {
  metadata: ExtendedDatasetMetadata
  score: number
  highlights: Record<string, string[]>
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  facets: Record<string, Record<string, number>>
  suggestions: string[]
}

export class MetadataRepository {
  private metadata: Map<string, ExtendedDatasetMetadata> = new Map()
  private searchIndex: Map<string, Set<string>> = new Map()
  private facetIndex: Map<string, Map<string, Set<string>>> = new Map()

  /**
   * Store dataset metadata
   */
  async store(metadata: ExtendedDatasetMetadata): Promise<void> {
    // Store the metadata
    this.metadata.set(metadata.id, metadata)

    // Update search indexes
    await this.updateSearchIndex(metadata)
    await this.updateFacetIndex(metadata)

    console.log(`Stored metadata for dataset: ${metadata.id}`)
  }

  /**
   * Retrieve dataset metadata by ID
   */
  async get(id: string): Promise<ExtendedDatasetMetadata | null> {
    return this.metadata.get(id) || null
  }

  /**
   * Update existing metadata
   */
  async update(id: string, updates: Partial<ExtendedDatasetMetadata>): Promise<void> {
    const existing = this.metadata.get(id)
    if (!existing) {
      throw new Error(`Dataset metadata not found: ${id}`)
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    }

    await this.store(updated)
  }

  /**
   * Delete dataset metadata
   */
  async delete(id: string): Promise<void> {
    const metadata = this.metadata.get(id)
    if (!metadata) {
      throw new Error(`Dataset metadata not found: ${id}`)
    }

    this.metadata.delete(id)
    await this.removeFromSearchIndex(metadata)
    await this.removeFromFacetIndex(metadata)

    console.log(`Deleted metadata for dataset: ${id}`)
  }

  /**
   * Search datasets with advanced query capabilities
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    let candidateIds = new Set<string>(this.metadata.keys())

    // Apply text search
    if (query.text) {
      candidateIds = this.performTextSearch(query.text, candidateIds)
    }

    // Apply facet filters
    if (query.facets) {
      candidateIds = this.applyFacetFilters(query.facets, candidateIds)
    }

    // Apply additional filters
    if (query.filters) {
      candidateIds = this.applyFilters(query.filters, candidateIds)
    }

    // Convert to results with scoring
    const results = Array.from(candidateIds)
      .map((id) => {
        const metadata = this.metadata.get(id)!
        const score = this.calculateRelevanceScore(metadata, query)
        return {
          metadata,
          score,
          highlights: this.generateHighlights(metadata, query.text),
        }
      })
      .sort((a, b) => b.score - a.score)

    // Apply sorting if specified
    if (query.sort && query.sort.length > 0) {
      results.sort((a, b) => this.compareBySort(a.metadata, b.metadata, query.sort!))
    }

    // Apply pagination
    const offset = query.offset || 0
    const limit = query.limit || 50
    const paginatedResults = results.slice(offset, offset + limit)

    // Generate facets
    const facets = this.generateFacets(Array.from(candidateIds))

    // Generate suggestions
    const suggestions = this.generateSuggestions(query.text)

    return {
      results: paginatedResults,
      total: results.length,
      facets,
      suggestions,
    }
  }

  /**
   * Get dataset lineage information
   */
  async getLineage(id: string): Promise<any> {
    const metadata = await this.get(id)
    if (!metadata) {
      throw new Error(`Dataset not found: ${id}`)
    }

    return {
      upstream: await this.getUpstreamDatasets(id),
      downstream: await this.getDownstreamDatasets(id),
      transformations: metadata.provenance.lineage[0]?.transformations || [],
    }
  }

  /**
   * Get version history for a dataset
   */
  async getVersionHistory(id: string): Promise<any> {
    const metadata = await this.get(id)
    if (!metadata) {
      throw new Error(`Dataset not found: ${id}`)
    }

    return metadata.versioning.versionHistory
  }

  /**
   * Update search index for full-text search
   */
  private async updateSearchIndex(metadata: ExtendedDatasetMetadata): Promise<void> {
    const searchableText = [
      metadata.title,
      metadata.description,
      metadata.author,
      metadata.organization,
      ...metadata.collaborative.tags.map((t) => t.tag),
      ...metadata.searchMetadata.searchTags,
    ]
      .join(" ")
      .toLowerCase()

    const words = searchableText.split(/\s+/).filter((word) => word.length > 2)

    words.forEach((word) => {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set())
      }
      this.searchIndex.get(word)!.add(metadata.id)
    })
  }

  /**
   * Update facet index for faceted search
   */
  private async updateFacetIndex(metadata: ExtendedDatasetMetadata): Promise<void> {
    const facets = {
      format: metadata.technical.format,
      domain: metadata.business.domain,
      category: metadata.business.category,
      organization: metadata.organization,
      sensitivity: metadata.business.dataClassification.sensitivityLevel,
    }

    Object.entries(facets).forEach(([facetName, facetValue]) => {
      if (!this.facetIndex.has(facetName)) {
        this.facetIndex.set(facetName, new Map())
      }

      const facetMap = this.facetIndex.get(facetName)!
      if (!facetMap.has(facetValue)) {
        facetMap.set(facetValue, new Set())
      }

      facetMap.get(facetValue)!.add(metadata.id)
    })
  }

  /**
   * Perform text search across indexed content
   */
  private performTextSearch(text: string, candidates: Set<string>): Set<string> {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2)
    const matchingIds = new Set<string>()

    words.forEach((word) => {
      const wordMatches = this.searchIndex.get(word) || new Set()
      wordMatches.forEach((id) => {
        if (candidates.has(id)) {
          matchingIds.add(id)
        }
      })
    })

    return matchingIds
  }

  /**
   * Apply facet filters to candidate set
   */
  private applyFacetFilters(facets: Record<string, string[]>, candidates: Set<string>): Set<string> {
    let filtered = new Set(candidates)

    Object.entries(facets).forEach(([facetName, values]) => {
      const facetMap = this.facetIndex.get(facetName)
      if (!facetMap) return

      const facetMatches = new Set<string>()
      values.forEach((value) => {
        const valueMatches = facetMap.get(value) || new Set()
        valueMatches.forEach((id) => facetMatches.add(id))
      })

      filtered = new Set([...filtered].filter((id) => facetMatches.has(id)))
    })

    return filtered
  }

  /**
   * Apply additional filters
   */
  private applyFilters(filters: SearchFilter[], candidates: Set<string>): Set<string> {
    return new Set(
      [...candidates].filter((id) => {
        const metadata = this.metadata.get(id)!
        return filters.every((filter) => this.matchesFilter(metadata, filter))
      }),
    )
  }

  /**
   * Check if metadata matches a filter
   */
  private matchesFilter(metadata: ExtendedDatasetMetadata, filter: SearchFilter): boolean {
    const value = this.getNestedValue(metadata, filter.field)

    switch (filter.operator) {
      case "eq":
        return value === filter.value
      case "ne":
        return value !== filter.value
      case "gt":
        return value > filter.value
      case "lt":
        return value < filter.value
      case "gte":
        return value >= filter.value
      case "lte":
        return value <= filter.value
      case "in":
        return Array.isArray(filter.value) && filter.value.includes(value)
      case "contains":
        return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
      default:
        return true
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(metadata: ExtendedDatasetMetadata, query: SearchQuery): number {
    let score = 0

    // Base popularity score
    score += metadata.searchMetadata.popularity * 0.1

    // Text relevance
    if (query.text) {
      const text = query.text.toLowerCase()
      if (metadata.title.toLowerCase().includes(text)) score += 10
      if (metadata.description.toLowerCase().includes(text)) score += 5
      if (metadata.author.toLowerCase().includes(text)) score += 3
    }

    // Quality score
    const qualityScore =
      (metadata.technical.dataQuality.completeness +
        metadata.technical.dataQuality.consistency +
        metadata.technical.dataQuality.accuracy) /
      3
    score += qualityScore * 5

    // Recency score
    const daysSinceUpdate = (Date.now() - metadata.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    score += Math.max(0, 5 - daysSinceUpdate * 0.1)

    return score
  }

  /**
   * Generate search highlights
   */
  private generateHighlights(metadata: ExtendedDatasetMetadata, searchText?: string): Record<string, string[]> {
    if (!searchText) return {}

    const highlights: Record<string, string[]> = {}
    const text = searchText.toLowerCase()

    if (metadata.title.toLowerCase().includes(text)) {
      highlights.title = [this.highlightText(metadata.title, text)]
    }

    if (metadata.description.toLowerCase().includes(text)) {
      highlights.description = [this.highlightText(metadata.description, text)]
    }

    return highlights
  }

  /**
   * Highlight matching text
   */
  private highlightText(text: string, searchTerm: string): string {
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.replace(regex, "<mark>$1</mark>")
  }

  /**
   * Generate facets for search results
   */
  private generateFacets(candidateIds: string[]): Record<string, Record<string, number>> {
    const facets: Record<string, Record<string, number>> = {}

    const facetFields = ["format", "domain", "category", "organization", "sensitivity"]

    facetFields.forEach((field) => {
      facets[field] = {}
      candidateIds.forEach((id) => {
        const metadata = this.metadata.get(id)!
        const value = this.getFacetValue(metadata, field)
        facets[field][value] = (facets[field][value] || 0) + 1
      })
    })

    return facets
  }

  /**
   * Get facet value for a field
   */
  private getFacetValue(metadata: ExtendedDatasetMetadata, field: string): string {
    switch (field) {
      case "format":
        return metadata.technical.format
      case "domain":
        return metadata.business.domain
      case "category":
        return metadata.business.category
      case "organization":
        return metadata.organization
      case "sensitivity":
        return metadata.business.dataClassification.sensitivityLevel
      default:
        return "unknown"
    }
  }

  /**
   * Generate search suggestions
   */
  private generateSuggestions(searchText?: string): string[] {
    if (!searchText) return []

    const suggestions: string[] = []
    const text = searchText.toLowerCase()

    // Find similar terms in the search index
    this.searchIndex.forEach((ids, term) => {
      if (term.includes(text) && term !== text) {
        suggestions.push(term)
      }
    })

    return suggestions.slice(0, 5)
  }

  /**
   * Compare metadata for sorting
   */
  private compareBySort(a: ExtendedDatasetMetadata, b: ExtendedDatasetMetadata, sortOptions: SortOption[]): number {
    for (const sort of sortOptions) {
      const aValue = this.getNestedValue(a, sort.field)
      const bValue = this.getNestedValue(b, sort.field)

      let comparison = 0
      if (aValue < bValue) comparison = -1
      else if (aValue > bValue) comparison = 1

      if (comparison !== 0) {
        return sort.direction === "desc" ? -comparison : comparison
      }
    }
    return 0
  }

  /**
   * Remove metadata from search index
   */
  private async removeFromSearchIndex(metadata: ExtendedDatasetMetadata): Promise<void> {
    this.searchIndex.forEach((ids, term) => {
      ids.delete(metadata.id)
      if (ids.size === 0) {
        this.searchIndex.delete(term)
      }
    })
  }

  /**
   * Remove metadata from facet index
   */
  private async removeFromFacetIndex(metadata: ExtendedDatasetMetadata): Promise<void> {
    this.facetIndex.forEach((facetMap, facetName) => {
      facetMap.forEach((ids, facetValue) => {
        ids.delete(metadata.id)
        if (ids.size === 0) {
          facetMap.delete(facetValue)
        }
      })
    })
  }

  /**
   * Get upstream datasets in lineage
   */
  private async getUpstreamDatasets(id: string): Promise<string[]> {
    const metadata = await this.get(id)
    if (!metadata) return []

    return metadata.provenance.lineage[0]?.upstream || []
  }

  /**
   * Get downstream datasets in lineage
   */
  private async getDownstreamDatasets(id: string): Promise<string[]> {
    const metadata = await this.get(id)
    if (!metadata) return []

    return metadata.provenance.lineage[0]?.downstream || []
  }

  /**
   * Get all metadata (for admin/debugging)
   */
  async getAll(): Promise<ExtendedDatasetMetadata[]> {
    return Array.from(this.metadata.values())
  }

  /**
   * Get repository statistics
   */
  async getStats(): Promise<any> {
    const totalDatasets = this.metadata.size
    const totalIndexTerms = this.searchIndex.size
    const totalFacets = this.facetIndex.size

    const formatDistribution: Record<string, number> = {}
    const domainDistribution: Record<string, number> = {}

    this.metadata.forEach((metadata) => {
      const format = metadata.technical.format
      const domain = metadata.business.domain

      formatDistribution[format] = (formatDistribution[format] || 0) + 1
      domainDistribution[domain] = (domainDistribution[domain] || 0) + 1
    })

    return {
      totalDatasets,
      totalIndexTerms,
      totalFacets,
      formatDistribution,
      domainDistribution,
    }
  }
}

// Global repository instance
export const metadataRepository = new MetadataRepository()
