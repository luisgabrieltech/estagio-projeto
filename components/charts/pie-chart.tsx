"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CHART_COLORS, getChartColor } from "@/lib/config/chart-colors"

/**
 * Data structure for pie chart entries
 */
interface PieChartData {
  name: string
  value: number
  color?: string
  percentage?: number
}

/**
 * Props for CustomPieChart component
 */
interface CustomPieChartProps {
  /** Data to display in the chart */
  data: PieChartData[]
  /** Chart title */
  title: string
  /** Optional description */
  description?: string
  /** Chart height in pixels */
  height?: number
  /** Whether to show legend */
  showLegend?: boolean
  /** Whether to show percentage labels */
  showLabels?: boolean
}

/**
 * Custom tooltip component for pie chart
 */
interface TooltipPayload {
  payload: PieChartData
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Valor: {data.value}
        </p>
        <p className="text-sm text-muted-foreground">
          Percentual: {data.percentage?.toFixed(1)}%
        </p>
      </div>
    )
  }
  return null
}

/**
 * Render label for pie chart slices
 */
function renderLabel(entry: PieChartData): string {
  return `${entry.percentage?.toFixed(1)}%`
}

export function CustomPieChart({ 
  data, 
  title, 
  description, 
  height = 300, 
  showLegend = true, 
  showLabels = true 
}: CustomPieChartProps) {
  // Calcular percentuais
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithPercentages = data.map((item, index) => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
    color: item.color || getChartColor(index)
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
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showLabels ? renderLabel : false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
