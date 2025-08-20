"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp,
  Server,
  Wifi,
  Database,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { usePerformance, type RequestLog } from "@/hooks/use-performance"

interface PerformanceMetricsProps {
  className?: string
  showDetailed?: boolean
}

export function PerformanceMetrics({ 
  className = "",
  showDetailed = false 
}: PerformanceMetricsProps) {
  const { metrics, getPerformanceGrade, clearMetrics } = usePerformance()
  const [connectionSpeed, setConnectionSpeed] = useState<number | null>(null)
  const [showDetails, setShowDetails] = useState(showDetailed)
  const [networkInfo, setNetworkInfo] = useState<any>(null)

  useEffect(() => {
    checkConnectionSpeed()
    getNetworkInfo()
  }, [])

  const checkConnectionSpeed = async () => {
    try {
      // Simple connection speed test using a small image
      const startTime = performance.now()
      const response = await fetch('/placeholder.svg?' + Date.now(), { 
        cache: 'no-cache',
        mode: 'no-cors'
      })
      const endTime = performance.now()
      
      const loadTime = endTime - startTime
      // Estimate speed based on load time (rough calculation)
      const estimatedSpeed = loadTime < 100 ? 'fast' : loadTime < 300 ? 'medium' : 'slow'
      setConnectionSpeed(loadTime)
    } catch (error) {
      console.error('Failed to check connection speed:', error)
    }
  }

  const getNetworkInfo = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setNetworkInfo({
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData
      })
    }
  }

  const getSpeedLevel = (speed: number | null) => {
    if (!speed) return { level: 'unknown', color: 'gray', text: 'Unknown' }
    if (speed < 100) return { level: 'excellent', color: 'green', text: 'Excellent' }
    if (speed < 200) return { level: 'good', color: 'blue', text: 'Good' }
    if (speed < 500) return { level: 'fair', color: 'yellow', text: 'Fair' }
    return { level: 'poor', color: 'red', text: 'Poor' }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-500'
      case 'B': return 'text-blue-500'
      case 'C': return 'text-yellow-500'
      case 'D': return 'text-orange-500'
      case 'F': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const speedInfo = getSpeedLevel(connectionSpeed)
  const grade = getPerformanceGrade()

  return (
    <Card className={`${className} backdrop-blur-md bg-card/95 border-border/50`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Performance Metrics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getGradeColor(grade)} border-current`}
            >
              Grade: {grade}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{metrics.totalRequests}</div>
            <div className="text-xs text-muted-foreground">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{metrics.successfulRequests}</div>
            <div className="text-xs text-muted-foreground">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {metrics.totalRequests > 0 ? Math.round(metrics.averageResponseTime) : 0}ms
            </div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{metrics.failedRequests}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>

        {/* Connection Speed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Connection Speed</span>
            </div>
            <Badge variant="outline" className={`text-${speedInfo.color}-500 border-current`}>
              {speedInfo.text}
            </Badge>
          </div>
          {connectionSpeed && (
            <div className="text-xs text-muted-foreground">
              Response time: {Math.round(connectionSpeed)}ms
            </div>
          )}
        </div>

        {showDetails && (
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Success Rate</span>
                    <span>{metrics.totalRequests > 0 ? Math.round((metrics.successfulRequests / metrics.totalRequests) * 100) : 0}%</span>
                  </div>
                  <Progress 
                    value={metrics.totalRequests > 0 ? (metrics.successfulRequests / metrics.totalRequests) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Time Score</span>
                    <span>{metrics.averageResponseTime < 500 ? 'Good' : metrics.averageResponseTime < 1000 ? 'Fair' : 'Poor'}</span>
                  </div>
                  <Progress 
                    value={Math.max(0, Math.min(100, 100 - (metrics.averageResponseTime / 20)))} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-card/30 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                    <div className="text-sm font-medium">Min Response</div>
                    <div className="text-lg font-bold">{metrics.minResponseTime}ms</div>
                  </div>
                  <div className="text-center p-3 bg-card/30 rounded-lg">
                    <Zap className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                    <div className="text-sm font-medium">Max Response</div>
                    <div className="text-lg font-bold">{metrics.maxResponseTime}ms</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="network" className="space-y-4">
              {networkInfo ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Connection Type</div>
                      <div className="font-medium">{networkInfo.effectiveType?.toUpperCase() || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Downlink</div>
                      <div className="font-medium">{networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Round Trip Time</div>
                      <div className="font-medium">{networkInfo.rtt ? `${networkInfo.rtt}ms` : 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Data Saver</div>
                      <div className="font-medium">{networkInfo.saveData ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Network information not available
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="requests" className="space-y-4">
              <div className="space-y-3">
                {metrics.recentRequests.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {metrics.recentRequests.map((request: RequestLog, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-card/30 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            request.success ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm font-mono">{request.url.split('/').pop()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {request.responseTime}ms
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent requests
                  </div>
                )}
                
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearMetrics}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Clear Metrics
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
