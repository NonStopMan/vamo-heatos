export type HealthStatus = 'ok' | 'error'

export type HealthCheckStatus = 'ok' | 'error' | 'disabled'

export type HealthCheckResult = {
  status: HealthCheckStatus
  message?: string
}

export type HealthResponse = {
  status: HealthStatus
  checks: {
    mongodb: HealthCheckResult
    salesforce: HealthCheckResult
  }
  timestamp: string
}
