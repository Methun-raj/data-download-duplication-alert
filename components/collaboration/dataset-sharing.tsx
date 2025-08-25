"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Users, Globe, Lock, Mail } from "lucide-react"
import type { DatasetShare, ShareTarget, SharePermissions } from "@/lib/types/collaboration"

interface DatasetSharingProps {
  userId: string
  datasetId?: string
}

export function DatasetSharing({ userId, datasetId }: DatasetSharingProps) {
  const [shares, setShares] = useState<DatasetShare[]>([])
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareData, setShareData] = useState({
    targetType: "user" as "user" | "team" | "organization" | "public",
    targetId: "",
    targetName: "",
    message: "",
    expiresIn: "never",
  })
  const [permissions, setPermissions] = useState<SharePermissions>({
    canView: true,
    canDownload: false,
    canAnnotate: false,
    canReshare: false,
    requiresApproval: false,
  })

  useEffect(() => {
    loadShares()
  }, [userId])

  const loadShares = async () => {
    try {
      const response = await fetch(`/api/collaboration/share?userId=${userId}`)
      const data = await response.json()
      setShares(data.shares || [])
    } catch (error) {
      console.error("Failed to load shares:", error)
    }
  }

  const shareDataset = async () => {
    if (!datasetId) return

    try {
      const targets: ShareTarget[] = [
        {
          type: shareData.targetType,
          id: shareData.targetId || "public",
          name: shareData.targetName || "Public",
        },
      ]

      const options: any = {
        message: shareData.message || undefined,
      }

      if (shareData.expiresIn !== "never") {
        const days = Number.parseInt(shareData.expiresIn)
        options.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      }

      const response = await fetch("/api/collaboration/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId,
          sharedBy: userId,
          targets,
          permissions,
          options,
        }),
      })

      const result = await response.json()
      if (result.success) {
        await loadShares()
        setIsShareDialogOpen(false)
        resetShareForm()
      }
    } catch (error) {
      console.error("Failed to share dataset:", error)
    }
  }

  const resetShareForm = () => {
    setShareData({
      targetType: "user",
      targetId: "",
      targetName: "",
      message: "",
      expiresIn: "never",
    })
    setPermissions({
      canView: true,
      canDownload: false,
      canAnnotate: false,
      canReshare: false,
      requiresApproval: false,
    })
  }

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="h-4 w-4" />
      case "team":
        return <Users className="h-4 w-4" />
      case "organization":
        return <Users className="h-4 w-4" />
      case "public":
        return <Globe className="h-4 w-4" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  const getTargetBadgeVariant = (type: string) => {
    switch (type) {
      case "public":
        return "default"
      case "organization":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dataset Sharing</h2>
          <p className="text-muted-foreground">Share datasets with teams, organizations, or make them public</p>
        </div>
        {datasetId && (
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Share Dataset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Share Dataset</DialogTitle>
                <DialogDescription>Configure sharing settings and permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Share Target */}
                <div className="space-y-4">
                  <h4 className="font-medium">Share With</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Target Type</label>
                      <Select
                        value={shareData.targetType}
                        onValueChange={(value: any) => setShareData({ ...shareData, targetType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Specific User</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                          <SelectItem value="organization">Organization</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {shareData.targetType !== "public" && (
                      <div>
                        <label className="text-sm font-medium">
                          {shareData.targetType === "user" ? "Email" : "Name"}
                        </label>
                        <Input
                          value={shareData.targetId}
                          onChange={(e) => setShareData({ ...shareData, targetId: e.target.value })}
                          placeholder={
                            shareData.targetType === "user" ? "user@example.com" : "Team or organization name"
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h4 className="font-medium">Permissions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canView"
                        checked={permissions.canView}
                        onCheckedChange={(checked) => setPermissions({ ...permissions, canView: checked as boolean })}
                      />
                      <label htmlFor="canView" className="text-sm">
                        Can view dataset metadata and details
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canDownload"
                        checked={permissions.canDownload}
                        onCheckedChange={(checked) =>
                          setPermissions({ ...permissions, canDownload: checked as boolean })
                        }
                      />
                      <label htmlFor="canDownload" className="text-sm">
                        Can download dataset
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canAnnotate"
                        checked={permissions.canAnnotate}
                        onCheckedChange={(checked) =>
                          setPermissions({ ...permissions, canAnnotate: checked as boolean })
                        }
                      />
                      <label htmlFor="canAnnotate" className="text-sm">
                        Can add annotations and comments
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canReshare"
                        checked={permissions.canReshare}
                        onCheckedChange={(checked) =>
                          setPermissions({ ...permissions, canReshare: checked as boolean })
                        }
                      />
                      <label htmlFor="canReshare" className="text-sm">
                        Can reshare with others
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresApproval"
                        checked={permissions.requiresApproval}
                        onCheckedChange={(checked) =>
                          setPermissions({ ...permissions, requiresApproval: checked as boolean })
                        }
                      />
                      <label htmlFor="requiresApproval" className="text-sm">
                        Requires approval before access
                      </label>
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Expires In</label>
                    <Select
                      value={shareData.expiresIn}
                      onValueChange={(value) => setShareData({ ...shareData, expiresIn: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message (Optional)</label>
                    <Textarea
                      value={shareData.message}
                      onChange={(e) => setShareData({ ...shareData, message: e.target.value })}
                      placeholder="Add a message for the recipients..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={shareDataset}>Share Dataset</Button>
                  <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Shared Datasets */}
      <div className="grid gap-4">
        {shares.map((share) => (
          <Card key={share.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Dataset: {share.datasetId}</CardTitle>
                  <CardDescription>
                    Shared {new Date(share.createdAt).toLocaleDateString()}
                    {share.expiresAt && ` • Expires ${new Date(share.expiresAt).toLocaleDateString()}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {share.sharedWith.map((target, index) => (
                    <Badge
                      key={index}
                      variant={getTargetBadgeVariant(target.type) as any}
                      className="flex items-center gap-1"
                    >
                      {getTargetIcon(target.type)}
                      {target.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {share.message && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">{share.message}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {share.permissions.canView && <Badge variant="outline">View</Badge>}
                  {share.permissions.canDownload && <Badge variant="outline">Download</Badge>}
                  {share.permissions.canAnnotate && <Badge variant="outline">Annotate</Badge>}
                  {share.permissions.canReshare && <Badge variant="outline">Reshare</Badge>}
                  {share.permissions.requiresApproval && <Badge variant="outline">Requires Approval</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {shares.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No shared datasets</p>
              <p className="text-sm text-muted-foreground mt-1">Start sharing datasets to collaborate with your team</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
