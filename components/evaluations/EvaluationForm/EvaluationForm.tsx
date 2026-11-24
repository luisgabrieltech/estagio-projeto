"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { routes } from "@/lib/config/routes"
import { useEvaluationForm, type ResponseValue } from "@/hooks/evaluations/useEvaluationForm"
import { useEvaluationValidation } from "@/hooks/evaluations/useEvaluationValidation"
import { EvaluationFormHeader } from "./EvaluationFormHeader"
import { QuestionCard } from "./QuestionCard"
import { ValidationSummary } from "./ValidationSummary"

/**
 * Props for the EvaluationForm component
 */
export interface EvaluationFormProps {
  /** Form ID to load and display */
  formId: string
  /** Optional callback on successful submission */
  onSuccess?: () => void
  /** Optional callback on submission error */
  onError?: (error: Error) => void
}

/**
 * Loading skeleton for the evaluation form
 */
function EvaluationFormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-1/3 bg-muted rounded"></div>
      <div className="h-4 w-1/4 bg-muted rounded"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-3/4 bg-muted rounded"></div>
      </div>
    </div>
  )
}

/**
 * Not found state for the evaluation form
 */
function EvaluationFormNotFound() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold">Formulário não encontrado</h2>
      <p className="text-muted-foreground">
        O formulário solicitado não existe ou não está mais disponível.
      </p>
    </div>
  )
}

/**
 * EvaluationForm Component
 * 
 * Main component for displaying and submitting an evaluation form.
 * Uses useEvaluationForm hook for form state and useEvaluationValidation
 * for validation logic.
 * 
 * Features:
 * - Loads form data from API
 * - Renders questions based on type
 * - Handles conditional logic for showing/hiding questions
 * - Validates required questions before submission
 * - Displays validation errors
 * - Submits responses to API
 * 
 * @example
 * ```tsx
 * <EvaluationForm formId="abc123" />
 * ```
 */
export function EvaluationForm({ 
  formId, 
  onSuccess, 
  onError 
}: EvaluationFormProps) {
  const router = useRouter()

  // Form state and actions
  const {
    formData,
    responses,
    loading,
    submitting,
    error,
    handleResponseChange,
    handleSubmit: submitForm,
    shouldShowQuestion,
  } = useEvaluationForm({ 
    formId,
    onSuccess,
    onError
  })

  // Validation state and actions
  const {
    validationErrors,
    showValidationErrors,
    unansweredCount,
    validateRequiredQuestions,
    clearValidationError,
  } = useEvaluationValidation({
    questions: formData?.questions || [],
    responses,
    shouldShowQuestion,
  })

  const handleBack = () => {
    router.push(routes.dashboard.evaluations.home)
  }

  const handleChange = (questionId: string, value: ResponseValue) => {
    handleResponseChange(questionId, value)
    clearValidationError(questionId)
  }

  const handleSubmit = async () => {
    if (!validateRequiredQuestions()) {
      toast.error("Por favor, responda todas as questões obrigatórias antes de enviar.")
      return
    }
    await submitForm()
  }

  if (loading) {
    return <EvaluationFormSkeleton />
  }

  // Error or not found state
  if (error || !formData) {
    return <EvaluationFormNotFound />
  }

  // Calculate question numbers (excluding sections)
  const getQuestionNumber = (index: number): number => {
    return formData.questions
      .slice(0, index)
      .filter((q) => (q.type || "").toLowerCase() !== "section")
      .length + 1
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <EvaluationFormHeader
        title={formData.title}
        description={formData.description}
        onBack={handleBack}
      />

      {/* Validation Alert (top) */}
      {showValidationErrors && (
        <ValidationSummary
          showErrors={true}
          unansweredCount={unansweredCount}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      )}

      {/* Questions */}
      <div className="space-y-4">
        {formData.questions.map((question, index) => {
          // Skip questions that shouldn't be shown (conditional logic)
          if (!shouldShowQuestion(question)) return null

          const type = (question.type || "").toLowerCase()
          const questionNumber = type !== "section" ? getQuestionNumber(index) : 0

          return (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={questionNumber}
              value={responses[question.id]}
              onChange={(value) => handleChange(question.id, value)}
              hasError={validationErrors[question.id]}
              disabled={submitting}
            />
          )
        })}
      </div>

      {/* Submit Section */}
      <ValidationSummary
        showErrors={showValidationErrors}
        unansweredCount={unansweredCount}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
