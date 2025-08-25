// Core types for the DDAS system
export interface Dataset {
  id: string
  name: string
  source: string
  size: number
  format: string
  createdAt: Date
  modifiedAt: Date
  fingerprint: DatasetFingerprint
  metadata: DatasetMetadata
}

export interface DatasetFingerprint {
  contentHash: string
  schemaHash: string
  statisticalHash: string
  merkleRoot?: string
  bloomFilter?: string
  similarity?: SimilarityMetrics
}

export interface SimilarityMetrics {
  jaccard: number
  cosine: number
  structural: number
  semantic: number
  confidence: number
}

export interface DatasetMetadata {
  title: string
  description: string
  author: string
  organization: string
  version: string
  doi?: string
  license: string
  tags: string[]
  columnCount: number
  rowCount: number
  dataTypes: Record<string, string>
  provenance: ProvenanceInfo
}

export interface ProvenanceInfo {
  sourceUrl: string
  downloadedAt: Date
  transformations: string[]
  lineage: string[]
  quality: QualityMetrics
}

export interface QualityMetrics {
  completeness: number
  consistency: number
  accuracy: number
  freshness: number
  validity: number
}

export interface DuplicationAlert {
  id: string
  type: "exact" | "similar" | "potential"
  confidence: number
  originalDataset: Dataset
  duplicateDataset: Dataset
  similarities: SimilarityMetrics
  recommendation: string
  createdAt: Date
}
