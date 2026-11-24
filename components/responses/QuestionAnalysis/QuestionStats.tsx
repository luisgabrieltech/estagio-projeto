"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuestionStats as QuestionStatsType } from "@/types/entities/response"
import { Users, TrendingDown, TrendingUp, FileText, AlertTriangle } from "lucide-react"

/**
 * Props for the QuestionStats component
 */
export interface QuestionStatsProps {
  /** Question statistics data */
  question: QuestionStatsType
}

/**
 * Helper function to get icon for question type
 */
function getTypeIcon(type: string): string {
  switch (type) {
    case 'MULTIPLE_CHOICE':
    case 'DROPDOWN':
      return '🔘'
    case 'CHECKBOX':
      return '☑️'
    case 'TEXT':
      return '📝'
    case 'SCALE':
      return '📊'
    case 'GRID':
      return '📋'
    case 'SECTION':
      return '📑'
    default:
      return '❓'
  }
}

/**
 * Helper function to get human-readable name for question type
 */
export function getTypeName(type: string): string {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'Escolha Única'
    case 'CHECKBOX':
      return 'Múltipla Escolha'
    case 'TEXT':
      return 'Texto Livre'
    case 'SCALE':
      return 'Escala'
    case 'GRID':
      return 'Grade'
    case 'DROPDOWN':
      return 'Lista Suspensa'
    case 'SECTION':
      return 'Seção'
    default:
      return type
  }
}


/**
 * QuestionStats component displays basic statistics for a question
 * Shows response count, skip rate, question type, and status
 * 
 * @example
 * ```tsx
 * <QuestionStats question={questionStats} />
 * ```
 */
export function QuestionStats({ question }: QuestionStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Respostas</p>
              <p className="text-2xl font-bold">{question.totalResponses}</p>
            </div>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Pulo</p>
              <p className="text-2xl font-bold">{question.skipRate.toFixed(1)}%</p>
            </div>
            {question.skipRate > 20 ? (
              <TrendingUp className="h-6 w-6 text-red-500" />
            ) : (
              <TrendingDown className="h-6 w-6 text-green-500" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="text-lg font-medium">{getTypeIcon(question.questionType)}</p>
            </div>
            <FileText className="h-6 w-6 text-gray-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                {question.isRequired && (
                  <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                )}
                {question.skipRate > 20 && (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * ScaleStatsDisplay component shows detailed statistics for scale questions
 */
export interface ScaleStatsDisplayProps {
  /** Scale statistics */
  scaleStats: NonNullable<QuestionStatsType['scaleStats']>
}

export function ScaleStatsDisplay({ scaleStats }: ScaleStatsDisplayProps) {
  const { average, median, mode, standardDeviation } = scaleStats

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Média</p>
          <p className="text-2xl font-bold text-blue-600">{average.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Mediana</p>
          <p className="text-2xl font-bold text-green-600">{median.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Moda</p>
          <p className="text-2xl font-bold text-purple-600">{mode}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Desvio Padrão</p>
          <p className="text-2xl font-bold text-orange-600">{standardDeviation.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * TextStatsDisplay component shows detailed statistics for text questions
 */
export interface TextStatsDisplayProps {
  /** Text analysis data */
  textAnalysis: NonNullable<QuestionStatsType['textAnalysis']>
}

export function TextStatsDisplay({ textAnalysis }: TextStatsDisplayProps) {
  const { averageLength, totalWords, uniqueWords } = textAnalysis

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Média de Caracteres</p>
          <p className="text-2xl font-bold text-blue-600">{Math.round(averageLength)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Total de Palavras</p>
          <p className="text-2xl font-bold text-green-600">{totalWords}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Palavras Únicas</p>
          <p className="text-2xl font-bold text-purple-600">{uniqueWords}</p>
        </CardContent>
      </Card>
    </div>
  )
}
