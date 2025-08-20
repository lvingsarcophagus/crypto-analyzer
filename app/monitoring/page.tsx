"use client"

import { AnalyticsDashboard } from "@/components/monitoring/analytics-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, BarChart3, TrendingUp } from "lucide-react"

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <header className="border-b bg-card/30 backdrop-blur-md border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/80 backdrop-blur-sm text-primary-foreground shadow-lg">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Real-time Monitoring</h1>
                <p className="text-sm text-muted-foreground">System Analytics & Performance Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 bg-background/50 backdrop-blur-sm border-white/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </Badge>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-white/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">System Status</p>
                    <p className="text-2xl font-bold text-green-600">Healthy</p>
                  </div>
                  <div className="p-2 rounded-full bg-green-500/20 backdrop-blur-sm">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p className="text-2xl font-bold">99.9%</p>
                  </div>
                  <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Monitors</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="p-2 rounded-full bg-secondary/20 backdrop-blur-sm">
                    <BarChart3 className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <div className="p-2 rounded-full bg-yellow-500/20 backdrop-blur-sm">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Dashboard */}
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  )
}
