"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewStats } from "@/components/dashboard/overview-stats"
import { UsageAnalytics } from "@/components/dashboard/usage-analytics"
import { NetworkVisualization } from "@/components/dashboard/network-visualization"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { TeamManagement } from "@/components/collaboration/team-management"
import { KnowledgeBase } from "@/components/collaboration/knowledge-base"
import { DatasetSharing } from "@/components/collaboration/dataset-sharing"
import { SecurityDashboard } from "@/components/security/security-dashboard"
import { AIRecommendations } from "@/components/ai/ai-recommendations"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("overview")
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const userId = "user_123" // In real app, get from auth

  const handleRefresh = () => {
    setLastRefresh(new Date())
    // In a real app, this would trigger data refresh
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground">Real-time insights into your data duplication detection system</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Refresh
                </Button>
              </div>
            </div>
            <OverviewStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UsageAnalytics />
              <NetworkVisualization />
            </div>
          </div>
        )
      case "analytics":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Usage Analytics</h1>
            <UsageAnalytics />
          </div>
        )
      case "network":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Dataset Network</h1>
            <NetworkVisualization />
          </div>
        )
      case "collaboration":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Collaboration</h1>
            <Tabs defaultValue="teams" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="teams">Teams</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
                <TabsTrigger value="sharing">Dataset Sharing</TabsTrigger>
              </TabsList>
              <TabsContent value="teams">
                <TeamManagement />
              </TabsContent>
              <TabsContent value="knowledge">
                <KnowledgeBase />
              </TabsContent>
              <TabsContent value="sharing">
                <DatasetSharing />
              </TabsContent>
            </Tabs>
          </div>
        )
      case "security":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Security & Compliance</h1>
            <SecurityDashboard />
          </div>
        )
      case "ai":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">AI Recommendations</h1>
            <AIRecommendations />
          </div>
        )
      default:
        return <div>Section not found</div>
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
    </div>
  )
}
