"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Info } from "lucide-react"

interface RealTimeAlertsProps {
  alerts: {
    active_warnings: string[]
    monitoring_flags: string[]
  }
}

export function RealTimeAlertsDisplay({ alerts }: RealTimeAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.active_warnings.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-destructive mb-2 flex items-center"><AlertTriangle className="h-4 w-4 mr-2" />Active Warnings</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {alerts.active_warnings.map((warning, index) => <li key={index}>{warning}</li>)}
            </ul>
          </div>
        )}
        {alerts.monitoring_flags.length > 0 && (
          <div>
            <h4 className="font-semibold text-yellow-500 mb-2 flex items-center"><Info className="h-4 w-4 mr-2" />Monitoring Flags</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {alerts.monitoring_flags.map((flag, index) => <li key={index}>{flag}</li>)}
            </ul>
          </div>
        )}
        {alerts.active_warnings.length === 0 && alerts.monitoring_flags.length === 0 && (
          <p className="text-sm text-muted-foreground">No active alerts or monitoring flags.</p>
        )}
      </CardContent>
    </Card>
  )
}
