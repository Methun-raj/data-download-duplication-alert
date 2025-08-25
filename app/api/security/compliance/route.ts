import { type NextRequest, NextResponse } from "next/server"
import { SecurityManager } from "@/lib/services/security-manager"

const securityManager = new SecurityManager({
  encryption: {
    algorithm: "AES-256-GCM",
    keyRotationInterval: 86400000,
    saltRounds: 12,
  },
  authentication: {
    mfaRequired: true,
    sessionTimeout: 3600000,
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5,
    },
  },
  compliance: {
    gdprEnabled: true,
    ccpaEnabled: true,
    hipaaEnabled: false,
    soc2Enabled: true,
    dataRetentionDays: 2555,
  },
  monitoring: {
    auditLogging: true,
    threatDetection: true,
    anomalyThreshold: 0.7,
    alertChannels: ["email", "slack", "webhook"],
  },
})

export async function POST(request: NextRequest) {
  try {
    const { type, startDate, endDate } = await request.json()

    const period = {
      start: new Date(startDate),
      end: new Date(endDate),
    }

    const report = await securityManager.generateComplianceReport(type, period)

    return NextResponse.json({ success: true, data: report })
  } catch (error) {
    console.error("Compliance report generation error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate compliance report" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    // Return compliance status overview
    const complianceStatus = {
      gdpr: { status: "compliant", lastAssessment: new Date(), score: 95 },
      ccpa: { status: "compliant", lastAssessment: new Date(), score: 92 },
      hipaa: { status: "not_applicable", lastAssessment: null, score: null },
      soc2: { status: "warning", lastAssessment: new Date(), score: 87 },
    }

    if (type && complianceStatus[type as keyof typeof complianceStatus]) {
      return NextResponse.json({
        success: true,
        data: complianceStatus[type as keyof typeof complianceStatus],
      })
    }

    return NextResponse.json({ success: true, data: complianceStatus })
  } catch (error) {
    console.error("Compliance status error:", error)
    return NextResponse.json({ success: false, error: "Failed to retrieve compliance status" }, { status: 500 })
  }
}
