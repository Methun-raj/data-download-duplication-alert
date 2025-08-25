"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, TrendingUp, MessageSquare, Star, Download, Database, Send } from "lucide-react"

interface Recommendation {
  id: string
  title: string
  description: string
  relevanceScore: number
  qualityScore: number
  recommendationType: string
  reasons: string[]
  metadata: {
    size: number
    format: string
    downloadCount: number
    tags: string[]
  }
}

interface PredictiveInsight {
  id: string
  type: string
  title: string
  description: string
  confidence: number
  impact: string
  suggestedActions: string[]
}

interface ConversationalQuery {
  query: string
  response: string
  suggestions: string[]
  results?: any[]
}

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [insights, setInsights] = useState<PredictiveInsight[]>([])
  const [conversationHistory, setConversationHistory] = useState<ConversationalQuery[]>([])
  const [currentQuery, setCurrentQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAIData()
  }, [])

  const fetchAIData = async () => {
    try {
      const [recsRes, insightsRes] = await Promise.all([
        fetch("/api/ai/recommendations?userId=user_123"),
        fetch("/api/ai/insights?userId=user_123"),
      ])

      const recsData = await recsRes.json()
      const insightsData = await insightsRes.json()

      if (recsData.success) setRecommendations(recsData.data)
      if (insightsData.success) setInsights(insightsData.data)
    } catch (error) {
      console.error("Failed to fetch AI data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConversationalQuery = async () => {
    if (!currentQuery.trim()) return

    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery, userId: "user_123" }),
      })

      const data = await response.json()
      if (data.success) {
        setConversationHistory((prev) => [...prev, data.data])
        setCurrentQuery("")
      }
    } catch (error) {
      console.error("Failed to process query:", error)
    }
  }

  const getRecommendationTypeColor = (type: string) => {
    switch (type) {
      case "similar":
        return "bg-blue-100 text-blue-800"
      case "collaborative":
        return "bg-green-100 text-green-800"
      case "trending":
        return "bg-orange-100 text-orange-800"
      case "quality":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI-Powered Recommendations</h2>
          <p className="text-muted-foreground">Intelligent dataset discovery and quality insights</p>
        </div>
        <Button onClick={fetchAIData} variant="outline">
          <Brain className="h-4 w-4 mr-2" />
          Refresh AI
        </Button>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <CardDescription className="mt-1">{rec.description}</CardDescription>
                    </div>
                    <Badge className={getRecommendationTypeColor(rec.recommendationType)}>
                      {rec.recommendationType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Relevance</span>
                      </div>
                      <Progress value={rec.relevanceScore * 100} className="mt-1" />
                      <span className="text-xs text-muted-foreground">{Math.round(rec.relevanceScore * 100)}%</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Quality</span>
                      </div>
                      <Progress value={rec.qualityScore * 100} className="mt-1" />
                      <span className="text-xs text-muted-foreground">{Math.round(rec.qualityScore * 100)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Why recommended:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {rec.reasons.map((reason, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {rec.metadata.downloadCount.toLocaleString()}
                      </span>
                      <span>{rec.metadata.format}</span>
                      <span>{(rec.metadata.size / 1000000).toFixed(1)}MB</span>
                    </div>
                    <Button size="sm">View Dataset</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle>{insight.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{Math.round(insight.confidence * 100)}% confidence</Badge>
                    <Badge className={`${getImpactColor(insight.impact)} bg-transparent border-current`}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                </div>
                <CardDescription>{insight.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Suggested Actions:</h4>
                  <ul className="space-y-2">
                    {insight.suggestedActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Assistant
              </CardTitle>
              <CardDescription>Ask questions about your datasets in natural language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversationHistory.map((conv, index) => (
                  <div key={index} className="space-y-2">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium">You:</p>
                      <p className="text-sm">{conv.query}</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-sm font-medium">AI Assistant:</p>
                      <p className="text-sm">{conv.response}</p>
                      {conv.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium">Suggestions:</p>
                          {conv.suggestions.map((suggestion, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="text-xs mr-2 mb-1 bg-transparent"
                              onClick={() => setCurrentQuery(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ask me about datasets, quality, or recommendations..."
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleConversationalQuery()}
                />
                <Button onClick={handleConversationalQuery}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Quality Analysis</CardTitle>
              <CardDescription>AI-powered data quality assessment and monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a dataset to view detailed quality analysis</p>
                <Button className="mt-4 bg-transparent" variant="outline">
                  Choose Dataset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
