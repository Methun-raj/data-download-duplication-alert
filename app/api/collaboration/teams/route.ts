import { type NextRequest, NextResponse } from "next/server"
import { collaborationManager } from "@/lib/services/collaboration-manager"

export async function POST(request: NextRequest) {
  try {
    const teamData = await request.json()
    const team = await collaborationManager.createTeam(teamData)

    return NextResponse.json({
      success: true,
      team,
      message: "Team created successfully",
    })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (userId) {
      const teams = await collaborationManager.getTeamsByUser(userId)
      return NextResponse.json({ teams })
    }

    const allTeams = await collaborationManager.getAllTeams()
    return NextResponse.json({ teams: allTeams })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}
