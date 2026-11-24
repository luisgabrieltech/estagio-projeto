"use client"

import { useState, useCallback, useMemo } from "react"
import type { EvaluationQuestion, ResponseValue } from "./useEvaluationForm"

/**
 * Validation error for a specific question
 */
export interface ValidationError {
  questionId: string
  message: string
}

/**
 * Options for useEvaluationValidation hook
 */
export interface UseEvaluationValidationOptions {
  /** Questions to validate */
  questions: EvaluationQuestion[]
  /** Current responses */
  responses: Record<string, ResponseValue>
  /** Function to check if a question should be shown */
  shouldShowQuestion: (question: EvaluationQuestion) => boolean
}

/**
 * Return type for useEvaluationValidation hook
 */
export interface UseEvaluationValidationReturn {
  /** Validation errors by question ID */
  validationErrors: Record<string, boolean>
  /** Whether to show validation errors */
  showValidationErrors: boolean
  /** Whether all required questions are answered */
  isValid: boolean
  /** Number of unanswered required questions */
  unansweredCount: number
  /** Validate all required questions */
  validateRequiredQuestions: () => boolean
  /** Clear validation error for a specific question */
  clearValidationError: (questionId: string) => void
  /** Clear all validation errors */
  clearAllErrors: () => void
  /** Check if a specific question has a validation error */
  hasError: (questionId: string) => boolean
}

/**
 * Check if a response value is empty
 */
function isEmptyResponse(value: ResponseValue): boolean {
  if (value === undefined || value === null || value === "") {
    return true
  }
  if (Array.isArray(value) && value.length === 0) {
    return true
  }
  if (typeof value === "object" && Object.keys(value).length === 0) {
    return true
  }
  return false
}


/**
 * Custom hook for validating evaluation form responses
 * 
 * This hook handles:
 * - Validating required questions
 * - Respecting conditional logic (only validates visible questions)
 * - Managing validation error state
 * - Providing validation feedback
 * 
 * @param options - Configuration options
 * @returns Validation state and functions
 * 
 * @example
 * ```tsx
 * function EvaluationForm({ formData, responses, shouldShowQuestion }) {
 *   const {
 *     validationErrors,
 *     showValidationErrors,
 *     isValid,
 *     unansweredCount,
 *     validateRequiredQuestions,
 *     clearValidationError
 *   } = useEvaluationValidation({
 *     questions: formData.questions,
 *     responses,
 *     shouldShowQuestion
 *   })
 * 
 *   const handleSubmit = () => {
 *     if (!validateRequiredQuestions()) {
 *       toast.error("Por favor, responda todas as questões obrigatórias")
 *       return
 *     }
 *     submitForm()
 *   }
 * 
 *   return (
 *     <form>
 *       {showValidationErrors && (
 *         <Alert variant="destructive">
 *           Existem {unansweredCount} questões obrigatórias não respondidas
 *         </Alert>
 *       )}
 *       {formData.questions.map(question => (
 *         <QuestionCard
 *           key={question.id}
 *           question={question}
 *           hasError={validationErrors[question.id]}
 *           onResponseChange={(value) => {
 *             handleResponseChange(question.id, value)
 *             clearValidationError(question.id)
 *           }}
 *         />
 *       ))}
 *     </form>
 *   )
 * }
 * ```
 */
export function useEvaluationValidation(
  options: UseEvaluationValidationOptions
): UseEvaluationValidationReturn {
  const { questions, responses, shouldShowQuestion } = options

  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({})
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  /**
   * Validate all required questions
   * Returns true if all required questions are answered
   */
  const validateRequiredQuestions = useCallback((): boolean => {
    const errors: Record<string, boolean> = {}
    let hasErrors = false

    questions.forEach((question) => {
      // Skip sections
      if (question.type === "section") return

      // Skip questions that shouldn't be shown (conditional logic)
      if (!shouldShowQuestion(question)) return

      // Check if required
      if (question.required) {
        const response = responses[question.id]

        if (isEmptyResponse(response)) {
          errors[question.id] = true
          hasErrors = true
        }
      }
    })

    setValidationErrors(errors)
    setShowValidationErrors(hasErrors)
    return !hasErrors
  }, [questions, responses, shouldShowQuestion])

  /**
   * Clear validation error for a specific question
   */
  const clearValidationError = useCallback((questionId: string) => {
    setValidationErrors((prev) => {
      if (!prev[questionId]) return prev
      const newErrors = { ...prev }
      delete newErrors[questionId]
      
      // If no more errors, hide the validation message
      if (Object.keys(newErrors).length === 0) {
        setShowValidationErrors(false)
      }
      
      return newErrors
    })
  }, [])

  /**
   * Clear all validation errors
   */
  const clearAllErrors = useCallback(() => {
    setValidationErrors({})
    setShowValidationErrors(false)
  }, [])

  /**
   * Check if a specific question has a validation error
   */
  const hasError = useCallback(
    (questionId: string): boolean => {
      return validationErrors[questionId] === true
    },
    [validationErrors]
  )

  /**
   * Whether all required questions are answered (computed)
   */
  const isValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0
  }, [validationErrors])

  /**
   * Number of unanswered required questions
   */
  const unansweredCount = useMemo(() => {
    return Object.values(validationErrors).filter(Boolean).length
  }, [validationErrors])

  return {
    validationErrors,
    showValidationErrors,
    isValid,
    unansweredCount,
    validateRequiredQuestions,
    clearValidationError,
    clearAllErrors,
    hasError,
  }
}
