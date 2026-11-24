"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QuestionInput } from "./QuestionInput"
import type { EvaluationQuestion, ResponseValue } from "@/hooks/evaluations/useEvaluationForm"

/**
 * Props for the QuestionCard component
 */
export interface QuestionCardProps {
  /** The question to display */
  question: EvaluationQuestion
  /** Question number for display */
  questionNumber: number
  /** Current response value */
  value: ResponseValue
  /** Callback when response changes */
  onChange: (value: ResponseValue) => void
  /** Whether this question has a validation error */
  hasError?: boolean
  /** Whether the input is disabled */
  disabled?: boolean
}

/**
 * QuestionCard Component
 * 
 * Displays a single question in a card format with the question text,
 * required indicator, validation error, and the appropriate input type.
 * 
 * @example
 * ```tsx
 * <QuestionCard
 *   question={question}
 *   questionNumber={1}
 *   value={responses[question.id]}
 *   onChange={(value) => handleResponseChange(question.id, value)}
 *   hasError={validationErrors[question.id]}
 * />
 * ```
 */
export function QuestionCard({ 
  question, 
  questionNumber,
  value, 
  onChange,
  hasError = false,
  disabled = false
}: QuestionCardProps) {
  const type = (question.type || "").toLowerCase()

  // Render section header
  if (type === "section") {
    return (
      <div className="py-4 px-2 bg-muted/40 rounded border mb-2">
        <div className="font-bold text-upe-blue text-lg">
          {question.text || "(Seção sem título)"}
        </div>
        {question.description && (
          <div className="text-muted-foreground text-sm mt-1">
            {question.description}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={hasError ? "border-red-500" : ""}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Question Label */}
          <div>
            <Label className="text-base font-medium text-upe-blue">
              {questionNumber}. {question.text}
              {question.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            {question.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {question.description}
              </p>
            )}
          </div>

          {/* Validation Error */}
          {hasError && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                Esta questão é obrigatória. Por favor, forneça uma resposta.
              </AlertDescription>
            </Alert>
          )}

          {/* Question Input */}
          <QuestionInput
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  )
}
