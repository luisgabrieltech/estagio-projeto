"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuestionStats as QuestionStatsType } from "@/types/entities/response"
import { AlertTriangle } from "lucide-react"
import { QuestionStats, getTypeName } from "./QuestionStats"
import { QuestionChart } from "./QuestionChart"

/**
 * Props for the QuestionAnalysis component
 */
export interface QuestionAnalysisProps {
  /** Question statistics data */
  question: QuestionStatsType
  /** Whether to show detailed analysis with charts */
  showDetailed?: boolean
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
 * QuestionAnalysis component displays comprehensive analysis for a question
 * Composes QuestionStats and QuestionChart components
 * 
 * @example
 * ```tsx
 * <QuestionAnalysis question={questionStats} showDetailed={true} />
 * ```
 */
export function QuestionAnalysis({ question, showDetailed = true }: QuestionAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Question Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg leading-relaxed pr-4">
                {question.questionText}
              </CardTitle>
              <CardDescription className="mt-2">
                {getTypeName(question.questionType)}
                {question.isRequired && " • Obrigatória"}
              </CardDescription>
            </div>
            <Badge variant="outline" className="shrink-0">
              {getTypeIcon(question.questionType)} {getTypeName(question.questionType)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Basic Statistics */}
      <QuestionStats question={question} />

      {/* Detailed Charts */}
      {showDetailed && <QuestionChart question={question} />}

      {/* High Skip Rate Warning */}
      {question.skipRate > 20 && (
        <SkipRateWarning skipRate={question.skipRate} />
      )}
    </div>
  )
}

/**
 * Props for the SkipRateWarning component
 */
interface SkipRateWarningProps {
  /** Skip rate percentage */
  skipRate: number
}

/**
 * Warning component for high skip rates
 */
function SkipRateWarning({ skipRate }: SkipRateWarningProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">Taxa de pulo elevada</p>
            <p className="text-sm text-yellow-700">
              {skipRate.toFixed(1)}% dos respondentes pularam esta questão.
              Considere revisar a clareza ou obrigatoriedade da pergunta.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
