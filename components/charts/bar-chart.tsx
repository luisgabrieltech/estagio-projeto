"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BarChartData {
  name: string
  value: number
  color?: string
  percentage?: number
}

interface CustomBarChartProps {
  data: BarChartData[]
  title: string
  description?: string
  height?: number
  showGrid?: boolean
  orientation?: 'vertical' | 'horizontal'
  color?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          Valor: {data.value}
        </p>
        {data.percentage && (
          <p className="text-sm text-muted-foreground">
            Percentual: {data.percentage.toFixed(1)}%
          </p>
        )}
      </div>
    )
  }
  return null
}

export function CustomBarChart({ 
  data, 
  title, 
  description, 
  height = 300, 
  showGrid = true,
  orientation = 'vertical',
  color = '#0088FE'
}: CustomBarChartProps) {
  // Calcular percentuais
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }))

  if (dataWithPercentages.length === 0) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={dataWithPercentages}
            layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {orientation === 'horizontal' ? (
              <>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
              </>
            )}
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
