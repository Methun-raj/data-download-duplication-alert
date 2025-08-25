// Extended metadata types for comprehensive repository
export interface ExtendedDatasetMetadata {
  // Basic metadata
  id: string
  title: string
  description: string
  author: string
  organization: string
  version: string

  // Technical metadata
  technical: TechnicalMetadata

  // Business metadata
  business: BusinessMetadata

  // Collaborative metadata
  collaborative: CollaborativeMetadata

  // Versioning and evolution
  versioning: VersioningMetadata

  // Provenance information
  provenance: ProvenanceGraph

  // Search and indexing
  searchMetadata: SearchMetadata

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface TechnicalMetadata {
  format: string
  encoding: string
  compression: CompressionInfo
  size: number
  checksum: string
  schema: SchemaInfo
  dataQuality: DataQualityMetrics
  performance: PerformanceMetrics
}

export interface CompressionInfo {
  algorithm: string
  ratio: number
  originalSize: number
  compressedSize: number
}

export interface SchemaInfo {
  columns: ColumnDefinition[]
  primaryKeys: string[]
  foreignKeys: ForeignKeyDefinition[]
  indexes: IndexDefinition[]
  constraints: ConstraintDefinition[]
}

export interface ColumnDefinition {
  name: string
  type: string
  nullable: boolean
  defaultValue?: any
  description?: string
  tags: string[]
}

export interface ForeignKeyDefinition {
  column: string
  referencedTable: string
  referencedColumn: string
}

export interface IndexDefinition {
  name: string
  columns: string[]
  type: "btree" | "hash" | "gin" | "gist"
  unique: boolean
}

export interface ConstraintDefinition {
  name: string
  type: "check" | "unique" | "not_null"
  definition: string
}

export interface DataQualityMetrics {
  completeness: number
  consistency: number
  accuracy: number
  validity: number
  uniqueness: number
  timeliness: number
}

export interface PerformanceMetrics {
  queryTime: number
  indexUsage: Record<string, number>
  scanRatio: number
  cacheHitRatio: number
}

export interface BusinessMetadata {
  domain: string
  category: string
  businessGlossary: BusinessGlossaryTerm[]
  dataClassification: DataClassification
  usagePatterns: UsagePattern[]
  costInformation: CostInformation
}

export interface BusinessGlossaryTerm {
  term: string
  definition: string
  synonyms: string[]
  relatedTerms: string[]
}

export interface DataClassification {
  sensitivityLevel: "public" | "internal" | "confidential" | "restricted"
  dataTypes: string[]
  regulations: string[]
  retentionPeriod: number
}

export interface UsagePattern {
  userId: string
  accessFrequency: number
  queryPatterns: string[]
  downloadCount: number
  lastAccessed: Date
}

export interface CostInformation {
  storageCost: number
  bandwidthCost: number
  computeCost: number
  totalCost: number
  currency: string
}

export interface CollaborativeMetadata {
  annotations: UserAnnotation[]
  tags: TagInfo[]
  ratings: RatingInfo[]
  comments: CommentInfo[]
  recommendations: RecommendationInfo[]
}

export interface UserAnnotation {
  id: string
  userId: string
  content: string
  type: "note" | "warning" | "tip"
  createdAt: Date
}

export interface TagInfo {
  tag: string
  userId: string
  createdAt: Date
  votes: number
}

export interface RatingInfo {
  userId: string
  rating: number
  review?: string
  createdAt: Date
}

export interface CommentInfo {
  id: string
  userId: string
  content: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface RecommendationInfo {
  userId: string
  type: "usage" | "integration" | "alternative"
  content: string
  upvotes: number
  downvotes: number
}

export interface VersioningMetadata {
  currentVersion: string
  versionHistory: VersionInfo[]
  semanticVersion: SemanticVersion
  changeLog: ChangeLogEntry[]
  backwardsCompatible: boolean
}

export interface VersionInfo {
  version: string
  createdAt: Date
  author: string
  changes: string[]
  breaking: boolean
}

export interface SemanticVersion {
  major: number
  minor: number
  patch: number
  prerelease?: string
  build?: string
}

export interface ChangeLogEntry {
  version: string
  type: "added" | "changed" | "deprecated" | "removed" | "fixed" | "security"
  description: string
  impact: "low" | "medium" | "high"
  createdAt: Date
}

export interface ProvenanceGraph {
  nodes: ProvenanceNode[]
  edges: ProvenanceEdge[]
  lineage: LineageInfo[]
}

export interface ProvenanceNode {
  id: string
  type: "dataset" | "transformation" | "source" | "sink"
  name: string
  metadata: Record<string, any>
}

export interface ProvenanceEdge {
  from: string
  to: string
  type: "derived_from" | "transformed_by" | "merged_with" | "split_from"
  metadata: Record<string, any>
}

export interface LineageInfo {
  upstream: string[]
  downstream: string[]
  transformations: TransformationInfo[]
}

export interface TransformationInfo {
  id: string
  type: string
  description: string
  parameters: Record<string, any>
  timestamp: Date
}

export interface SearchMetadata {
  fullTextIndex: string[]
  facets: Record<string, string[]>
  embeddings: number[]
  searchTags: string[]
  popularity: number
}
