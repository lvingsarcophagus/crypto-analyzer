import { NextResponse } from "next/server"

export async function GET() {
  // Mock admin statistics - in real app, this would query your database
  const stats = {
    total_analyses: Math.floor(Math.random() * 20000) + 10000,
    active_users: Math.floor(Math.random() * 500) + 100,
    api_calls_today: Math.floor(Math.random() * 10000) + 5000,
    system_uptime: "99.9%",
    cache_hit_rate: Math.floor(Math.random() * 20) + 80,
    avg_response_time: Math.floor(Math.random() * 200) + 200,
    recent_activity: [
      {
        id: 1,
        action: "Risk analysis completed",
        token: "BTC",
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        status: "success",
      },
      {
        id: 2,
        action: "New user registered",
        user: "user@example.com",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "info",
      },
      {
        id: 3,
        action: "API rate limit exceeded",
        ip: "192.168.1.100",
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        status: "warning",
      },
    ],
  }

  return NextResponse.json(stats)
}
