"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/admin/login-form"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { authManager, type AuthState } from "@/lib/auth"

export default function AdminPage() {
"use client"

import { useState, useEffect } from "react"
import { ModernAdminDashboard } from "@/components/admin/modern-admin-dashboard"
import { LoginForm } from "@/components/admin/login-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  BarChart3, 
  Users, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Zap,
  Settings,
  LogOut,
  Home
} from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    activeUsers: 0,
    apiHealth: 'healthy',
    uptime: '99.9%'
  })

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('admin-token')
      if (token) {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    // Load stats
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    checkAuth()
    loadStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin-token')
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="text-lg">Loading Admin Panel...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CryptoRisk Pro</h1>
                  <p className="text-sm text-blue-200">Admin Panel</p>
                </div>
              </div>
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Login Form */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Admin Access</h2>
              <p className="text-gray-300">Sign in to access the administration panel</p>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <LoginForm onLoginSuccess={handleLogin} />
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This is a secure area. Authorized personnel only.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CryptoRisk Pro</h1>
                <p className="text-sm text-blue-200">Administration Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge 
                variant={stats.apiHealth === 'healthy' ? 'default' : 'destructive'} 
                className={stats.apiHealth === 'healthy' ? 'bg-green-500/20 text-green-300 border-green-500/30' : ''}
              >
                <Activity className="h-3 w-3 mr-1" />
                {stats.apiHealth === 'healthy' ? 'All Systems Operational' : 'System Issues'}
              </Badge>
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:border-red-500/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="border-b border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">
                <span className="font-semibold text-white">{stats.totalAnalyses.toLocaleString()}</span> Analyses
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">
                <span className="font-semibold text-white">{stats.activeUsers}</span> Active Users
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">
                <span className="font-semibold text-white">{stats.uptime}</span> Uptime
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-300">
                <span className="font-semibold text-white">4</span> API Sources
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
              <p className="text-gray-300">Monitor system performance and manage platform settings</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>

          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4 text-blue-400" />
                  API Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">CoinGecko</span>
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">Moralis</span>
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">Mobula</span>
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">Tokenview</span>
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">&lt;2s</div>
                <div className="text-xs text-gray-300">Avg Response Time</div>
                <div className="mt-3 text-xs text-green-300">↑ 15% faster than last week</div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  Daily Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">1,247</div>
                <div className="text-xs text-gray-300">Today</div>
                <div className="mt-3 text-xs text-purple-300">↑ 23% vs yesterday</div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-yellow-400" />
                  System Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">23%</div>
                <div className="text-xs text-gray-300">Current Usage</div>
                <div className="mt-3 text-xs text-green-300">Optimal performance</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Component */}
        <ModernAdminDashboard />
      </main>
    </div>
  )
}
}  useEffect(() => {
    // Check for existing authentication
    authManager.checkAuth()

    // Subscribe to auth state changes
    const unsubscribe = authManager.subscribe(setAuthState)

    return unsubscribe
  }, [])

  const handleLoginSuccess = () => {
    // Auth state will be updated via subscription
  }

  const handleLogout = () => {
    // Auth state will be updated via subscription
  }

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated || !authState.user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  return <AdminDashboard user={authState.user} onLogout={handleLogout} />
}
