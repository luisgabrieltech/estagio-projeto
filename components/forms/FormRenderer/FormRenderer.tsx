'use client'

import { useState, useCallback } from 'react'
import { useConditionalLogic, type ResponseValues } from '@/hooks/forms/useConditionalLogic'
import { useFormValidation } from '@/hooks/forms/useFormValidation'
import type { Question } from '@/types/entities/form'
import { QuestionRenderer } from './QuestionRenderer'
import { SectionRenderer } from './SectionRenderer'
import { ValidationAlert } from './ValidationAlert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * Form data for rendering
 */
export interface FormData {
  id: string
  title: string
  description: string
  questions: Question[]
}

/**
 * Props for FormRenderer component
 */
export interface FormRendererProps {
  /** Form data to render */
  form: FormData
  /** Initial response values */
  initialValues?: ResponseValues
  /** Callback when form is submitted */
  onSubmit?: (responses: ResponseValues) => void | Promise<void>
  /** Callback when response changes */
  onChange?: (responses: ResponseValues) => void
  /** Whether form is in read-only mode */
  readOnly?: boolean
  /** Whether to show validation errors immediately */
  showValidation?: boolean
  /** Custom submit button text */
  submitText?: string
  /** Optional className for styling */
  className?: string
}

/**
 * FormRenderer component
 * 
 * Renders a complete form with questions, handles responses,
 * manages conditional logic, and validates responses.
 * 
 * @param props - Component props
 * @returns FormRenderer component
 * 
 * @example
 * ```tsx
 * <FormRenderer
 *   form={formData}
 *   onSubmit={(responses) => saveResponses(responses)}
 *   submitText="Enviar Respostas"
 * />
 * ```
 */
export function FormRenderer({
  form,
  initialValues = {},
  onSubmit,
  onChange,
  readOnly = false,
  showValidation = false,
  submitText = 'Enviar',
  className
}: FormRendererProps) {
  // State
  const [responses, setResponses] = useState<ResponseValues>(initialValues)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showErrors, setShowErrors] = useState(showValidation)

  // Conditional logic
  const { shouldShowQuestion, getVisibleQuestions } = useConditionalLogic({
    questions: form.questions,
    responses
  })

  /**
   * Handle response change for a question
   */
  const handleResponseChange = useCallback((questionId: string, value: any) => {
    const newResponses = {
      ...responses,
      [questionId]: value
    }
    
    setResponses(newResponses)
    onChange?.(newResponses)
    
    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }, [responses, onChange, validationErrors])

  /**
   * Validate responses
   */
  const validateResponses = useCallback((): boolean => {
    const errors: Record<string, string> = {}
    const visibleQuestions = getVisibleQuestions()

    // Check required questions
    visibleQuestions.forEach(question => {
      // Skip sections
      if (question.type === 'SECTION') {
        return
      }

      // Check if required and has no response
      if (question.required) {
        const response = responses[question.id]
        
        if (response === null || response === undefined || response === '') {
          errors[question.id] = 'Esta questão é obrigatória'
        } else if (Array.isArray(response) && response.length === 0) {
          errors[question.id] = 'Esta questão é obrigatória'
        }
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [responses, getVisibleQuestions])

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    // Show validation errors
    setShowErrors(true)

    // Validate
    if (!validateResponses()) {
      return
    }

    setSubmitting(true)

    try {
      await onSubmit?.(responses)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setSubmitting(false)
    }
  }, [responses, onSubmit, validateResponses])

  const visibleQuestions = getVisibleQuestions()

  // Show success message if submitted
  if (submitted) {
    return (
      <Card className={className}>
        <div className="p-8 text-center">
          <h3 className="text-xl font-semibold text-green-600 mb-2">
            Formulário enviado com sucesso!
          </h3>
          <p className="text-muted-foreground">
            Suas respostas foram registradas.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Form header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-upe-blue mb-2">{form.title}</h2>
        {form.description && (
          <p className="text-muted-foreground">{form.description}</p>
        )}
      </div>

      {/* Validation summary */}
      {showErrors && Object.keys(validationErrors).length > 0 && (
        <ValidationAlert
          errors={validationErrors}
          questions={form.questions}
          className="mb-6"
        />
      )}

      {/* Questions */}
      <div className="space-y-6">
        {visibleQuestions.map((question, index) => {
          // Render section
          if (question.type === 'SECTION') {
            return (
              <SectionRenderer
                key={question.id}
                question={question}
              />
            )
          }

          // Render question
          return (
            <QuestionRenderer
              key={question.id}
              question={question}
              value={responses[question.id]}
              onChange={(value: any) => handleResponseChange(question.id, value)}
              error={showErrors ? validationErrors[question.id] : undefined}
              readOnly={readOnly}
              questionNumber={index + 1}
            />
          )
        })}
      </div>

      {/* Submit button */}
      {!readOnly && (
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
          >
            {submitting ? 'Enviando...' : submitText}
          </Button>
        </div>
      )}
    </div>
  )
}
