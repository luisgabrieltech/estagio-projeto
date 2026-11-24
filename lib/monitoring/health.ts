import { prisma } from '@/lib/services/prisma'
import { logger } from '@/lib/core'

export interface ComponentHealth {
  status: 'up' | 'down' | 'degraded'
  latency?: number
  message?: string
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: ComponentHealth
    cache?: ComponentHealth
    external?: ComponentHealth
  }
}

const startTime = Date.now()

function getVersion(): string {
  return process.env.npm_package_version || '0.1.0'
}

function getUptime(): number {
  return Math.floor((Date.now() - startTime) / 1000)
}

export async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now()
  
  try {
    await prisma.$queryRaw`SELECT 1`
    
    const latency = Date.now() - start
    
    if (latency > 1000) {
      return {
        status: 'degraded',
        latency,
        message: 'Database responding slowly',
      }
    }
    
    return {
      status: 'up',
      latency,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error'
    
    logger.error('Database health check failed', error instanceof Error ? error : undefined, {
      component: 'health',
    })
    
    return {
      status: 'down',
      latency: Date.now() - start,
      message: errorMessage,
    }
  }
}

export async function checkHealth(): Promise<HealthStatus> {
  const timestamp = new Date().toISOString()
  const version = getVersion()
  const uptime = getUptime()
  
  const database = await checkDatabase()
  
  let status: HealthStatus['status'] = 'healthy'
  
  if (database.status === 'down') {
    status = 'unhealthy'
  } else if (database.status === 'degraded') {
    status = 'degraded'
  }
  
  return {
    status,
    timestamp,
    version,
    uptime,
    checks: {
      database,
    },
  }
}
