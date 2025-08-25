import crypto from "crypto"
import type { SecurityConfig, AuditLog, ComplianceReport } from "@/lib/types/security"

export class SecurityManager {
  private config: SecurityConfig
  private auditLogs: AuditLog[] = []

  constructor(config: SecurityConfig) {
    this.config = config
  }

  // Encryption Services
  async encryptData(data: string, key?: string): Promise<{ encrypted: string; iv: string; tag: string }> {
    const algorithm = "aes-256-gcm"
    const encryptionKey = key || crypto.randomBytes(32)
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipher(algorithm, encryptionKey)
    cipher.setAAD(Buffer.from("ddas-metadata"))

    let encrypted = cipher.update(data, "utf8", "hex")
    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    }
  }

  async decryptData(encryptedData: string, key: string, iv: string, tag: string): Promise<string> {
    const algorithm = "aes-256-gcm"
    const decipher = crypto.createDecipher(algorithm, key)

    decipher.setAAD(Buffer.from("ddas-metadata"))
    decipher.setAuthTag(Buffer.from(tag, "hex"))

    let decrypted = decipher.update(encryptedData, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }

  // Authentication & Authorization
  validatePasswordPolicy(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const policy = this.config.authentication.passwordPolicy

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters`)
    }
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain uppercase letters")
    }
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain lowercase letters")
    }
    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push("Password must contain numbers")
    }
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain special characters")
    }

    return { valid: errors.length === 0, errors }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto.pbkdf2Sync(password, salt, this.config.encryption.saltRounds, 64, "sha512")
    return `${salt}:${hash.toString("hex")}`
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(":")
    const verifyHash = crypto.pbkdf2Sync(password, salt, this.config.encryption.saltRounds, 64, "sha512")
    return hash === verifyHash.toString("hex")
  }

  // Privacy Protection
  detectPII(data: any): { hasPII: boolean; piiFields: string[]; confidence: number } {
    const piiPatterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b\d{3}-?\d{3}-?\d{4}\b/g,
      ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
      creditCard: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
      ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    }

    const piiFields: string[] = []
    const dataString = JSON.stringify(data)

    for (const [type, pattern] of Object.entries(piiPatterns)) {
      if (pattern.test(dataString)) {
        piiFields.push(type)
      }
    }

    return {
      hasPII: piiFields.length > 0,
      piiFields,
      confidence: piiFields.length > 0 ? Math.min(piiFields.length * 0.3, 1) : 0,
    }
  }

  anonymizeData(data: any, fields: string[]): any {
    const anonymized = { ...data }

    fields.forEach((field) => {
      if (anonymized[field]) {
        if (typeof anonymized[field] === "string") {
          anonymized[field] = "*".repeat(anonymized[field].length)
        } else {
          anonymized[field] = "[REDACTED]"
        }
      }
    })

    return anonymized
  }

  // Audit Logging
  async logActivity(activity: Omit<AuditLog, "id" | "timestamp" | "riskScore">): Promise<void> {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      riskScore: this.calculateRiskScore(activity),
      ...activity,
    }

    this.auditLogs.push(auditLog)

    // In production, this would write to a secure audit database
    if (auditLog.riskScore > this.config.monitoring.anomalyThreshold) {
      await this.triggerSecurityAlert(auditLog)
    }
  }

  private calculateRiskScore(activity: Omit<AuditLog, "id" | "timestamp" | "riskScore">): number {
    let score = 0

    // Failed actions increase risk
    if (!activity.success) score += 0.3

    // Sensitive actions increase risk
    const sensitiveActions = ["delete", "export", "share", "modify_permissions"]
    if (sensitiveActions.some((action) => activity.action.toLowerCase().includes(action))) {
      score += 0.4
    }

    // Off-hours access increases risk
    const hour = new Date().getHours()
    if (hour < 6 || hour > 22) score += 0.2

    // Multiple rapid actions increase risk
    const recentLogs = this.auditLogs.filter(
      (log) => log.userId === activity.userId && Date.now() - log.timestamp.getTime() < 60000, // Last minute
    )
    if (recentLogs.length > 10) score += 0.3

    return Math.min(score, 1)
  }

  private async triggerSecurityAlert(auditLog: AuditLog): Promise<void> {
    // In production, this would send alerts via configured channels
    console.log(`[SECURITY ALERT] High-risk activity detected:`, {
      user: auditLog.userId,
      action: auditLog.action,
      riskScore: auditLog.riskScore,
      timestamp: auditLog.timestamp,
    })
  }

  // Compliance Reporting
  async generateComplianceReport(
    type: "GDPR" | "CCPA" | "HIPAA" | "SOC2",
    period: { start: Date; end: Date },
  ): Promise<ComplianceReport> {
    const findings = await this.assessCompliance(type, period)

    return {
      id: crypto.randomUUID(),
      type,
      generatedAt: new Date(),
      period,
      status: findings.some((f) => f.severity === "critical")
        ? "non-compliant"
        : findings.some((f) => f.severity === "high")
          ? "warning"
          : "compliant",
      findings,
      recommendations: this.generateRecommendations(findings),
    }
  }

  private async assessCompliance(type: string, period: { start: Date; end: Date }) {
    // Simplified compliance assessment - in production this would be much more comprehensive
    const findings = []

    // Check encryption
    if (!this.config.encryption) {
      findings.push({
        severity: "critical" as const,
        category: "Data Protection",
        description: "Data encryption not properly configured",
        affectedResources: ["metadata", "user_data"],
        remediation: "Enable AES-256 encryption for all sensitive data",
      })
    }

    // Check audit logging
    if (!this.config.monitoring.auditLogging) {
      findings.push({
        severity: "high" as const,
        category: "Monitoring",
        description: "Audit logging is disabled",
        affectedResources: ["system"],
        remediation: "Enable comprehensive audit logging",
      })
    }

    return findings
  }

  private generateRecommendations(findings: any[]): string[] {
    const recommendations = [
      "Implement regular security assessments",
      "Conduct employee security training",
      "Review and update access controls quarterly",
      "Establish incident response procedures",
    ]

    if (findings.some((f) => f.category === "Data Protection")) {
      recommendations.push("Enhance data encryption and key management")
    }

    if (findings.some((f) => f.category === "Monitoring")) {
      recommendations.push("Improve security monitoring and alerting")
    }

    return recommendations
  }
}
