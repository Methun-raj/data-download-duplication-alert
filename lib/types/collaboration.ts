// Collaboration and sharing types
export interface Team {
  id: string
  name: string
  description: string
  organizationId: string
  departmentId?: string
  members: TeamMember[]
  permissions: TeamPermissions
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  userId: string
  username: string
  email: string
  role: "owner" | "admin" | "member" | "viewer"
  joinedAt: Date
  permissions: UserPermissions[]
}

export interface TeamPermissions {
  canViewDatasets: boolean
  canDownloadDatasets: boolean
  canShareDatasets: boolean
  canAnnotateDatasets: boolean
  canCreateProjects: boolean
  canInviteMembers: boolean
}

export interface UserPermissions {
  resource: string
  actions: string[]
  conditions?: Record<string, any>
}

export interface Project {
  id: string
  name: string
  description: string
  teamId: string
  ownerId: string
  datasets: string[]
  collaborators: ProjectCollaborator[]
  status: "active" | "archived" | "completed"
  visibility: "private" | "team" | "organization" | "public"
  createdAt: Date
  updatedAt: Date
}

export interface ProjectCollaborator {
  userId: string
  role: "owner" | "editor" | "viewer"
  permissions: string[]
  invitedAt: Date
  acceptedAt?: Date
}

export interface KnowledgeBaseEntry {
  id: string
  title: string
  content: string
  type: "best_practice" | "tutorial" | "documentation" | "faq"
  tags: string[]
  authorId: string
  teamId?: string
  organizationId: string
  relatedDatasets: string[]
  votes: number
  views: number
  createdAt: Date
  updatedAt: Date
}

export interface DatasetShare {
  id: string
  datasetId: string
  sharedBy: string
  sharedWith: ShareTarget[]
  permissions: SharePermissions
  expiresAt?: Date
  message?: string
  createdAt: Date
}

export interface ShareTarget {
  type: "user" | "team" | "organization" | "public"
  id: string
  name: string
}

export interface SharePermissions {
  canView: boolean
  canDownload: boolean
  canAnnotate: boolean
  canReshare: boolean
  requiresApproval: boolean
}

export interface Annotation {
  id: string
  datasetId: string
  userId: string
  type: "comment" | "tag" | "rating" | "bookmark"
  content: string
  metadata?: Record<string, any>
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UsagePattern {
  id: string
  datasetId: string
  userId: string
  teamId: string
  action: "view" | "download" | "share" | "annotate"
  context: Record<string, any>
  timestamp: Date
}

export interface FederatedConnection {
  id: string
  name: string
  type: "organization" | "public_catalog" | "research_institution"
  endpoint: string
  authConfig: Record<string, any>
  trustLevel: number
  isActive: boolean
  lastSync: Date
}
