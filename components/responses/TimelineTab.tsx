"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomLineChart, LazyChartWrapper } from "@/components/charts"
import { FormMetrics } from "@/types/entities/response"
import { BarChart3, TrendingUp, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TimelineTabProps {
  metrics: FormMetrics | null
}

export function TimelineTab({ metrics }: TimelineTabProps) {
  if (!metrics) return null

  const maxResponses = Math.max(...metrics.timeline.map(d => d.responses))

  return (
    <div className="space-y-6">
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
      
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média por Dia</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.overview.avgResponsesPerDay.toFixed(1)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pico de Respostas</p>
                <p className="text-2xl font-bold text-green-600">{maxResponses}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dias Ativos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.timeline.filter(d => d.responses > 0).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Detalhada</CardTitle>
          <CardDescription>
            Dias com maior atividade de respostas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {metrics.timeline
              .filter(d => d.responses > 0)
              .sort((a, b) => b.responses - a.responses)
              .slice(0, 10)
              .map((day, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="font-medium">
                    {format(new Date(day.date), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {day.responses} {day.responses === 1 ? 'resposta' : 'respostas'}
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(day.responses / maxResponses) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
