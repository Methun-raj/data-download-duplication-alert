import { type NextRequest, NextResponse } from "next/server"
import { alertManager } from "@/lib/services/alert-manager"
import type { AlertSubscription } from "@/lib/services/alert-manager"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, channels, filters } = body

    const subscription: AlertSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      channels: channels || [{ type: "websocket", config: { userId } }],
      filters: filters || [],
      isActive: true,
    }

    alertManager.subscribe(subscription)

    return NextResponse.json({
      subscription,
      message: "Successfully subscribed to alerts",
    })
  } catch (error) {
    console.error("Error creating alert subscription:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const notifications = alertManager.getNotifications(userId || undefined)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
