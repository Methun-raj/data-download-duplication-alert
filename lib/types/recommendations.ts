export interface DatasetRecommendation {
  id: string
  datasetId: string
  title: string
  description: string
  relevanceScore: number
  qualityScore: number
  freshnessScore: number
  usageScore: number
  recommendationType: "similar" | "collaborative" | "trending" | "quality" | "alternative"
  reasons: string[]
  metadata: {
    size: number
    format: string
    lastUpdated: Date
    downloadCount: number
    tags: string[]
  }
}

export interface QualityAssessment {
  datasetId: string
  overallScore: number
  completeness: number
  consistency: number
  accuracy: number
  freshness: number
  relevance: number
  usability: number
  issues: QualityIssue[]
  recommendations: string[]
  lastAssessed: Date
}

export interface QualityIssue {
  severity: "low" | "medium" | "high" | "critical"
  category: "completeness" | "consistency" | "accuracy" | "format" | "schema"
  description: string
  affectedColumns: string[]
  suggestedFix: string
}

export interface PredictiveInsight {
  id: string
  type: "usage_trend" | "quality_degradation" | "storage_optimization" | "duplicate_risk"
  title: string
  description: string
  confidence: number
  impact: "low" | "medium" | "high"
  timeframe: string
  actionable: boolean
  suggestedActions: string[]
  dataPoints: { date: Date; value: number }[]
}

export interface ConversationalQuery {
  id: string
  query: string
  intent: "find_dataset" | "compare_datasets" | "quality_check" | "usage_stats" | "recommendations"
  entities: { type: string; value: string }[]
  response: string
  suggestions: string[]
  results?: any[]
}
