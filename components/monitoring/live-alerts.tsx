"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Alert {
  id: string
  type: "success" | "warning" | "error" | "info"
  title: string
  message: string
  timestamp: string
  dismissed?: boolean
}

export function LiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    // Simulate real-time alerts
    const generateAlert = (): Alert => {
      const types: Alert["type"][] = ["success", "warning", "error", "info"]
      const type = types[Math.floor(Math.random() * types.length)]

      const messages = {
        success: ["System backup completed", "All services operational", "Performance optimized"],
        warning: ["High CPU usage detected", "API rate limit approaching", "Memory usage elevated"],
        error: ["Service connection failed", "Critical error detected", "Database timeout"],
        info: ["Maintenance scheduled", "New version available", "System update completed"],
      }

      return {
        id: Date.now().toString(),
        type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message: messages[type][Math.floor(Math.random() * messages[type].length)],
        timestamp: new Date().toISOString(),
      }
    }

    // Add initial alerts
    setAlerts([generateAlert(), generateAlert()])

    // Generate new alerts periodically
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        // 30% chance of new alert
        setAlerts((prev) => [generateAlert(), ...prev.slice(0, 9)]) // Keep max 10 alerts
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "info":
        return "border-blue-200 bg-blue-50"
    }
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <p>No active alerts</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className={`border ${getAlertColor(alert.type)}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{alert.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
