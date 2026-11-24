"use client"

import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Props for the ValidationSummary component
 */
export interface ValidationSummaryProps {
  /** Whether to show validation errors */
  showErrors: boolean
  /** Number of unanswered required questions */
  unansweredCount: number
  /** Whether the form is currently submitting */
  submitting?: boolean
  /** Callback when submit button is clicked */
  onSubmit: () => void
}

/**
 * ValidationSummary Component
 * 
 * Displays a summary of validation errors and the submit button.
 * Shows an alert when there are unanswered required questions.
 * 
 * @example
 * ```tsx
 * <ValidationSummary
 *   showErrors={showValidationErrors}
 *   unansweredCount={unansweredCount}
 *   submitting={submitting}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export function ValidationSummary({ 
  showErrors, 
  unansweredCount,
  submitting = false,
  onSubmit 
}: ValidationSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Validation Alert */}
      {showErrors && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Atenção:</strong> Existem questões obrigatórias que não foram respondidas. 
            Por favor, revise o formulário e responda todas as questões marcadas com asterisco (*).
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          className="bg-upe-blue hover:bg-upe-blue/90 text-white"
          onClick={onSubmit}
          disabled={submitting}
        >
          <Save className="mr-2 h-4 w-4" />
          {submitting ? "Enviando..." : "Enviar Avaliação"}
          {showErrors && unansweredCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unansweredCount} obrigatória(s)
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
