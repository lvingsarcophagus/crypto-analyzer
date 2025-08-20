// Real-time monitoring system for crypto risk changes
export interface MonitoringAlert {
  id: string
  token_id: string
  alert_type: "RISK_INCREASE" | "RISK_DECREASE" | "DATA_ANOMALY" | "MARKET_EVENT"
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  message: string
  timestamp: string
  auto_resolved: boolean
}

export interface MonitoringConfig {
  token_id: string
  risk_threshold_increase: number // Alert if risk increases by this amount
  risk_threshold_decrease: number // Alert if risk decreases by this amount
  price_volatility_threshold: number
  volume_change_threshold: number
  check_interval_minutes: number
}

export class RealTimeMonitor {
  private static monitoringConfigs: Map<string, MonitoringConfig> = new Map()
  private static activeAlerts: Map<string, MonitoringAlert[]> = new Map()
  private static lastRiskScores: Map<string, number> = new Map()

  static addTokenToMonitoring(config: MonitoringConfig): void {
    this.monitoringConfigs.set(config.token_id, config)

    // Initialize alerts array if not exists
    if (!this.activeAlerts.has(config.token_id)) {
      this.activeAlerts.set(config.token_id, [])
    }
  }

  static removeTokenFromMonitoring(tokenId: string): void {
    this.monitoringConfigs.delete(tokenId)
    this.activeAlerts.delete(tokenId)
    this.lastRiskScores.delete(tokenId)
  }

  static async checkAllMonitoredTokens(): Promise<MonitoringAlert[]> {
    const newAlerts: MonitoringAlert[] = []

    for (const [tokenId, config] of this.monitoringConfigs.entries()) {
      try {
        const alerts = await this.checkTokenForAlerts(tokenId, config)
        newAlerts.push(...alerts)
      } catch (error) {
        console.error(`Error monitoring token ${tokenId}:`, error)

        // Create error alert
        const errorAlert: MonitoringAlert = {
          id: `error_${tokenId}_${Date.now()}`,
          token_id: tokenId,
          alert_type: "DATA_ANOMALY",
          severity: "MEDIUM",
          message: "Failed to fetch monitoring data",
          timestamp: new Date().toISOString(),
          auto_resolved: false,
        }
        newAlerts.push(errorAlert)
      }
    }

    return newAlerts
  }

  private static async checkTokenForAlerts(tokenId: string, config: MonitoringConfig): Promise<MonitoringAlert[]> {
    const alerts: MonitoringAlert[] = []

    // Get current risk analysis
    const currentAnalysis = await this.getCurrentRiskAnalysis(tokenId)
    const lastScore = this.lastRiskScores.get(tokenId)

    if (lastScore !== undefined) {
      const scoreChange = currentAnalysis.overall_score - lastScore

      // Check for significant risk increases
      if (scoreChange >= config.risk_threshold_increase) {
        alerts.push({
          id: `risk_increase_${tokenId}_${Date.now()}`,
          token_id: tokenId,
          alert_type: "RISK_INCREASE",
          severity: this.determineSeverity(scoreChange, "increase"),
          message: `Risk score increased by ${scoreChange.toFixed(1)} points to ${currentAnalysis.overall_score}`,
          timestamp: new Date().toISOString(),
          auto_resolved: false,
        })
      }

      // Check for significant risk decreases
      if (Math.abs(scoreChange) >= config.risk_threshold_decrease && scoreChange < 0) {
        alerts.push({
          id: `risk_decrease_${tokenId}_${Date.now()}`,
          token_id: tokenId,
          alert_type: "RISK_DECREASE",
          severity: "LOW",
          message: `Risk score decreased by ${Math.abs(scoreChange).toFixed(1)} points to ${currentAnalysis.overall_score}`,
          timestamp: new Date().toISOString(),
          auto_resolved: false,
        })
      }
    }

    // Update last known score
    this.lastRiskScores.set(tokenId, currentAnalysis.overall_score)

    // Check for market events and anomalies
    const marketAlerts = await this.checkMarketEvents(tokenId, config)
    alerts.push(...marketAlerts)

    // Store new alerts
    const existingAlerts = this.activeAlerts.get(tokenId) || []
    this.activeAlerts.set(tokenId, [...existingAlerts, ...alerts])

    return alerts
  }

  private static async getCurrentRiskAnalysis(tokenId: string): Promise<any> {
    // This would call the actual risk analysis API
    // Mock implementation for now
    return {
      overall_score: 50 + Math.random() * 50, // Random score between 50-100
      risk_level: "MEDIUM",
    }
  }

  private static async checkMarketEvents(tokenId: string, config: MonitoringConfig): Promise<MonitoringAlert[]> {
    const alerts: MonitoringAlert[] = []

    // Mock market event detection
    // In real implementation, this would check for:
    // - Unusual volume spikes
    // - Price volatility events
    // - Large wallet movements
    // - Social media sentiment changes

    if (Math.random() < 0.1) {
      // 10% chance of market event
      alerts.push({
        id: `market_event_${tokenId}_${Date.now()}`,
        token_id: tokenId,
        alert_type: "MARKET_EVENT",
        severity: "MEDIUM",
        message: "Unusual market activity detected",
        timestamp: new Date().toISOString(),
        auto_resolved: false,
      })
    }

    return alerts
  }

  private static determineSeverity(scoreChange: number, type: "increase" | "decrease"): MonitoringAlert["severity"] {
    const absChange = Math.abs(scoreChange)

    if (absChange >= 30) return "CRITICAL"
    if (absChange >= 20) return "HIGH"
    if (absChange >= 10) return "MEDIUM"
    return "LOW"
  }

  static getActiveAlerts(tokenId?: string): MonitoringAlert[] {
    if (tokenId) {
      return this.activeAlerts.get(tokenId) || []
    }

    // Return all alerts
    const allAlerts: MonitoringAlert[] = []
    for (const alerts of this.activeAlerts.values()) {
      allAlerts.push(...alerts)
    }

    return allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  static resolveAlert(alertId: string): boolean {
    for (const [tokenId, alerts] of this.activeAlerts.entries()) {
      const alertIndex = alerts.findIndex((alert) => alert.id === alertId)
      if (alertIndex !== -1) {
        alerts[alertIndex].auto_resolved = true
        return true
      }
    }
    return false
  }

  static clearResolvedAlerts(): number {
    let clearedCount = 0

    for (const [tokenId, alerts] of this.activeAlerts.entries()) {
      const unresolvedAlerts = alerts.filter((alert) => !alert.auto_resolved)
      clearedCount += alerts.length - unresolvedAlerts.length
      this.activeAlerts.set(tokenId, unresolvedAlerts)
    }

    return clearedCount
  }
}
