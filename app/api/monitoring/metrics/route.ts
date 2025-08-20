import { type NextRequest, NextResponse } from "next/server"
import { IntegratedRiskAnalysisService } from "@/lib/integrated-risk-service"

// Global monitoring state (in production, this would be in a database)
const monitoringState = {
  activeTokens: new Set<string>(),
  lastUpdate: new Date(),
  alertThresholds: {
    critical_risk_score: 80,
    high_risk_score: 60,
    price_deviation: 0.15,
    volume_drop: 0.5
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tokenIds = url.searchParams.get('tokens')?.split(',') || []
    
    if (tokenIds.length === 0) {
      return NextResponse.json({
        active_monitoring: Array.from(monitoringState.activeTokens),
        last_update: monitoringState.lastUpdate,
        alert_thresholds: monitoringState.alertThresholds,
        cache_stats: IntegratedRiskAnalysisService.getCacheStats()
      })
    }

    // Get current metrics for specified tokens
    const metricsPromises = tokenIds.map(async (tokenId) => {
      try {
        const analysis = await IntegratedRiskAnalysisService.analyzeToken({
          tokenId: tokenId.trim(),
          includeHistorical: false,
          config: {
            enableCrossValidation: true,
            enableRealTimeMonitoring: false,
            cacheDuration: 5, // Short cache for monitoring
            maxRetries: 2
          }
        })

        return {
          token_id: tokenId,
          current_risk_score: analysis.risk_analysis.overall_score,
          risk_level: analysis.risk_analysis.risk_level,
          confidence_score: analysis.risk_analysis.confidence_metrics.overall_confidence,
          price_data: analysis.price_validation,
          active_warnings: analysis.risk_analysis.real_time_alerts.active_warnings,
          monitoring_flags: analysis.risk_analysis.real_time_alerts.monitoring_flags,
          last_updated: new Date().toISOString()
        }
      } catch (error) {
        return {
          token_id: tokenId,
          error: `Failed to get metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
          last_updated: new Date().toISOString()
        }
      }
    })

    const metrics = await Promise.all(metricsPromises)

    // Check for alerts
    const alerts = metrics.filter(metric => 
      !metric.error && (
        metric.current_risk_score >= monitoringState.alertThresholds.critical_risk_score ||
        metric.risk_level === 'CRITICAL' ||
        (metric.price_data?.price_deviation || 0) > monitoringState.alertThresholds.price_deviation
      )
    )

    return NextResponse.json({
      metrics,
      alerts: alerts.map(alert => ({
        token_id: alert.token_id,
        alert_type: alert.current_risk_score >= monitoringState.alertThresholds.critical_risk_score ? 'HIGH_RISK' : 'PRICE_DEVIATION',
        severity: alert.risk_level === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        message: `${alert.token_id}: Risk score ${alert.current_risk_score}, Level: ${alert.risk_level}`,
        timestamp: alert.last_updated
      })),
      summary: {
        total_tokens_monitored: metrics.length,
        tokens_with_alerts: alerts.length,
        average_risk_score: metrics
          .filter(m => !m.error)
          .reduce((sum, m) => sum + m.current_risk_score, 0) / metrics.filter(m => !m.error).length || 0,
        highest_risk_token: metrics
          .filter(m => !m.error)
          .reduce((highest, current) => 
            current.current_risk_score > (highest?.current_risk_score || 0) ? current : highest, null)
      },
      monitoring_status: {
        active_tokens: Array.from(monitoringState.activeTokens),
        last_update: monitoringState.lastUpdate,
        api_status: await checkApiStatus()
      }
    })
  } catch (error) {
    console.error("Monitoring metrics API error:", error)
    return NextResponse.json({ 
      error: "Failed to get monitoring metrics",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, tokenIds, thresholds } = await request.json()

    switch (action) {
      case 'start_monitoring':
        if (!tokenIds || !Array.isArray(tokenIds)) {
          return NextResponse.json({ error: "tokenIds array is required" }, { status: 400 })
        }

        // Add tokens to monitoring
        tokenIds.forEach(tokenId => monitoringState.activeTokens.add(tokenId))
        
        // Start real-time monitoring (this would be more sophisticated in production)
        await IntegratedRiskAnalysisService.startRealTimeMonitoring(Array.from(monitoringState.activeTokens))
        
        monitoringState.lastUpdate = new Date()

        return NextResponse.json({
          message: `Started monitoring ${tokenIds.length} tokens`,
          active_tokens: Array.from(monitoringState.activeTokens),
          status: 'monitoring_active'
        })

      case 'stop_monitoring':
        if (tokenIds && Array.isArray(tokenIds)) {
          tokenIds.forEach(tokenId => monitoringState.activeTokens.delete(tokenId))
        } else {
          monitoringState.activeTokens.clear()
        }

        monitoringState.lastUpdate = new Date()

        return NextResponse.json({
          message: tokenIds ? `Stopped monitoring ${tokenIds.length} tokens` : 'Stopped all monitoring',
          active_tokens: Array.from(monitoringState.activeTokens),
          status: monitoringState.activeTokens.size > 0 ? 'monitoring_active' : 'monitoring_stopped'
        })

      case 'update_thresholds':
        if (thresholds) {
          Object.assign(monitoringState.alertThresholds, thresholds)
        }

        return NextResponse.json({
          message: 'Alert thresholds updated',
          new_thresholds: monitoringState.alertThresholds
        })

      case 'clear_cache':
        IntegratedRiskAnalysisService.clearCache()
        return NextResponse.json({
          message: 'Cache cleared successfully'
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Monitoring control API error:", error)
    return NextResponse.json({ 
      error: "Failed to process monitoring request",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function checkApiStatus(): Promise<Record<string, string>> {
  // This would check the health of each integrated API
  return {
    CoinGecko: 'operational',
    Moralis: 'operational', 
    Mobula: 'operational',
    Tokenview: 'operational'
  }
}
