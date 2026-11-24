import { NextResponse } from 'next/server'
import { checkHealth, HealthStatus } from '@/lib/monitoring'

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const health = await checkHealth()
  const status = health.status === 'unhealthy' ? 503 : 200

  return NextResponse.json(health, { status })
}
