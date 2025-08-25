import type {
  Team,
  TeamMember,
  Project,
  KnowledgeBaseEntry,
  DatasetShare,
  Annotation,
  UsagePattern,
  ShareTarget,
  SharePermissions,
} from "../types/collaboration"

export class CollaborationManager {
  private teams: Map<string, Team> = new Map()
  private projects: Map<string, Project> = new Map()
  private knowledgeBase: Map<string, KnowledgeBaseEntry> = new Map()
  private shares: Map<string, DatasetShare> = new Map()
  private annotations: Map<string, Annotation[]> = new Map()
  private usagePatterns: UsagePattern[] = []

  /**
   * Team Management
   */
  async createTeam(team: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team> {
    const newTeam: Team = {
      ...team,
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.teams.set(newTeam.id, newTeam)
    return newTeam
  }

  async addTeamMember(teamId: string, member: Omit<TeamMember, "joinedAt">): Promise<void> {
    const team = this.teams.get(teamId)
    if (!team) throw new Error("Team not found")

    const newMember: TeamMember = {
      ...member,
      joinedAt: new Date(),
    }

    team.members.push(newMember)
    team.updatedAt = new Date()
    this.teams.set(teamId, team)
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const team = this.teams.get(teamId)
    if (!team) throw new Error("Team not found")

    team.members = team.members.filter((member) => member.userId !== userId)
    team.updatedAt = new Date()
    this.teams.set(teamId, team)
  }

  async getTeamsByUser(userId: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter((team) => team.members.some((member) => member.userId === userId))
  }

  /**
   * Project Management
   */
  async createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.projects.set(newProject.id, newProject)
    return newProject
  }

  async addProjectCollaborator(projectId: string, collaborator: any): Promise<void> {
    const project = this.projects.get(projectId)
    if (!project) throw new Error("Project not found")

    project.collaborators.push({
      ...collaborator,
      invitedAt: new Date(),
    })
    project.updatedAt = new Date()
    this.projects.set(projectId, project)
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.ownerId === userId || project.collaborators.some((collab) => collab.userId === userId),
    )
  }

  /**
   * Knowledge Base Management
   */
  async createKnowledgeEntry(
    entry: Omit<KnowledgeBaseEntry, "id" | "createdAt" | "updatedAt">,
  ): Promise<KnowledgeBaseEntry> {
    const newEntry: KnowledgeBaseEntry = {
      ...entry,
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      votes: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.knowledgeBase.set(newEntry.id, newEntry)
    return newEntry
  }

  async searchKnowledgeBase(
    query: string,
    filters?: { type?: string; tags?: string[] },
  ): Promise<KnowledgeBaseEntry[]> {
    const entries = Array.from(this.knowledgeBase.values())

    return entries.filter((entry) => {
      // Text search
      const matchesQuery =
        !query ||
        entry.title.toLowerCase().includes(query.toLowerCase()) ||
        entry.content.toLowerCase().includes(query.toLowerCase())

      // Type filter
      const matchesType = !filters?.type || entry.type === filters.type

      // Tags filter
      const matchesTags = !filters?.tags || filters.tags.some((tag) => entry.tags.includes(tag))

      return matchesQuery && matchesType && matchesTags
    })
  }

  async voteKnowledgeEntry(entryId: string, vote: 1 | -1): Promise<void> {
    const entry = this.knowledgeBase.get(entryId)
    if (!entry) throw new Error("Knowledge entry not found")

    entry.votes += vote
    entry.updatedAt = new Date()
    this.knowledgeBase.set(entryId, entry)
  }

  /**
   * Dataset Sharing
   */
  async shareDataset(
    datasetId: string,
    sharedBy: string,
    targets: ShareTarget[],
    permissions: SharePermissions,
    options?: { expiresAt?: Date; message?: string },
  ): Promise<DatasetShare> {
    const share: DatasetShare = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      datasetId,
      sharedBy,
      sharedWith: targets,
      permissions,
      expiresAt: options?.expiresAt,
      message: options?.message,
      createdAt: new Date(),
    }

    this.shares.set(share.id, share)
    return share
  }

  async getSharedDatasets(userId: string): Promise<DatasetShare[]> {
    return Array.from(this.shares.values()).filter((share) =>
      share.sharedWith.some((target) => (target.type === "user" && target.id === userId) || target.type === "public"),
    )
  }

  async revokeShare(shareId: string, userId: string): Promise<void> {
    const share = this.shares.get(shareId)
    if (!share) throw new Error("Share not found")
    if (share.sharedBy !== userId) throw new Error("Unauthorized")

    this.shares.delete(shareId)
  }

  /**
   * Annotations
   */
  async addAnnotation(annotation: Omit<Annotation, "id" | "createdAt" | "updatedAt">): Promise<Annotation> {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const datasetAnnotations = this.annotations.get(annotation.datasetId) || []
    datasetAnnotations.push(newAnnotation)
    this.annotations.set(annotation.datasetId, datasetAnnotations)

    return newAnnotation
  }

  async getAnnotations(datasetId: string, userId?: string): Promise<Annotation[]> {
    const annotations = this.annotations.get(datasetId) || []

    if (userId) {
      // Return public annotations and user's private annotations
      return annotations.filter((annotation) => annotation.isPublic || annotation.userId === userId)
    }

    // Return only public annotations
    return annotations.filter((annotation) => annotation.isPublic)
  }

  /**
   * Usage Analytics
   */
  async trackUsage(pattern: Omit<UsagePattern, "id" | "timestamp">): Promise<void> {
    const usagePattern: UsagePattern = {
      ...pattern,
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    this.usagePatterns.push(usagePattern)
  }

  async getUsagePatterns(filters?: {
    datasetId?: string
    userId?: string
    teamId?: string
    action?: string
    dateRange?: { start: Date; end: Date }
  }): Promise<UsagePattern[]> {
    let patterns = this.usagePatterns

    if (filters?.datasetId) {
      patterns = patterns.filter((p) => p.datasetId === filters.datasetId)
    }

    if (filters?.userId) {
      patterns = patterns.filter((p) => p.userId === filters.userId)
    }

    if (filters?.teamId) {
      patterns = patterns.filter((p) => p.teamId === filters.teamId)
    }

    if (filters?.action) {
      patterns = patterns.filter((p) => p.action === filters.action)
    }

    if (filters?.dateRange) {
      patterns = patterns.filter(
        (p) => p.timestamp >= filters.dateRange!.start && p.timestamp <= filters.dateRange!.end,
      )
    }

    return patterns
  }

  /**
   * Privacy and Access Control
   */
  async checkAccess(userId: string, resource: string, action: string): Promise<boolean> {
    // Simplified access control - in production, this would be more sophisticated
    const userTeams = await this.getTeamsByUser(userId)

    // Check if user has access through team membership
    for (const team of userTeams) {
      const member = team.members.find((m) => m.userId === userId)
      if (member) {
        // Check team permissions
        switch (action) {
          case "view":
            return team.permissions.canViewDatasets
          case "download":
            return team.permissions.canDownloadDatasets
          case "share":
            return team.permissions.canShareDatasets
          case "annotate":
            return team.permissions.canAnnotateDatasets
          default:
            return false
        }
      }
    }

    return false
  }

  /**
   * Collaboration Analytics
   */
  async getCollaborationStats(teamId?: string): Promise<any> {
    const patterns = teamId ? this.usagePatterns.filter((p) => p.teamId === teamId) : this.usagePatterns

    const stats = {
      totalActions: patterns.length,
      uniqueUsers: new Set(patterns.map((p) => p.userId)).size,
      uniqueDatasets: new Set(patterns.map((p) => p.datasetId)).size,
      actionBreakdown: {} as Record<string, number>,
      topUsers: {} as Record<string, number>,
      topDatasets: {} as Record<string, number>,
    }

    patterns.forEach((pattern) => {
      stats.actionBreakdown[pattern.action] = (stats.actionBreakdown[pattern.action] || 0) + 1
      stats.topUsers[pattern.userId] = (stats.topUsers[pattern.userId] || 0) + 1
      stats.topDatasets[pattern.datasetId] = (stats.topDatasets[pattern.datasetId] || 0) + 1
    })

    return stats
  }

  /**
   * Get all data for admin/debugging
   */
  async getAllTeams(): Promise<Team[]> {
    return Array.from(this.teams.values())
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
  }

  async getAllKnowledgeEntries(): Promise<KnowledgeBaseEntry[]> {
    return Array.from(this.knowledgeBase.values())
  }
}

// Global collaboration manager instance
export const collaborationManager = new CollaborationManager()
