import { type NextRequest, NextResponse } from "next/server"
import { collaborationManager } from "@/lib/services/collaboration-manager"

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json()
    const project = await collaborationManager.createProject(projectData)

    return NextResponse.json({
      success: true,
      project,
      message: "Project created successfully",
    })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (userId) {
      const projects = await collaborationManager.getProjectsByUser(userId)
      return NextResponse.json({ projects })
    }

    const allProjects = await collaborationManager.getAllProjects()
    return NextResponse.json({ projects: allProjects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
