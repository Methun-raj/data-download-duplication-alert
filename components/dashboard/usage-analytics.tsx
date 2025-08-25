"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, Users, TrendingUp } from "lucide-react"

const downloadTrendData = [
  { month: "Jan", downloads: 1200, duplicates: 45 },
  { month: "Feb", downloads: 1350, duplicates: 38 },
  { month: "Mar", downloads: 1100, duplicates: 52 },
  { month: "Apr", downloads: 1450, duplicates: 41 },
  { month: "May", downloads: 1600, duplicates: 35 },
  { month: "Jun", downloads: 1750, duplicates: 29 },
]

const userActivityData = [
  { hour: "00", active: 12 },
  { hour: "04", active: 8 },
  { hour: "08", active: 45 },
  { hour: "12", active: 78 },
  { hour: "16", active: 92 },
  { hour: "20", active: 56 },
]

const datasetCategoryData = [
  { name: "Financial", value: 35, color: "var(--chart-1)" },
  { name: "Healthcare", value: 28, color: "var(--chart-2)" },
  { name: "Marketing", value: 22, color: "var(--chart-3)" },
  { name: "Operations", value: 15, color: "var(--chart-4)" },
]

const storageOptimizationData = [
  { category: "Original Size", size: 2400, optimized: 1800 },
  { category: "Deduplicated", size: 1800, optimized: 1200 },
  { category: "Compressed", size: 1200, optimized: 800 },
  { category: "Final Storage", size: 800, optimized: 800 },
]

export function DownloadTrends() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Trends
        </CardTitle>
        <CardDescription>Dataset downloads and duplicate detection over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            downloads: {
              label: "Downloads",
              color: "var(--chart-1)",
            },
            duplicates: {
              label: "Duplicates Prevented",
              color: "var(--chart-5)",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={downloadTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="downloads"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-1)", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="duplicates"
                stroke="var(--chart-5)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-5)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function UserActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Activity Patterns
        </CardTitle>
        <CardDescription>Active users throughout the day</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            active: {
              label: "Active Users",
              color: "var(--chart-2)",
            },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hour" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="active" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function DatasetCategories() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset Categories</CardTitle>
        <CardDescription>Distribution of datasets by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            financial: { label: "Financial", color: "var(--chart-1)" },
            healthcare: { label: "Healthcare", color: "var(--chart-2)" },
            marketing: { label: "Marketing", color: "var(--chart-3)" },
            operations: { label: "Operations", color: "var(--chart-4)" },
          }}
          className="h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datasetCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {datasetCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {datasetCategoryData.map((category) => (
            <div key={category.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
              <span className="text-sm">{category.name}</span>
              <span className="text-sm text-muted-foreground ml-auto">{category.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function StorageOptimization() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Storage Optimization
        </CardTitle>
        <CardDescription>Storage savings through deduplication and compression</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            size: {
              label: "Original Size (GB)",
              color: "var(--chart-4)",
            },
            optimized: {
              label: "Optimized Size (GB)",
              color: "var(--chart-3)",
            },
          }}
          className="h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={storageOptimizationData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" />
              <YAxis dataKey="category" type="category" stroke="var(--muted-foreground)" width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="size" fill="var(--chart-4)" name="Original Size" />
              <Bar dataKey="optimized" fill="var(--chart-3)" name="Optimized Size" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function UsageAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DownloadTrends />
        <UserActivity />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DatasetCategories />
        <StorageOptimization />
      </div>
    </div>
  )
}
