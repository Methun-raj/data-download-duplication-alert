"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Database, Calendar, User, Building } from "lucide-react"
import type { SearchResponse, SearchQuery } from "@/lib/services/metadata-repository"

export function MetadataSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({})
  const [sortBy, setSortBy] = useState("relevance")

  const handleSearch = async () => {
    setIsLoading(true)

    try {
      const query: SearchQuery = {
        text: searchQuery || undefined,
        facets: Object.keys(selectedFacets).length > 0 ? selectedFacets : undefined,
        sort: sortBy !== "relevance" ? [{ field: sortBy, direction: "desc" }] : undefined,
        limit: 20,
      }

      const response = await fetch("/api/metadata/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacetChange = (facetName: string, value: string, checked: boolean) => {
    setSelectedFacets((prev) => {
      const newFacets = { ...prev }

      if (!newFacets[facetName]) {
        newFacets[facetName] = []
      }

      if (checked) {
        newFacets[facetName] = [...newFacets[facetName], value]
      } else {
        newFacets[facetName] = newFacets[facetName].filter((v) => v !== value)
        if (newFacets[facetName].length === 0) {
          delete newFacets[facetName]
        }
      }

      return newFacets
    })
  }

  useEffect(() => {
    if (searchQuery || Object.keys(selectedFacets).length > 0) {
      const debounceTimer = setTimeout(handleSearch, 300)
      return () => clearTimeout(debounceTimer)
    }
  }, [searchQuery, selectedFacets, sortBy])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Metadata Search
          </CardTitle>
          <CardDescription>Search and explore dataset metadata with advanced filtering</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search datasets, descriptions, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="searchMetadata.popularity">Popularity</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>

          {results && results.total > 0 && (
            <div className="text-sm text-muted-foreground">Found {results.total} datasets</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Facets Sidebar */}
        {results && results.facets && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(results.facets).map(([facetName, facetValues]) => (
                <div key={facetName} className="space-y-2">
                  <h4 className="font-medium text-sm capitalize">{facetName.replace(/([A-Z])/g, " $1").trim()}</h4>
                  <div className="space-y-1">
                    {Object.entries(facetValues).map(([value, count]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${facetName}-${value}`}
                          checked={selectedFacets[facetName]?.includes(value) || false}
                          onCheckedChange={(checked) => handleFacetChange(facetName, value, checked as boolean)}
                        />
                        <label htmlFor={`${facetName}-${value}`} className="text-sm flex-1 cursor-pointer">
                          {value} ({count})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        <div className={`space-y-4 ${results?.facets ? "lg:col-span-3" : "lg:col-span-4"}`}>
          {results?.results.map((result) => (
            <Card key={result.metadata.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {result.highlights?.title ? (
                        <span dangerouslySetInnerHTML={{ __html: result.highlights.title[0] }} />
                      ) : (
                        result.metadata.title
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {result.metadata.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {result.metadata.organization}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(result.metadata.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Score: {result.score.toFixed(1)}</Badge>
                    <Badge variant="outline">{result.metadata.technical.format}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">
                    {result.highlights?.description ? (
                      <span dangerouslySetInnerHTML={{ __html: result.highlights.description[0] }} />
                    ) : (
                      result.metadata.description
                    )}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      {result.metadata.technical.size} bytes
                    </div>
                    <div>Quality: {(result.metadata.technical.dataQuality.completeness * 100).toFixed(0)}%</div>
                    <div>Version: {result.metadata.version}</div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {result.metadata.collaborative.tags.slice(0, 5).map((tag) => (
                      <Badge key={tag.tag} variant="outline" className="text-xs">
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {results && results.results.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No datasets found matching your criteria.</p>
                {results.suggestions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm">Did you mean:</p>
                    <div className="flex gap-2 justify-center mt-2">
                      {results.suggestions.map((suggestion) => (
                        <Button key={suggestion} variant="outline" size="sm" onClick={() => setSearchQuery(suggestion)}>
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
