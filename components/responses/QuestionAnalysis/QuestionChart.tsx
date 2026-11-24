"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionStats } from "@/types/entities/response"
import { CustomPieChart, CustomBarChart, WordCloud, LazyChartWrapper } from "@/components/charts"
import { AlertTriangle, FileText } from "lucide-react"
import { ScaleStatsDisplay, TextStatsDisplay } from "./QuestionStats"

/**
 * Props for the QuestionChart component
 */
export interface QuestionChartProps {
  /** Question statistics data */
  question: QuestionStats
}

/**
 * QuestionChart component renders appropriate chart based on question type
 * Uses existing chart components from components/charts
 * 
 * @example
 * ```tsx
 * <QuestionChart question={questionStats} />
 * ```
 */
export function QuestionChart({ question }: QuestionChartProps) {
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
    case 'CHECKBOX':
    case 'DROPDOWN':
      return <MultipleChoiceChart question={question} />
    case 'SCALE':
      return <ScaleChart question={question} />
    case 'TEXT':
      return <TextChart question={question} />
    case 'GRID':
      return <GridChart question={question} />
    case 'SECTION':
      return <SectionInfo />
    default:
      return <UnsupportedTypeMessage />
  }
}

/**
 * Chart for multiple choice, checkbox, and dropdown questions
 */
function MultipleChoiceChart({ question }: QuestionChartProps) {
  if (!question.optionStats) return null

  const pieData = question.optionStats.map(stat => ({
    name: stat.option.length > 30 ? stat.option.substring(0, 30) + '...' : stat.option,
    value: stat.count,
    percentage: stat.percentage
  }))

  const barData = question.optionStats.map(stat => ({
    name: stat.option.length > 20 ? stat.option.substring(0, 20) + '...' : stat.option,
    value: stat.count,
    percentage: stat.percentage
  }))

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <LazyChartWrapper
        title="Distribuição das Respostas"
        description="Percentual de cada opção escolhida"
        height={300}
      >
        <CustomPieChart
          data={pieData}
          title=""
          description=""
        />
      </LazyChartWrapper>
      <LazyChartWrapper
        title="Frequência por Opção"
        description="Número de vezes que cada opção foi selecionada"
        height={300}
      >
        <CustomBarChart
          data={barData}
          title=""
          description=""
          orientation="horizontal"
        />
      </LazyChartWrapper>
    </div>
  )
}


/**
 * Chart for scale questions with statistical summary
 */
function ScaleChart({ question }: QuestionChartProps) {
  if (!question.scaleStats) return null

  const { distribution } = question.scaleStats

  const barData = distribution.map(stat => ({
    name: `Valor ${stat.value}`,
    value: stat.count,
    percentage: stat.percentage
  }))

  return (
    <div className="space-y-6">
      <ScaleStatsDisplay scaleStats={question.scaleStats} />

      <LazyChartWrapper
        title="Distribuição das Avaliações"
        description="Frequência de cada valor na escala"
        height={300}
      >
        <CustomBarChart
          data={barData}
          title=""
          description=""
          color="#8884D8"
        />
      </LazyChartWrapper>
    </div>
  )
}

/**
 * Chart for text questions with word cloud
 */
function TextChart({ question }: QuestionChartProps) {
  if (!question.textAnalysis) return null

  const { wordCloud } = question.textAnalysis

  const wordCloudData = wordCloud.map(item => ({
    text: item.word,
    size: item.frequency,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
  }))

  return (
    <div className="space-y-6">
      <TextStatsDisplay textAnalysis={question.textAnalysis} />

      {wordCloudData.length > 0 && (
        <LazyChartWrapper
          title="Palavras Mais Frequentes"
          description="Análise das palavras mais utilizadas nas respostas"
          height={400}
        >
          <WordCloud
            data={wordCloudData}
            title=""
            description=""
            height={400}
          />
        </LazyChartWrapper>
      )}
    </div>
  )
}

/**
 * Chart for grid questions with row and column analysis
 */
function GridChart({ question }: QuestionChartProps) {
  if (!question.gridStats) return null

  const { rowStats, columnTotals } = question.gridStats

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Análise por Linha</CardTitle>
            <CardDescription>
              Distribuição das respostas para cada linha da grade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rowStats.map((row, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium">{row.rowLabel}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {row.responses.map((response, colIndex) => (
                      <div key={colIndex} className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-sm text-muted-foreground">{response.column}</div>
                        <div className="font-bold">{response.count}</div>
                        <div className="text-xs text-muted-foreground">
                          {response.percentage.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totais por Coluna</CardTitle>
            <CardDescription>
              Soma das respostas para cada coluna
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LazyChartWrapper height={300}>
              <CustomBarChart
                data={columnTotals.map(col => ({
                  name: col.column.length > 15 ? col.column.substring(0, 15) + '...' : col.column,
                  value: col.total,
                  percentage: col.percentage
                }))}
                title=""
                height={300}
                color="#8884D8"
              />
            </LazyChartWrapper>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Information display for section type questions
 */
function SectionInfo() {
  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Seção do Formulário</h3>
              <p className="text-blue-700 mt-1">
                Esta é uma seção organizacional que não requer respostas dos usuários.
                Seções são usadas para estruturar e organizar o formulário em blocos temáticos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Função da Seção</CardTitle>
          <CardDescription>
            Características e propósito desta seção no formulário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-medium">Organizacional</h4>
                  <p className="text-sm text-muted-foreground">
                    Divide o formulário em blocos temáticos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">📋</span>
                </div>
                <div>
                  <h4 className="font-medium">Navegação</h4>
                  <p className="text-sm text-muted-foreground">
                    Melhora a experiência do usuário
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">🎯</span>
                </div>
                <div>
                  <h4 className="font-medium">Contextual</h4>
                  <p className="text-sm text-muted-foreground">
                    Fornece contexto para as próximas questões
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Impacto no Formulário</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Não gera dados de resposta</li>
                <li>• Não afeta estatísticas de conclusão</li>
                <li>• Melhora a organização visual</li>
                <li>• Pode conter descrições importantes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Message for unsupported question types
 */
function UnsupportedTypeMessage() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Tipo de questão não suportado para análise
        </p>
      </CardContent>
    </Card>
  )
}
