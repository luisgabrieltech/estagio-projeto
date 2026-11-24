'use client'

import type { Question } from '@/types/entities/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props for ValidationAlert component
 */
export interface ValidationAlertProps {
  /** Validation errors by question ID */
  errors: Record<string, string>
  /** All questions in the form (to get question text) */
  questions: Question[]
  /** Optional className for styling */
  className?: string
}

/**
 * ValidationAlert component
 * 
 * Displays validation errors in a summary alert at the top of the form.
 * Shows which questions have errors and what the error messages are.
 * 
 * @param props - Component props
 * @returns ValidationAlert component
 * 
 * @example
 * ```tsx
 * <ValidationAlert
 *   errors={validationErrors}
 *   questions={formQuestions}
 * />
 * ```
 */
export function ValidationAlert({
  errors,
  questions,
  className
}: ValidationAlertProps) {
  const errorCount = Object.keys(errors).length

  if (errorCount === 0) {
    return null
  }

  const questionsById = new Map(questions.map(q => [q.id, q]))

  return (
    <Alert variant="destructive" className={cn(className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {errorCount === 1
          ? 'Há 1 erro no formulário'
          : `Há ${errorCount} erros no formulário`}
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">Por favor, corrija os seguintes erros:</p>
        <ul className="list-disc list-inside space-y-1">
          {Object.entries(errors).map(([questionId, errorMessage]) => {
            const question = questionsById.get(questionId)
            const questionText = question?.text || 'Questão desconhecida'
            
            return (
              <li key={questionId} className="text-sm">
                <strong>{questionText}:</strong> {errorMessage}
              </li>
            )
          })}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
