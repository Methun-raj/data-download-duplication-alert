"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Plus, Settings, Crown, Shield, Eye, UserPlus } from "lucide-react"
import type { Team } from "@/lib/types/collaboration"

interface TeamManagementProps {
  userId: string
}

export function TeamManagement({ userId }: TeamManagementProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    organizationId: "org_1", // Simplified for demo
    departmentId: "",
  })
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "member" as "owner" | "admin" | "member" | "viewer",
  })

  useEffect(() => {
    loadTeams()
  }, [userId])

  const loadTeams = async () => {
    try {
      const response = await fetch(`/api/collaboration/teams?userId=${userId}`)
      const data = await response.json()
      setTeams(data.teams || [])
      if (data.teams?.length > 0 && !selectedTeam) {
        setSelectedTeam(data.teams[0])
      }
    } catch (error) {
      console.error("Failed to load teams:", error)
    }
  }

  const createTeam = async () => {
    try {
      const teamData = {
        ...newTeam,
        members: [
          {
            userId,
            username: "Current User", // In real app, get from auth
            email: "user@example.com",
            role: "owner" as const,
            permissions: [],
          },
        ],
        permissions: {
          canViewDatasets: true,
          canDownloadDatasets: true,
          canShareDatasets: true,
          canAnnotateDatasets: true,
          canCreateProjects: true,
          canInviteMembers: true,
        },
      }

      const response = await fetch("/api/collaboration/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      })

      const result = await response.json()
      if (result.success) {
        await loadTeams()
        setIsCreateDialogOpen(false)
        setNewTeam({ name: "", description: "", organizationId: "org_1", departmentId: "" })
      }
    } catch (error) {
      console.error("Failed to create team:", error)
    }
  }

  const inviteMember = async () => {
    if (!selectedTeam) return

    try {
      // In a real implementation, this would send an invitation
      console.log("Inviting member:", inviteData)
      setIsInviteDialogOpen(false)
      setInviteData({ email: "", role: "member" })
    } catch (error) {
      console.error("Failed to invite member:", error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />
      case "admin":
        return <Shield className="h-3 w-3" />
      case "member":
        return <Users className="h-3 w-3" />
      case "viewer":
        return <Eye className="h-3 w-3" />
      default:
        return <Users className="h-3 w-3" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      case "member":
        return "outline"
      case "viewer":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Manage your teams and collaborate on datasets</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Set up a new team for dataset collaboration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Data Science Team"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Team focused on machine learning and analytics..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createTeam} disabled={!newTeam.name}>
                  Create Team
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Teams</CardTitle>
            <CardDescription>Teams you're a member of</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTeam?.id === team.id ? "bg-accent" : "hover:bg-muted"
                }`}
                onClick={() => setSelectedTeam(team)}
              >
                <div className="font-medium">{team.name}</div>
                <div className="text-sm text-muted-foreground">{team.members.length} members</div>
              </div>
            ))}
            {teams.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No teams yet</p>}
          </CardContent>
        </Card>

        {/* Team Details */}
        {selectedTeam && (
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedTeam.name}</CardTitle>
                    <CardDescription>{selectedTeam.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Team Member</DialogTitle>
                          <DialogDescription>Invite someone to join {selectedTeam.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                              type="email"
                              value={inviteData.email}
                              onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                              placeholder="colleague@example.com"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Role</label>
                            <Select
                              value={inviteData.role}
                              onValueChange={(value: any) => setInviteData({ ...inviteData, role: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={inviteMember} disabled={!inviteData.email}>
                              Send Invitation
                            </Button>
                            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Team Members ({selectedTeam.members.length})</h4>
                    <div className="space-y-2">
                      {selectedTeam.members.map((member) => (
                        <div key={member.userId} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{member.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{member.username}</div>
                              <div className="text-xs text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                          <Badge variant={getRoleBadgeVariant(member.role) as any} className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Team Permissions</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selectedTeam.permissions.canViewDatasets ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        View Datasets
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selectedTeam.permissions.canDownloadDatasets ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        Download Datasets
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selectedTeam.permissions.canShareDatasets ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        Share Datasets
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selectedTeam.permissions.canAnnotateDatasets ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        Annotate Datasets
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
