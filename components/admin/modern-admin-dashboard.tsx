"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Activity, 
  Users, 
  BarChart3, 
  Database, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Download,
  Clock,
  Zap,
  Shield,
  Globe
} from "lucide-react"

interface SystemStats {
  totalAnalyses: number
  activeUsers: number
  apiCalls: number
  errorRate: number
  responseTime: number
  uptime: string
}

interface APIStatus {
  name: string
  status: 'healthy' | 'warning' | 'error'
  responseTime: number
  lastChecked: string
  callsToday: number
}

export function ModernAdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalAnalyses: 12547,
    activeUsers: 89,
    apiCalls: 45612,
    errorRate: 0.8,
    responseTime: 1.2,
    uptime: '99.97%'
  })

  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    {
      name: 'CoinGecko',
      status: 'healthy',
      responseTime: 0.9,
      lastChecked: new Date().toISOString(),
      callsToday: 12547
    },
    {
      name: 'Moralis',
      status: 'healthy',
      responseTime: 1.1,
      lastChecked: new Date().toISOString(),
      callsToday: 8934
    },
    {
      name: 'Mobula',
      status: 'warning',
      responseTime: 2.1,
      lastChecked: new Date().toISOString(),
      callsToday: 6789
    },
    {
      name: 'Tokenview',
      status: 'healthy',
      responseTime: 1.5,
      lastChecked: new Date().toISOString(),
      callsToday: 5432
    }
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        refreshData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isRefreshing])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={refreshData} 
            disabled={isRefreshing}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
            <Activity className="h-3 w-3 mr-1" />
            Live Monitoring
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="apis" className="data-[state=active]:bg-white/10 text-white">
            <Database className="h-4 w-4 mr-2" />
            API Status
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10 text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 text-white">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Health Alert */}
          <Alert className="bg-green-500/10 border-green-500/20 text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All systems operational. No critical issues detected.
            </AlertDescription>
          </Alert>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  Total Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.totalAnalyses.toLocaleString()}
                </div>
                <div className="text-xs text-gray-300">All time</div>
                <div className="mt-3 flex items-center gap-1 text-xs text-green-300">
                  <TrendingUp className="h-3 w-3" />
                  +12% this month
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-green-400" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.activeUsers}
                </div>
                <div className="text-xs text-gray-300">Currently online</div>
                <div className="mt-3 flex items-center gap-1 text-xs text-blue-300">
                  <Activity className="h-3 w-3" />
                  Peak: 156 users
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.responseTime}s
                </div>
                <div className="text-xs text-gray-300">Average</div>
                <div className="mt-3">
                  <Progress value={85} className="h-2" />
                  <div className="text-xs text-green-300 mt-1">Excellent</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-purple-400" />
                  System Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.uptime}
                </div>
                <div className="text-xs text-gray-300">Last 30 days</div>
                <div className="mt-3 flex items-center gap-1 text-xs text-green-300">
                  <CheckCircle className="h-3 w-3" />
                  Excellent
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Bitcoin analysis completed</div>
                    <div className="text-xs text-gray-400">Risk score: 25/100 (LOW) • 2 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">System health check passed</div>
                    <div className="text-xs text-gray-400">All APIs responding normally • 5 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Database backup completed</div>
                    <div className="text-xs text-gray-400">Automated backup successful • 1 hour ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apiStatuses.map((api) => (
              <Card key={api.name} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-400" />
                      {api.name} API
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        api.status === 'healthy' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        api.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      <span className={getStatusColor(api.status)}>
                        {getStatusIcon(api.status)}
                      </span>
                      <span className="ml-1 capitalize">{api.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-white">{api.responseTime}s</div>
                      <div className="text-xs text-gray-300">Response Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{api.callsToday.toLocaleString()}</div>
                      <div className="text-xs text-gray-300">Calls Today</div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">Last Checked</span>
                      <span className="text-white">{new Date(api.lastChecked).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Usage Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Analytics Dashboard</h3>
                <p className="text-gray-300 mb-4">
                  Detailed analytics and reporting features will be available here.
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  Configure Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">System Settings</h3>
                <p className="text-gray-300 mb-4">
                  Configure API settings, rate limits, and system preferences.
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  Open Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
