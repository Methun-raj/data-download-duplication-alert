"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Network, Zap, Maximize2 } from "lucide-react"

interface NetworkNode {
  id: string
  name: string
  type: "dataset" | "source" | "transformation"
  size: number
  connections: number
  metadata: {
    format: string
    organization: string
    lastUpdated: string
  }
}

interface NetworkEdge {
  from: string
  to: string
  type: "derived_from" | "similar_to" | "transformed_by"
  strength: number
}

const mockNodes: NetworkNode[] = [
  {
    id: "ds1",
    name: "Customer Analytics",
    type: "dataset",
    size: 1200,
    connections: 5,
    metadata: { format: "CSV", organization: "Marketing", lastUpdated: "2024-01-15" },
  },
  {
    id: "ds2",
    name: "Sales Data Q4",
    type: "dataset",
    size: 800,
    connections: 3,
    metadata: { format: "JSON", organization: "Sales", lastUpdated: "2024-01-14" },
  },
  {
    id: "ds3",
    name: "User Behavior",
    type: "dataset",
    size: 2100,
    connections: 7,
    metadata: { format: "Parquet", organization: "Analytics", lastUpdated: "2024-01-16" },
  },
  {
    id: "src1",
    name: "CRM System",
    type: "source",
    size: 500,
    connections: 2,
    metadata: { format: "API", organization: "IT", lastUpdated: "2024-01-16" },
  },
  {
    id: "tf1",
    name: "Data Cleaner",
    type: "transformation",
    size: 300,
    connections: 4,
    metadata: { format: "Pipeline", organization: "Engineering", lastUpdated: "2024-01-15" },
  },
]

const mockEdges: NetworkEdge[] = [
  { from: "src1", to: "ds1", type: "derived_from", strength: 0.9 },
  { from: "ds1", to: "ds2", type: "similar_to", strength: 0.7 },
  { from: "ds1", to: "tf1", type: "transformed_by", strength: 0.8 },
  { from: "tf1", to: "ds3", type: "derived_from", strength: 0.95 },
  { from: "ds2", to: "ds3", type: "similar_to", strength: 0.6 },
]

export function NetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    // Filter nodes based on selected type
    const filteredNodes = filterType === "all" ? mockNodes : mockNodes.filter((node) => node.type === filterType)

    // Simple force-directed layout simulation
    const centerX = canvas.offsetWidth / 2
    const centerY = canvas.offsetHeight / 2
    const radius = Math.min(centerX, centerY) * 0.6

    // Position nodes in a circle for simplicity
    filteredNodes.forEach((node, index) => {
      const angle = (index / filteredNodes.length) * 2 * Math.PI
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Draw edges first (behind nodes)
      mockEdges.forEach((edge) => {
        if (edge.from === node.id || edge.to === node.id) {
          const otherNodeId = edge.from === node.id ? edge.to : edge.from
          const otherNodeIndex = filteredNodes.findIndex((n) => n.id === otherNodeId)

          if (otherNodeIndex !== -1) {
            const otherAngle = (otherNodeIndex / filteredNodes.length) * 2 * Math.PI
            const otherX = centerX + Math.cos(otherAngle) * radius
            const otherY = centerY + Math.sin(otherAngle) * radius

            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(otherX, otherY)
            ctx.strokeStyle = getEdgeColor(edge.type)
            ctx.lineWidth = edge.strength * 3
            ctx.globalAlpha = 0.6
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      })

      // Draw node
      ctx.beginPath()
      const nodeRadius = Math.sqrt(node.size / 100) + 10
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI)
      ctx.fillStyle = getNodeColor(node.type)
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw node label
      ctx.fillStyle = "#1f2937"
      ctx.font = "12px DM Sans"
      ctx.textAlign = "center"
      ctx.fillText(node.name, x, y + nodeRadius + 15)
    })
  }, [filterType])

  const getNodeColor = (type: string) => {
    switch (type) {
      case "dataset":
        return "#8b5cf6" // accent color
      case "source":
        return "#3b82f6" // chart-2
      case "transformation":
        return "#10b981" // chart-3
      default:
        return "#6b7280" // secondary
    }
  }

  const getEdgeColor = (type: string) => {
    switch (type) {
      case "derived_from":
        return "#3b82f6"
      case "similar_to":
        return "#f59e0b"
      case "transformed_by":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Simple hit detection (would be more sophisticated in a real implementation)
    const centerX = canvas.offsetWidth / 2
    const centerY = canvas.offsetHeight / 2
    const radius = Math.min(centerX, centerY) * 0.6

    const filteredNodes = filterType === "all" ? mockNodes : mockNodes.filter((node) => node.type === filterType)

    filteredNodes.forEach((node, index) => {
      const angle = (index / filteredNodes.length) * 2 * Math.PI
      const nodeX = centerX + Math.cos(angle) * radius
      const nodeY = centerY + Math.sin(angle) * radius
      const nodeRadius = Math.sqrt(node.size / 100) + 10

      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2)
      if (distance <= nodeRadius) {
        setSelectedNode(node)
      }
    })
  }

  return (
    <Card className={isFullscreen ? "fixed inset-0 z-50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Dataset Relationship Network
            </CardTitle>
            <CardDescription>Interactive visualization of dataset connections and lineage</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dataset">Datasets</SelectItem>
                <SelectItem value="source">Sources</SelectItem>
                <SelectItem value="transformation">Transforms</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <canvas
              ref={canvasRef}
              className="w-full h-[400px] border rounded-lg cursor-pointer"
              onClick={handleCanvasClick}
            />
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span>Datasets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-2" />
                <span>Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-3" />
                <span>Transformations</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {selectedNode ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{selectedNode.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedNode.type}</Badge>
                    <Badge variant="secondary">{selectedNode.connections} connections</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Format:</span> {selectedNode.metadata.format}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Organization:</span> {selectedNode.metadata.organization}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Size:</span> {selectedNode.size} MB
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Last Updated:</span> {selectedNode.metadata.lastUpdated}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">Click on a node to view details</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Network Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Nodes:</span>
                  <span className="font-medium">{mockNodes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Connections:</span>
                  <span className="font-medium">{mockEdges.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Connections:</span>
                  <span className="font-medium">
                    {(mockNodes.reduce((sum, node) => sum + node.connections, 0) / mockNodes.length).toFixed(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
