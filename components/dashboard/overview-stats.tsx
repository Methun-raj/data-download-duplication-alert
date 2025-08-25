"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Database, AlertTriangle, Users, Activity } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  description?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

function StatCard({ title, value, change, description, icon, trend = "neutral" }: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-chart-3"
      case "down":
        return "text-chart-5"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" />
      case "down":
        return <TrendingDown className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {change > 0 ? "+" : ""}
              {change}%
            </span>
            {description && <span className="text-muted-foreground">from last month</span>}
          </div>
        )}
        {description && change === undefined && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

export function OverviewStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Datasets" value="2,847" change={12.5} icon={<Database className="h-4 w-4" />} trend="up" />
      <StatCard
        title="Duplicates Detected"
        value="156"
        change={-8.2}
        icon={<AlertTriangle className="h-4 w-4" />}
        trend="down"
      />
      <StatCard title="Active Users" value="1,234" change={5.7} icon={<Users className="h-4 w-4" />} trend="up" />
      <StatCard
        title="System Health"
        value="98.5%"
        description="All systems operational"
        icon={<Activity className="h-4 w-4" />}
        trend="neutral"
      />
    </div>
  )
}

export function SystemHealth() {
  const healthMetrics = [
    { name: "API Response Time", value: 95, status: "excellent" },
    { name: "Database Performance", value: 88, status: "good" },
    { name: "Storage Utilization", value: 72, status: "good" },
    { name: "Alert Processing", value: 99, status: "excellent" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-chart-3"
      case "good":
        return "bg-chart-2"
      case "warning":
        return "bg-chart-4"
      case "critical":
        return "bg-chart-5"
      default:
        return "bg-muted"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-chart-3 text-white">Excellent</Badge>
      case "good":
        return <Badge className="bg-chart-2 text-white">Good</Badge>
      case "warning":
        return <Badge className="bg-chart-4 text-white">Warning</Badge>
      case "critical":
        return <Badge className="bg-chart-5 text-white">Critical</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health Metrics
        </CardTitle>
        <CardDescription>Real-time monitoring of system performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {healthMetrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{metric.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{metric.value}%</span>
                {getStatusBadge(metric.status)}
              </div>
            </div>
            <Progress
              value={metric.value}
              className="h-2"
              style={{
                background: `linear-gradient(to right, ${getStatusColor(metric.status)} ${metric.value}%, var(--muted) ${metric.value}%)`,
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
