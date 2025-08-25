"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info, BarChart3 } from "lucide-react"
import { AlertSystem } from "@/components/alert-system"
import { alertManager } from "@/lib/services/alert-manager"
import Link from "next/link"

interface DuplicationAlert {
  id: string
  type: "exact" | "similar" | "potential"
  confidence: number
  originalDataset: any
  duplicateDataset: any
  recommendation: string
  createdAt: string
}

export default function DDASHomePage() {
  const [alerts, setAlerts] = useState<DuplicationAlert[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`) // Simulate user ID
  const [formData, setFormData] = useState({
    name: "",
    source: "",
    content: "",
    metadata: {
      title: "",
      description: "",
      author: "",
      organization: "",
      version: "1.0",
      license: "MIT",
      tags: [],
      columnCount: 0,
      rowCount: 0,
      dataTypes: {},
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Parse content as JSON to extract schema
      let parsedContent = []
      let dataTypes = {}

      try {
        parsedContent = JSON.parse(formData.content)
        if (parsedContent.length > 0) {
          const firstRow = parsedContent[0]
          dataTypes = Object.keys(firstRow).reduce(
            (acc, key) => {
              acc[key] = typeof firstRow[key]
              return acc
            },
            {} as Record<string, string>,
          )
        }
      } catch {
        // If not valid JSON, treat as text
        parsedContent = formData.content.split("\n").map((line) => ({ content: line }))
        dataTypes = { content: "string" }
      }

      const payload = {
        ...formData,
        content: parsedContent,
        metadata: {
          ...formData.metadata,
          columnCount: Object.keys(dataTypes).length,
          rowCount: parsedContent.length,
          dataTypes,
        },
      }

      const response = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.alerts && result.alerts.length > 0) {
        setAlerts(result.alerts)

        for (const alert of result.alerts) {
          await alertManager.processAlert(alert)
        }
      } else {
        setAlerts([])
      }
    } catch (error) {
      console.error("Error processing dataset:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "exact":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "similar":
        return <Info className="h-4 w-4 text-yellow-500" />
      case "potential":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "exact":
        return "destructive"
      case "similar":
        return "default"
      case "potential":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">DDAS</h1>
              <p className="text-sm text-muted-foreground">Data Download Duplication Alert System</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Intelligent Dataset Analysis</h2>
          <p className="text-muted-foreground">Advanced detection and prevention of duplicate dataset downloads</p>
        </div>

        <AlertSystem userId={userId} />

        <Card>
          <CardHeader>
            <CardTitle>Dataset Analysis</CardTitle>
            <CardDescription>
              Upload or paste your dataset information to check for potential duplicates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Dataset Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Dataset"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Source URL</label>
                  <Input
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="https://example.com/dataset.csv"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.metadata.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, title: e.target.value },
                      })
                    }
                    placeholder="Dataset Title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Author</label>
                  <Input
                    value={formData.metadata.author}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, author: e.target.value },
                      })
                    }
                    placeholder="Author Name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.metadata.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, description: e.target.value },
                    })
                  }
                  placeholder="Describe your dataset..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Dataset Content (JSON or Text)</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" disabled={isProcessing} className="w-full">
                {isProcessing ? "Analyzing..." : "Analyze Dataset"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Duplication Alerts
              </CardTitle>
              <CardDescription>Potential duplicates detected in your dataset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getAlertColor(alert.type) as any}>{alert.type.toUpperCase()}</Badge>
                        <span className="text-sm font-medium">{(alert.confidence * 100).toFixed(1)}% confidence</span>
                      </div>
                      <AlertDescription>
                        <strong>Similar to:</strong> {alert.originalDataset.name}
                        <br />
                        <strong>Recommendation:</strong> {alert.recommendation}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
