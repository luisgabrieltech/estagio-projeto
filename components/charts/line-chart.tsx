"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LineChartData {
  date: string
  responses: number
  cumulative?: number
}

interface CustomLineChartProps {
  data: LineChartData[]
  title: string
  description?: string
  height?: number
  showGrid?: boolean
  showArea?: boolean
  showCumulative?: boolean
  color?: string
  cumulativeColor?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label)
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">
          {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.dataKey === 'responses' && entry.value === 1 ? ' resposta' : ' respostas'}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const formatXAxisLabel = (tickItem: string) => {
  const date = new Date(tickItem)
  return format(date, 'dd/MM', { locale: ptBR })
}

export function CustomLineChart({ 
  data, 
  title, 
  description, 
  height = 300, 
  showGrid = true,
  showArea = false,
  showCumulative = false,
  color = '#0088FE',
  cumulativeColor = '#00C49F'
}: CustomLineChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  const ChartComponent = showArea ? AreaChart : LineChart

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {showArea ? (
              <>
                <Area
                  type="monotone"
                  dataKey="responses"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                  name="Respostas do dia"
                />
                {showCumulative && (
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke={cumulativeColor}
                    fill={cumulativeColor}
                    fillOpacity={0.1}
                    name="Total acumulado"
                  />
                )}
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="responses"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Respostas do dia"
                />
                {showCumulative && (
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke={cumulativeColor}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: cumulativeColor, strokeWidth: 2, r: 4 }}
                    name="Total acumulado"
                  />
                )}
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
