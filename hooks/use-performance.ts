"use client"

import { useState, useEffect, useCallback } from 'react'

interface PerformanceMetrics {
  responseTime: number
  errorRate: number
  successfulRequests: number
  totalRequests: number
  failedRequests: number
  lastError?: string
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  recentRequests: RequestLog[]
}

interface RequestLog {
  timestamp: number
  url: string
  responseTime: number
  success: boolean
  error?: string
}

export type { RequestLog }

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    errorRate: 0,
    successfulRequests: 0,
    totalRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    minResponseTime: 0,
    maxResponseTime: 0,
    recentRequests: []
  })
  
  const [requestLog, setRequestLog] = useState<RequestLog[]>([])

  // Clean old logs (keep last 100 requests)
  useEffect(() => {
    if (requestLog.length > 100) {
      setRequestLog(prev => prev.slice(-100))
    }
  }, [requestLog])

  const logRequest = useCallback((url: string, duration: number, success: boolean, error?: string) => {
    const logEntry: RequestLog = {
      timestamp: Date.now(),
      url,
      responseTime: duration,
      success,
      error
    }
    
    setRequestLog(prev => [...prev, logEntry])
    
    // Update metrics
    setMetrics(prev => {
      const newTotalRequests = prev.totalRequests + 1
      const newSuccessfulRequests = prev.successfulRequests + (success ? 1 : 0)
      const newFailedRequests = prev.failedRequests + (success ? 0 : 1)
      const newErrorRate = ((newTotalRequests - newSuccessfulRequests) / newTotalRequests) * 100
      
      // Calculate average response time for last 50 requests
      const recentLogs = [...requestLog, logEntry].slice(-50)
      const averageResponseTime = recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length
      const responseTimes = recentLogs.map(log => log.responseTime)
      const minResponseTime = Math.min(...responseTimes, prev.minResponseTime || Infinity)
      const maxResponseTime = Math.max(...responseTimes, prev.maxResponseTime || 0)
      
      return {
        responseTime: duration,
        errorRate: newErrorRate,
        successfulRequests: newSuccessfulRequests,
        totalRequests: newTotalRequests,
        failedRequests: newFailedRequests,
        lastError: error,
        averageResponseTime,
        minResponseTime: minResponseTime === Infinity ? duration : minResponseTime,
        maxResponseTime: maxResponseTime || duration,
        recentRequests: recentLogs
      }
    })
  }, [requestLog])

  const trackApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    url: string
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      logRequest(url, duration, true)
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logRequest(url, duration, false, errorMessage)
      throw error
    }
  }, [logRequest])

  const getRecentErrors = useCallback((limit = 10) => {
    return requestLog
      .filter(log => !log.success)
      .slice(-limit)
      .reverse()
  }, [requestLog])

  const getPerformanceGrade = useCallback(() => {
    if (metrics.averageResponseTime < 500 && metrics.errorRate < 5) return 'A'
    if (metrics.averageResponseTime < 1000 && metrics.errorRate < 10) return 'B'
    if (metrics.averageResponseTime < 2000 && metrics.errorRate < 20) return 'C'
    if (metrics.averageResponseTime < 5000 && metrics.errorRate < 50) return 'D'
    return 'F'
  }, [metrics])

  const clearMetrics = useCallback(() => {
    setMetrics({
      responseTime: 0,
      errorRate: 0,
      successfulRequests: 0,
      totalRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      recentRequests: []
    })
    setRequestLog([])
  }, [])

  return {
    metrics,
    requestLog,
    trackApiCall,
    getRecentErrors,
    getPerformanceGrade,
    clearMetrics
  }
}

// Export as usePerformance for compatibility
export const usePerformance = usePerformanceMonitoring
