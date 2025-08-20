"use client"

import { useState } from "react"
import { BarChart3, Settings, Users, Activity, Database, AlertTriangle, TrendingUp, Clock, LogOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authManager, type User } from "@/lib/auth"

interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

interface SystemStats {
  total_analyses: number
  active_users: number
  api_calls_today: number
  system_uptime: string
  cache_hit_rate: number
  avg_response_time: number
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<SystemStats>({
    total_analyses: 12847,
    active_users: 234,
    api_calls_today: 5672,
    system_uptime: "99.9%",
    cache_hit_rate: 87.3,
    avg_response_time: 245,
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: "Risk analysis completed", token: "BTC", timestamp: "2 minutes ago", status: "success" },
    { id: 2, action: "New user registered", user: "user@example.com", timestamp: "5 minutes ago", status: "info" },
    { id: 3, action: "API rate limit exceeded", ip: "192.168.1.100", timestamp: "8 minutes ago", status: "warning" },
    { id: 4, action: "Database backup completed", timestamp: "1 hour ago", status: "success" },
    { id: 5, action: "System maintenance started", timestamp: "2 hours ago", status: "info" },
  ])

  const handleLogout = async () => {
    await authManager.logout()
    onLogout()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">CryptoRisk Management Console</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
                  <p className="text-2xl font-bold">{stats.total_analyses.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{stats.active_users}</p>
                </div>
                <Users className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">API Calls Today</p>
                  <p className="text-2xl font-bold">{stats.api_calls_today.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                  <p className="text-2xl font-bold">{stats.system_uptime}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api">API Management</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.status === "success"
                              ? "bg-green-500"
                              : activity.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          {activity.token && <p className="text-xs text-muted-foreground">Token: {activity.token}</p>}
                          {activity.user && <p className="text-xs text-muted-foreground">User: {activity.user}</p>}
                          {activity.ip && <p className="text-xs text-muted-foreground">IP: {activity.ip}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* System Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cache Hit Rate</span>
                      <span className="font-medium">{stats.cache_hit_rate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${stats.cache_hit_rate}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg Response Time</span>
                      <span className="font-medium">{stats.avg_response_time}ms</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">Online</p>
                      <p className="text-xs text-muted-foreground">System Status</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">5.2GB</p>
                      <p className="text-xs text-muted-foreground">Memory Usage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">CoinGecko API</p>
                          <Badge variant="secondary" className="mt-1">
                            Active
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">1,247</p>
                          <p className="text-xs text-muted-foreground">calls/hour</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Mobula API</p>
                          <Badge variant="secondary" className="mt-1">
                            Active
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">892</p>
                          <p className="text-xs text-muted-foreground">calls/hour</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Tokenview API</p>
                          <Badge variant="outline" className="mt-1">
                            Limited
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">156</p>
                          <p className="text-xs text-muted-foreground">calls/hour</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium text-green-800">All Systems Operational</p>
                        <p className="text-sm text-green-600">No issues detected</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">Database</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Connection Pool</span>
                          <span className="text-green-600">8/10 active</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Query Performance</span>
                          <span className="text-green-600">Optimal</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">External APIs</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Response Time</span>
                          <span className="text-green-600">&lt; 500ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Success Rate</span>
                          <span className="text-green-600">99.8%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Risk Analysis Settings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cache Duration</span>
                        <Badge variant="outline">5 minutes</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Max Concurrent Analyses</span>
                        <Badge variant="outline">50</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Confidence Threshold</span>
                        <Badge variant="outline">70%</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">API Rate Limits</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Requests per minute</span>
                        <Badge variant="outline">100</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Burst limit</span>
                        <Badge variant="outline">200</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily limit</span>
                        <Badge variant="outline">10,000</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
