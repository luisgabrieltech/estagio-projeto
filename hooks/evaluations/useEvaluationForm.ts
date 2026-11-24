"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiRequest } from "@/lib/utils/api-utils"
import { routes } from "@/lib/config/routes"
import { getVisibleQuestionIds, resolveQuestion } from "@/lib/domain/form/question-visibility"
import type { ConditionalRule, QuestionType } from "@/types/entities/form"

export type { ConditionalRule } from "@/types/entities/form"

/**
 * Question interface for evaluation forms
 */
export interface EvaluationQuestion {
  id: string
  customId?: string | null
  text: string
  type: QuestionType | Lowercase<QuestionType>
  required: boolean
  options?: string[]
  rows?: string[]
  columns?: string[]
  conditional?: ConditionalRule
  description?: string
}

/**
 * Form data interface for evaluations
 */
export interface EvaluationFormData {
  id: string
  title: string
  description: string
  questions: EvaluationQuestion[]
}

/**
 * Response value type - can be string, array, or object (for grid)
 */
export type ResponseValue = string | string[] | Record<string, string> | undefined

/**
 * Options for useEvaluationForm hook
 */
export interface UseEvaluationFormOptions {
  /** Form ID to load */
  formId: string
  /** Callback on successful submission */
  onSuccess?: () => void
  /** Callback on submission error */
  onError?: (error: Error) => void
}


/**
 * Return type for useEvaluationForm hook
 */
export interface UseEvaluationFormReturn {
  /** Form data */
  formData: EvaluationFormData | null
  /** Current responses */
  responses: Record<string, ResponseValue>
  /** Loading state */
  loading: boolean
  /** Submitting state */
  submitting: boolean
  /** Error state */
  error: string | null
  /** Handle response change for a question */
  handleResponseChange: (questionId: string, value: ResponseValue) => void
  /** Submit the evaluation */
  handleSubmit: () => Promise<void>
  /** Check if a question should be shown based on conditional logic */
  shouldShowQuestion: (question: EvaluationQuestion) => boolean
  /** Resolve question ID (customId or id) */
  resolveQuestionId: (targetId: string) => string
}

/**
 * Custom hook for managing evaluation form state and submission
 * 
 * This hook handles:
 * - Loading form data from the API
 * - Managing response state for all questions
 * - Handling response changes
 * - Conditional logic for showing/hiding questions
 * - Form submission with proper data formatting
 * 
 * @param options - Configuration options
 * @returns Form data, responses, and control functions
 * 
 * @example
 * ```tsx
 * function EvaluationFormPage({ formId }: { formId: string }) {
 *   const {
 *     formData,
 *     responses,
 *     loading,
 *     submitting,
 *     handleResponseChange,
 *     handleSubmit,
 *     shouldShowQuestion
 *   } = useEvaluationForm({ formId })
 * 
 *   if (loading) return <Loading />
 *   if (!formData) return <NotFound />
 * 
 *   return (
 *     <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
 *       {formData.questions.map(question => (
 *         shouldShowQuestion(question) && (
 *           <QuestionInput
 *             key={question.id}
 *             question={question}
 *             value={responses[question.id]}
 *             onChange={(value) => handleResponseChange(question.id, value)}
 *           />
 *         )
 *       ))}
 *       <button type="submit" disabled={submitting}>
 *         {submitting ? 'Enviando...' : 'Enviar'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useEvaluationForm(
  options: UseEvaluationFormOptions
): UseEvaluationFormReturn {
  const { formId, onSuccess, onError } = options
  const router = useRouter()

  const [formData, setFormData] = useState<EvaluationFormData | null>(null)
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch form data
   */
  useEffect(() => {
    const fetchForm = async () => {
      if (!formId) return

      setLoading(true)
      setError(null)

      try {
        const data = await apiRequest<EvaluationFormData>(`/forms?id=${formId}`)
        setFormData(data)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao carregar formulário"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [formId])

  /**
   * Handle response change for a question
   */
  const handleResponseChange = useCallback(
    (questionId: string, value: ResponseValue) => {
      setResponses((prev) => ({
        ...prev,
        [questionId]: value,
      }))
    },
    []
  )

  /**
   * Resolve question ID (customId or id)
   */
  const resolveQuestionId = useCallback(
    (targetId: string): string => {
      if (!formData) return targetId
      return resolveQuestion(targetId, formData.questions)?.id ?? targetId
    },
    [formData]
  )

  const visibleQuestionIds = useMemo(
    () => getVisibleQuestionIds(formData?.questions ?? [], responses),
    [formData, responses],
  )

  const shouldShowQuestion = useCallback(
    (question: EvaluationQuestion) => visibleQuestionIds.has(question.id),
    [visibleQuestionIds],
  )

  /**
   * Format response value for submission
   */
  const formatResponseValue = useCallback(
    (questionId: string, value: ResponseValue): string => {
      if (value === undefined || value === null) return ""

      if (Array.isArray(value)) {
        // Preserve option labels that contain commas.
        return JSON.stringify(value)
      }

      if (typeof value === "object") {
        // For grid: convert to readable format
        const question = formData?.questions.find((q) => q.id === questionId)
        const questionType = (question?.type || "").toLowerCase()

        if (
          questionType === "grid" &&
          question &&
          question.rows &&
          question.columns
        ) {
          const gridResponses = Object.entries(value).map(
            ([_rowIndex, cellValue]) => {
              const [row, col] = String(cellValue).split("-").map(Number)
              const rowText = question.rows?.[row] || `Linha ${row + 1}`
              const colText = question.columns?.[col] || `Coluna ${col + 1}`
              return `${rowText}: ${colText}`
            }
          )
          return gridResponses.join("; ")
        }

        // Fallback to JSON
        return JSON.stringify(value)
      }

      return String(value ?? "")
    },
    [formData]
  )

  /**
   * Submit the evaluation
   */
  const handleSubmit = useCallback(async () => {
    if (!formData) return

    setSubmitting(true)

    try {
      const payload = Object.entries(responses)
        .filter(([questionId]) => visibleQuestionIds.has(questionId))
        .map(([questionId, value]) => ({
          formId: formData.id,
          questionId,
          value: formatResponseValue(questionId, value),
        }))

      await apiRequest("/responses", {
        method: "POST",
        body: JSON.stringify({ responses: payload }),
      })

      toast.success("Avaliação enviada com sucesso!")
      onSuccess?.()
      router.push(routes.dashboard.evaluations.home)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao enviar avaliação"
      toast.error(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setSubmitting(false)
    }
  }, [formData, responses, visibleQuestionIds, formatResponseValue, onSuccess, onError, router])

  return {
    formData,
    responses,
    loading,
    submitting,
    error,
    handleResponseChange,
    handleSubmit,
    shouldShowQuestion,
    resolveQuestionId,
  }
}
