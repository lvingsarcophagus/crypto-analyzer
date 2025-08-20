"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RealTimeChart } from "./real-time-chart"
import { HistoricalChart } from "./historical-chart"
import { LivePriceTile } from "./live-price-tile"
import { LiveChart } from "./live-chart"
import { Activity, Users, BarChart3, AlertTriangle, CheckCircle } from "lucide-react"

interface AnalyticsData {
  riskAnalyses: Array<{ name: string; count: number; risk_level: string }>
  userActivity: Array<{ hour: string; active_users: number }>
  apiUsage: Array<{ endpoint: string; calls: number; avg_response_time: number }>
  systemHealth: {
    cpu_usage: number
    memory_usage: number
    disk_usage: number
    network_io: number
  }
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    riskAnalyses: [
      { name: "Low Risk", count: 1247, risk_level: "LOW" },
      { name: "Medium Risk", count: 892, risk_level: "MEDIUM" },
      { name: "High Risk", count: 456, risk_level: "HIGH" },
      { name: "Critical Risk", count: 123, risk_level: "CRITICAL" },
    ],
    userActivity: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      active_users: Math.floor(Math.random() * 200) + 50,
    })),
    apiUsage: [
      { endpoint: "/api/analyze", calls: 5672, avg_response_time: 245 },
      { endpoint: "/api/search", calls: 3421, avg_response_time: 156 },
      { endpoint: "/api/resolve", calls: 2134, avg_response_time: 189 },
      { endpoint: "/api/monitor", calls: 1876, avg_response_time: 98 },
    ],
    systemHealth: {
      cpu_usage: 45.2,
      memory_usage: 67.8,
      disk_usage: 34.1,
      network_io: 23.5,
    },
  })

  const [alerts, setAlerts] = useState([
    { id: 1, type: "warning", message: "High API usage detected", timestamp: "2 minutes ago" },
    { id: 2, type: "info", message: "System backup completed", timestamp: "1 hour ago" },
    { id: 3, type: "success", message: "All services operational", timestamp: "2 hours ago" },
  ])

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setAnalyticsData((prev) => ({
        ...prev,
        systemHealth: {
          cpu_usage: Math.max(0, Math.min(100, prev.systemHealth.cpu_usage + (Math.random() - 0.5) * 10)),
          memory_usage: Math.max(0, Math.min(100, prev.systemHealth.memory_usage + (Math.random() - 0.5) * 5)),
          disk_usage: Math.max(0, Math.min(100, prev.systemHealth.disk_usage + (Math.random() - 0.5) * 2)),
          network_io: Math.max(0, Math.min(100, prev.systemHealth.network_io + (Math.random() - 0.5) * 15)),
        },
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "hsl(142, 76%, 36%)"
      case "MEDIUM":
        return "hsl(48, 96%, 53%)"
      case "HIGH":
        return "hsl(25, 95%, 53%)"
      case "CRITICAL":
        return "hsl(0, 84%, 60%)"
      default:
        return "hsl(var(--muted))"
    }
  }

  const getHealthStatus = (value: number) => {
    if (value < 50) return { status: "good", color: "text-green-600", bg: "bg-green-50" }
    if (value < 80) return { status: "warning", color: "text-yellow-600", bg: "bg-yellow-50" }
    return { status: "critical", color: "text-red-600", bg: "bg-red-50" }
  }

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RealTimeChart
          title="API Requests/min"
          dataKey="api_requests"
          color="hsl(var(--primary))"
          updateInterval={2000}
        />
        <RealTimeChart
          title="Response Time"
          dataKey="response_time"
          color="hsl(var(--secondary))"
          unit="ms"
          updateInterval={3000}
        />
        <RealTimeChart
          title="Active Users"
          dataKey="active_users"
          color="hsl(var(--accent))"
          chartType="area"
          updateInterval={5000}
        />
        <RealTimeChart
          title="Error Rate"
          dataKey="error_rate"
          color="hsl(var(--destructive))"
          unit="%"
          updateInterval={4000}
        />
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">API Usage</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Live Chart - Full Width */}
          <LiveChart defaultToken="bitcoin" updateInterval={3000} height={350} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Price Tile */}
            <LivePriceTile />

            {/* Risk Analysis Distribution */}
            <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Analysis Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.riskAnalyses}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {analyticsData.riskAnalyses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk_level)} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">Risk Level</span>
                                    <span className="font-bold">{data.name}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">Count</span>
                                    <span className="font-bold">{data.count}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {analyticsData.riskAnalyses.map((item) => (
                    <div key={item.risk_level} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getRiskColor(item.risk_level) }}
                      />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-bold ml-auto">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Historical Chart */}
            <div className="lg:col-span-1">
              <HistoricalChart />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analyticsData.systemHealth).map(([key, value]) => {
              const health = getHealthStatus(value)
              return (
                <Card key={key}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {key.replace("_", " ").toUpperCase()}
                        </p>
                        <p className="text-2xl font-bold">{value.toFixed(1)}%</p>
                      </div>
                      <div className={`p-2 rounded-full ${health.bg}`}>
                        <Activity className={`h-4 w-4 ${health.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            health.status === "good"
                              ? "bg-green-500"
                              : health.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.apiUsage.map((api) => (
                  <div key={api.endpoint} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{api.endpoint}</p>
                        <p className="text-sm text-muted-foreground">{api.calls.toLocaleString()} calls today</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{api.avg_response_time}ms</p>
                      <p className="text-sm text-muted-foreground">avg response</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border ${
                      alert.type === "warning"
                        ? "bg-yellow-50 border-yellow-200"
                        : alert.type === "success"
                          ? "bg-green-50 border-green-200"
                          : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {alert.type === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      ) : alert.type === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Activity className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
                    </div>
                    <Badge
                      variant={
                        alert.type === "warning" ? "destructive" : alert.type === "success" ? "default" : "secondary"
                      }
                    >
                      {alert.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
