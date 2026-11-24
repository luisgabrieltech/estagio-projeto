"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomLineChart, LazyChartWrapper } from "@/components/charts"
import { FormMetrics } from "@/types/entities/response"

interface OverviewTabProps {
  metrics: FormMetrics | null
}

export function OverviewTab({ metrics }: OverviewTabProps) {
  if (!metrics) return null

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
          <CardDescription>
            Principais indicadores do formulário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {metrics.overview.totalResponses}
              </div>
              <div className="text-sm text-blue-600">Total de Respostas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {metrics.overview.responseRate.toFixed(1)}%
              </div>
              <div className="text-sm text-green-600">Taxa de Resposta</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {metrics.overview.completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-600">Taxa de Conclusão</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {metrics.overview.avgResponsesPerDay.toFixed(1)}
              </div>
              <div className="text-sm text-orange-600">Média/Dia</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <LazyChartWrapper
        title="Evolução das Respostas ao Longo do Tempo"
        description="Acompanhe como as respostas foram chegando dia a dia"
        height={400}
      >
        <CustomLineChart
          data={metrics.timeline}
          title=""
          description=""
          showCumulative={true}
          showArea={true}
          height={400}
        />
      </LazyChartWrapper>
    </div>
  )
}
