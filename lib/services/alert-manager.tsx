import type { DuplicationAlert } from "../types/dataset"

export interface AlertSubscription {
  id: string
  userId: string
  channels: AlertChannel[]
  filters: AlertFilter[]
  isActive: boolean
}

export interface AlertChannel {
  type: "websocket" | "email" | "webhook" | "desktop" | "toast"
  config: Record<string, any>
}

export interface AlertFilter {
  type: "confidence" | "dataset_type" | "organization" | "tags"
  operator: "gt" | "lt" | "eq" | "contains"
  value: any
}

export interface AlertNotification {
  id: string
  alert: DuplicationAlert
  channels: string[]
  status: "pending" | "sent" | "failed"
  createdAt: Date
  sentAt?: Date
  error?: string
}

export class AlertManager {
  private subscriptions: Map<string, AlertSubscription> = new Map()
  private notifications: AlertNotification[] = []
  private websocketClients: Map<string, WebSocket> = new Map()

  /**
   * Subscribe to alerts with specific channels and filters
   */
  subscribe(subscription: AlertSubscription): void {
    this.subscriptions.set(subscription.id, subscription)
  }

  /**
   * Unsubscribe from alerts
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId)
  }

  /**
   * Process and distribute alert to all matching subscriptions
   */
  async processAlert(alert: DuplicationAlert): Promise<void> {
    const matchingSubscriptions = this.getMatchingSubscriptions(alert)

    for (const subscription of matchingSubscriptions) {
      const notification: AlertNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        alert,
        channels: subscription.channels.map((c) => c.type),
        status: "pending",
        createdAt: new Date(),
      }

      this.notifications.push(notification)

      try {
        await this.sendNotification(notification, subscription)
        notification.status = "sent"
        notification.sentAt = new Date()
      } catch (error) {
        notification.status = "failed"
        notification.error = error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  /**
   * Find subscriptions that match the alert criteria
   */
  private getMatchingSubscriptions(alert: DuplicationAlert): AlertSubscription[] {
    return Array.from(this.subscriptions.values()).filter((subscription) => {
      if (!subscription.isActive) return false

      return subscription.filters.every((filter) => this.matchesFilter(alert, filter))
    })
  }

  /**
   * Check if alert matches a specific filter
   */
  private matchesFilter(alert: DuplicationAlert, filter: AlertFilter): boolean {
    let value: any

    switch (filter.type) {
      case "confidence":
        value = alert.confidence
        break
      case "dataset_type":
        value = alert.duplicateDataset.format
        break
      case "organization":
        value = alert.duplicateDataset.metadata.organization
        break
      case "tags":
        value = alert.duplicateDataset.metadata.tags
        break
      default:
        return true
    }

    switch (filter.operator) {
      case "gt":
        return value > filter.value
      case "lt":
        return value < filter.value
      case "eq":
        return value === filter.value
      case "contains":
        return Array.isArray(value) ? value.some((v) => v.includes(filter.value)) : String(value).includes(filter.value)
      default:
        return true
    }
  }

  /**
   * Send notification through specified channels
   */
  private async sendNotification(notification: AlertNotification, subscription: AlertSubscription): Promise<void> {
    const promises = subscription.channels.map((channel) => this.sendToChannel(notification, channel))

    await Promise.all(promises)
  }

  /**
   * Send notification to a specific channel
   */
  private async sendToChannel(notification: AlertNotification, channel: AlertChannel): Promise<void> {
    switch (channel.type) {
      case "websocket":
        this.sendWebSocketNotification(notification, channel.config)
        break
      case "email":
        await this.sendEmailNotification(notification, channel.config)
        break
      case "webhook":
        await this.sendWebhookNotification(notification, channel.config)
        break
      case "desktop":
        this.sendDesktopNotification(notification, channel.config)
        break
      case "toast":
        this.sendToastNotification(notification, channel.config)
        break
    }
  }

  /**
   * Send WebSocket notification
   */
  private sendWebSocketNotification(notification: AlertNotification, config: any): void {
    const message = {
      type: "duplication_alert",
      data: {
        alert: notification.alert,
        timestamp: new Date().toISOString(),
        severity: this.getAlertSeverity(notification.alert),
      },
    }

    // Broadcast to all connected clients or specific user
    if (config.userId) {
      const client = this.websocketClients.get(config.userId)
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    } else {
      // Broadcast to all clients
      this.websocketClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message))
        }
      })
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: AlertNotification, config: any): Promise<void> {
    const emailContent = this.generateEmailContent(notification.alert)

    // In a real implementation, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Sending email to ${config.email}:`, emailContent)

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(notification: AlertNotification, config: any): Promise<void> {
    const payload = {
      event: "duplication_alert",
      alert: notification.alert,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(notification.alert),
    }

    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.headers || {}),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
    }
  }

  /**
   * Send desktop notification (browser API)
   */
  private sendDesktopNotification(notification: AlertNotification, config: any): void {
    // This would be handled on the client side
    const notificationData = {
      type: "desktop",
      title: `Dataset Duplication Alert - ${notification.alert.type.toUpperCase()}`,
      body: notification.alert.recommendation,
      icon: this.getAlertIcon(notification.alert.type),
      data: notification.alert,
    }

    // Store for client-side pickup
    if (typeof window !== "undefined" && "Notification" in window) {
      new Notification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
      })
    }
  }

  /**
   * Send toast notification
   */
  private sendToastNotification(notification: AlertNotification, config: any): void {
    // This would be handled by the UI toast system
    const toastData = {
      type: "toast",
      variant: this.getToastVariant(notification.alert.type),
      title: `${notification.alert.type.toUpperCase()} Duplicate Detected`,
      description: notification.alert.recommendation,
      duration: config.duration || 5000,
      data: notification.alert,
    }

    // In a real implementation, this would trigger the toast system
    console.log("Toast notification:", toastData)
  }

  /**
   * Generate email content for alert
   */
  private generateEmailContent(alert: DuplicationAlert): string {
    return `
      <h2>Dataset Duplication Alert</h2>
      <p><strong>Alert Type:</strong> ${alert.type.toUpperCase()}</p>
      <p><strong>Confidence:</strong> ${(alert.confidence * 100).toFixed(1)}%</p>
      <p><strong>Original Dataset:</strong> ${alert.originalDataset.name}</p>
      <p><strong>Duplicate Dataset:</strong> ${alert.duplicateDataset.name}</p>
      <p><strong>Recommendation:</strong> ${alert.recommendation}</p>
      <p><strong>Detected At:</strong> ${alert.createdAt.toISOString()}</p>
      
      <h3>Similarity Metrics:</h3>
      <ul>
        <li>Jaccard Similarity: ${(alert.similarities.jaccard * 100).toFixed(1)}%</li>
        <li>Cosine Similarity: ${(alert.similarities.cosine * 100).toFixed(1)}%</li>
        <li>Structural Similarity: ${(alert.similarities.structural * 100).toFixed(1)}%</li>
        <li>Semantic Similarity: ${(alert.similarities.semantic * 100).toFixed(1)}%</li>
      </ul>
    `
  }

  /**
   * Get alert severity level
   */
  private getAlertSeverity(alert: DuplicationAlert): "low" | "medium" | "high" | "critical" {
    switch (alert.type) {
      case "exact":
        return "critical"
      case "similar":
        return "high"
      case "potential":
        return "medium"
      default:
        return "low"
    }
  }

  /**
   * Get alert icon for notifications
   */
  private getAlertIcon(type: string): string {
    switch (type) {
      case "exact":
        return "/icons/alert-triangle.svg"
      case "similar":
        return "/icons/info.svg"
      case "potential":
        return "/icons/check-circle.svg"
      default:
        return "/icons/bell.svg"
    }
  }

  /**
   * Get toast variant for UI
   */
  private getToastVariant(type: string): "default" | "destructive" {
    return type === "exact" ? "destructive" : "default"
  }

  /**
   * Register WebSocket client
   */
  registerWebSocketClient(userId: string, ws: WebSocket): void {
    this.websocketClients.set(userId, ws)

    ws.on("close", () => {
      this.websocketClients.delete(userId)
    })
  }

  /**
   * Get notification history
   */
  getNotifications(userId?: string): AlertNotification[] {
    return this.notifications.filter(
      (notification) => !userId || this.subscriptions.get(notification.id)?.userId === userId,
    )
  }
}

// Global alert manager instance
export const alertManager = new AlertManager()
