"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { EvaluationCard } from "./EvaluationCard"
import type { EvaluationForm } from "@/hooks/evaluations/useEvaluations"

/**
 * Props for the CompletedEvaluations component
 */
export interface CompletedEvaluationsProps {
  /** List of completed evaluations */
  evaluations: EvaluationForm[]
  /** Whether data is loading */
  loading?: boolean
  /** Whether a search filter is active */
  hasSearchFilter?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * CompletedEvaluations Component
 * 
 * Displays a list of evaluations that the user has already completed.
 * Shows loading state, empty state, or list of EvaluationCards.
 * 
 * @example
 * ```tsx
 * <CompletedEvaluations 
 *   evaluations={completedEvaluations}
 *   loading={loading}
 *   hasSearchFilter={!!searchQuery}
 * />
 * ```
 */
export function CompletedEvaluations({ 
  evaluations,
  loading = false,
  hasSearchFilter = false,
  className = "" 
}: CompletedEvaluationsProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <h3 className="text-lg font-medium">Carregando avaliações concluídas...</h3>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (evaluations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma avaliação concluída</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {hasSearchFilter
              ? "Nenhuma avaliação concluída corresponde à sua busca."
              : "Você ainda não concluiu nenhuma avaliação."
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  // List of evaluations
  return (
    <div className={`space-y-4 ${className}`}>
      {evaluations.map((form) => (
        <EvaluationCard 
          key={form.id} 
          form={form} 
          isCompleted={true}
        />
      ))}
    </div>
  )
}
