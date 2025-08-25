"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Plus, Search, ThumbsUp, ThumbsDown, Eye, Calendar } from "lucide-react"
import type { KnowledgeBaseEntry } from "@/lib/types/collaboration"

interface KnowledgeBaseProps {
  userId: string
  organizationId: string
}

export function KnowledgeBase({ userId, organizationId }: KnowledgeBaseProps) {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    type: "best_practice" as "best_practice" | "tutorial" | "documentation" | "faq",
    tags: "",
  })

  useEffect(() => {
    loadEntries()
  }, [searchQuery, selectedType])

  const loadEntries = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("q", searchQuery)
      if (selectedType !== "all") params.append("type", selectedType)

      const response = await fetch(`/api/collaboration/knowledge?${params}`)
      const data = await response.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error("Failed to load knowledge entries:", error)
    }
  }

  const createEntry = async () => {
    try {
      const entryData = {
        ...newEntry,
        tags: newEntry.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        authorId: userId,
        organizationId,
        relatedDatasets: [],
      }

      const response = await fetch("/api/collaboration/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      })

      const result = await response.json()
      if (result.success) {
        await loadEntries()
        setIsCreateDialogOpen(false)
        setNewEntry({ title: "", content: "", type: "best_practice", tags: "" })
      }
    } catch (error) {
      console.error("Failed to create knowledge entry:", error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "best_practice":
        return "💡"
      case "tutorial":
        return "📚"
      case "documentation":
        return "📄"
      case "faq":
        return "❓"
      default:
        return "📝"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "best_practice":
        return "bg-blue-100 text-blue-800"
      case "tutorial":
        return "bg-green-100 text-green-800"
      case "documentation":
        return "bg-purple-100 text-purple-800"
      case "faq":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base</h2>
          <p className="text-muted-foreground">Shared knowledge and best practices for dataset management</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Knowledge Entry</DialogTitle>
              <DialogDescription>Share knowledge with your team and organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="Best practices for data cleaning"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={newEntry.type} onValueChange={(value: any) => setNewEntry({ ...newEntry, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best_practice">Best Practice</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="Detailed explanation..."
                  rows={8}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={newEntry.tags}
                  onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                  placeholder="data-cleaning, preprocessing, quality"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createEntry} disabled={!newEntry.title || !newEntry.content}>
                  Create Entry
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="best_practice">Best Practices</SelectItem>
                <SelectItem value="tutorial">Tutorials</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="faq">FAQ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Entries */}
      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(entry.type)}</span>
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <Badge className={getTypeColor(entry.type)}>{entry.type.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {entry.views} views
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {entry.votes} votes
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm leading-relaxed">{entry.content}</p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {entries.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No knowledge entries found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try adjusting your search terms" : "Be the first to share knowledge with your team"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
