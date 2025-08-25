"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  Database,
  Network,
  AlertTriangle,
  Users,
  Settings,
  Search,
  Bell,
  Activity,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  Brain,
} from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const navigationItems = [
  { id: "overview", label: "Overview", icon: BarChart3, badge: null },
  { id: "datasets", label: "Datasets", icon: Database, badge: "2,847" },
  { id: "network", label: "Network View", icon: Network, badge: null },
  { id: "analytics", label: "Analytics", icon: Activity, badge: null },
  { id: "ai", label: "AI Recommendations", icon: Brain, badge: "New" },
  { id: "alerts", label: "Alerts", icon: AlertTriangle, badge: "12" },
  { id: "collaboration", label: "Collaboration", icon: UserCheck, badge: null },
  { id: "security", label: "Security", icon: Shield, badge: "2" },
  { id: "users", label: "Users", icon: Users, badge: null },
  { id: "search", label: "Search", icon: Search, badge: null },
  { id: "notifications", label: "Notifications", icon: Bell, badge: "3" },
  { id: "settings", label: "Settings", icon: Settings, badge: null },
]

export function DashboardSidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">DDAS Dashboard</h2>
            <p className="text-xs text-muted-foreground">Data Duplication Alert System</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                } ${isCollapsed ? "px-2" : "px-3"}`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>
              System Status: <span className="text-chart-3">Healthy</span>
            </div>
            <div>Last Update: 2 min ago</div>
            <div>Version: 2.1.0</div>
          </div>
        </div>
      )}
    </div>
  )
}
