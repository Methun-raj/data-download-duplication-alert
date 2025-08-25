"use client"

import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Bell, CheckCircle, Info, X } from "lucide-react"
import type { DuplicationAlert } from "@/lib/types/dataset"

interface AlertNotification {
  id: string
  alert: DuplicationAlert
  channels: string[]
  status: string
  createdAt: string
}

interface AlertSystemProps {
  userId: string
}

export function AlertSystem({ userId }: AlertSystemProps) {
  const [notifications, setNotifications] = useState<AlertNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    // Initialize WebSocket connection
    const connectWebSocket = () => {
      const websocket = new WebSocket(`ws://localhost:3000/api/websocket?userId=${userId}`)

      websocket.onopen = () => {
        setIsConnected(true)
        console.log("WebSocket connected")
      }

      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data)

        if (message.type === "duplication_alert") {
          handleRealTimeAlert(message.data)
        }
      }

      websocket.onclose = () => {
        setIsConnected(false)
        console.log("WebSocket disconnected")

        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000)
      }

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      setWs(websocket)
    }

    connectWebSocket()

    // Subscribe to alerts
    subscribeToAlerts()

    // Load existing notifications
    loadNotifications()

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [userId])

  const handleRealTimeAlert = (alertData: any) => {
    const { alert, severity } = alertData

    // Show toast notification
    toast({
      title: `${alert.type.toUpperCase()} Duplicate Detected`,
      description: alert.recommendation,
      variant: severity === "critical" ? "destructive" : "default",
    })

    // Show desktop notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Dataset Duplication Alert - ${alert.type.toUpperCase()}`, {
        body: alert.recommendation,
        icon: getAlertIcon(alert.type),
      })
    }

    // Add to notifications list
    const notification: AlertNotification = {
      id: `notif_${Date.now()}`,
      alert,
      channels: ["websocket", "toast", "desktop"],
      status: "sent",
      createdAt: new Date().toISOString(),
    }

    setNotifications((prev) => [notification, ...prev])
  }

  const subscribeToAlerts = async () => {
    try {
      await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          channels: [
            { type: "websocket", config: { userId } },
            { type: "toast", config: { duration: 5000 } },
            { type: "desktop", config: {} },
          ],
          filters: [{ type: "confidence", operator: "gt", value: 0.5 }],
        }),
      })
    } catch (error) {
      console.error("Failed to subscribe to alerts:", error)
    }
  }

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/alerts/subscribe?userId=${userId}`)
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("Failed to load notifications:", error)
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive desktop notifications for dataset duplicates.",
        })
      }
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "exact":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "similar":
        return <Info className="h-4 w-4 text-yellow-500" />
      case "potential":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "exact":
        return "destructive"
      case "similar":
        return "default"
      case "potential":
        return "secondary"
      default:
        return "default"
    }
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Real-Time Alert System
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </CardTitle>
          <CardDescription>Live monitoring for dataset duplication alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={requestNotificationPermission} variant="outline" size="sm">
              Enable Desktop Notifications
            </Button>
            <Button onClick={loadNotifications} variant="outline" size="sm">
              Refresh Notifications
            </Button>
          </div>
        </CardContent>
      </Card>

      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts ({notifications.length})</CardTitle>
            <CardDescription>Latest duplication alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.slice(0, 10).map((notification) => (
              <Alert key={notification.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="flex items-start gap-3 pr-8">
                  {getAlertIcon(notification.alert.type)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getAlertColor(notification.alert.type) as any}>
                        {notification.alert.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">
                        {(notification.alert.confidence * 100).toFixed(1)}% confidence
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <AlertDescription>
                      <strong>Similar to:</strong> {notification.alert.originalDataset.name}
                      <br />
                      <strong>Recommendation:</strong> {notification.alert.recommendation}
                    </AlertDescription>
                    <div className="flex gap-1">
                      {notification.channels.map((channel) => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
