"use client"

import { FormMetrics } from "@/types/entities/response"
import { Card, CardContent } from "@/components/ui/card"
import { Users, TrendingUp, Clock, BarChart3 } from "lucide-react"

/**
 * Props for the ResponsesStats component
 */
export interface ResponsesStatsProps {
  /** Form metrics data */
  metrics: FormMetrics | null
  /** Whether metrics are loading */
  loading?: boolean
}

/**
 * Stats cards component for the responses dashboard
 * Displays key metrics: total responses, response rate, average time, completion rate
 * 
 * @example
 * ```tsx
 * <ResponsesStats metrics={metrics} loading={metricsLoading} />
 * ```
 */
export function ResponsesStats({ metrics, loading = false }: ResponsesStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Respostas</p>
              <p className="text-3xl font-bold text-upe-blue">
                {metrics.overview.totalResponses}
              </p>
            </div>
            <Users className="h-8 w-8 text-upe-blue" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Resposta</p>
              <p className="text-3xl font-bold text-green-600">
                {metrics.overview.responseRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
              <p className="text-3xl font-bold text-orange-600">
                {metrics.overview.averageTime.toFixed(0)}min
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              <p className="text-3xl font-bold text-purple-600">
                {metrics.overview.completionRate.toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
