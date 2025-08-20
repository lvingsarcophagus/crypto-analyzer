"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DataPoint {
  timestamp: string
  value: number
  label?: string
}

interface RealTimeChartProps {
  title: string
  dataKey: string
  color?: string
  unit?: string
  maxDataPoints?: number
  updateInterval?: number
  chartType?: "line" | "area"
}

export function RealTimeChart({
  title,
  dataKey,
  color = "hsl(var(--primary))",
  unit = "",
  maxDataPoints = 20,
  updateInterval = 5000,
  chartType = "line",
}: RealTimeChartProps) {
  const [data, setData] = useState<DataPoint[]>([])
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    const generateDataPoint = (): DataPoint => ({
      timestamp: new Date().toLocaleTimeString(),
      value: Math.floor(Math.random() * 100) + 50,
      label: `${dataKey} at ${new Date().toLocaleTimeString()}`,
    })

    // Initialize with some data
    const initialData = Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - (9 - i) * updateInterval).toLocaleTimeString(),
      value: Math.floor(Math.random() * 100) + 50,
    }))
    setData(initialData)

    const interval = setInterval(() => {
      if (isLive) {
        setData((prevData) => {
          const newData = [...prevData, generateDataPoint()]
          return newData.slice(-maxDataPoints)
        })
      }
    }, updateInterval)

    return () => clearInterval(interval)
  }, [dataKey, maxDataPoints, updateInterval, isLive])

  const currentValue = data[data.length - 1]?.value || 0
  const previousValue = data[data.length - 2]?.value || 0
  const change = currentValue - previousValue
  const changePercent = previousValue !== 0 ? ((change / previousValue) * 100).toFixed(1) : "0"

  const ChartComponent = chartType === "area" ? AreaChart : LineChart

  return (
    <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={change >= 0 ? "default" : "destructive"} className="text-xs bg-background/50 backdrop-blur-sm">
            {change >= 0 ? "+" : ""}
            {changePercent}%
          </Badge>
          <div
            className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            title={isLive ? "Live" : "Paused"}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-4">
          {currentValue.toFixed(1)}
          {unit}
        </div>
        <div className="h-[200px] rounded-lg bg-background/20 backdrop-blur-sm border border-white/10 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data}>
              <XAxis dataKey="timestamp" hide />
              <YAxis hide />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Time</span>
                            <span className="font-bold text-muted-foreground">{label}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">{title}</span>
                            <span className="font-bold" style={{ color }}>
                              {payload[0].value}
                              {unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              {chartType === "area" ? (
                <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
              ) : (
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLive ? "Pause" : "Resume"} updates
        </button>
      </CardContent>
    </Card>
  )
}
