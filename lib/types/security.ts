export interface SecurityConfig {
  encryption: {
    algorithm: "AES-256-GCM" | "ChaCha20-Poly1305"
    keyRotationInterval: number
    saltRounds: number
  }
  authentication: {
    mfaRequired: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordPolicy: PasswordPolicy
  }
  compliance: {
    gdprEnabled: boolean
    ccpaEnabled: boolean
    hipaaEnabled: boolean
    soc2Enabled: boolean
    dataRetentionDays: number
  }
  monitoring: {
    auditLogging: boolean
    threatDetection: boolean
    anomalyThreshold: number
    alertChannels: string[]
  }
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventReuse: number
}

export interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  action: string
  resource: string
  ipAddress: string
  userAgent: string
  success: boolean
  details: Record<string, any>
  riskScore: number
}

export interface ComplianceReport {
  id: string
  type: "GDPR" | "CCPA" | "HIPAA" | "SOC2"
  generatedAt: Date
  period: { start: Date; end: Date }
  status: "compliant" | "non-compliant" | "warning"
  findings: ComplianceFinding[]
  recommendations: string[]
}

export interface ComplianceFinding {
  severity: "low" | "medium" | "high" | "critical"
  category: string
  description: string
  affectedResources: string[]
  remediation: string
}

export interface PrivacySettings {
  dataMinimization: boolean
  piiDetection: boolean
  anonymization: boolean
  rightToErasure: boolean
  consentManagement: boolean
  dataPortability: boolean
}
