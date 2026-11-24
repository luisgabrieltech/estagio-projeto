"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { EvaluationCard } from "./EvaluationCard"
import { FUNCTIONAL_ROLES_OPTIONS } from "@/lib/utils"
import type { EvaluationForm } from "@/hooks/evaluations/useEvaluations"

/**
 * Props for the AvailableEvaluations component
 */
export interface AvailableEvaluationsProps {
  /** List of available evaluations */
  evaluations: EvaluationForm[]
  /** Whether data is loading */
  loading?: boolean
  /** Whether a search filter is active */
  hasSearchFilter?: boolean
  /** User's functional roles for empty state message */
  userFunctionalRoles?: string[]
  /** Additional CSS classes */
  className?: string
}

/**
 * AvailableEvaluations Component
 * 
 * Displays a list of available evaluations that the user can respond to.
 * Shows loading state, empty state, or list of EvaluationCards.
 * 
 * @example
 * ```tsx
 * <AvailableEvaluations 
 *   evaluations={availableEvaluations}
 *   loading={loading}
 *   hasSearchFilter={!!searchQuery}
 *   userFunctionalRoles={['DOCENTE']}
 * />
 * ```
 */
export function AvailableEvaluations({ 
  evaluations,
  loading = false,
  hasSearchFilter = false,
  userFunctionalRoles = [],
  className = "" 
}: AvailableEvaluationsProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <h3 className="text-lg font-medium">Carregando avaliações...</h3>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (evaluations.length === 0) {
    const getRolesLabels = () => {
      return userFunctionalRoles
        .map(role => FUNCTIONAL_ROLES_OPTIONS.find(r => r.value === role)?.label || role)
        .join(", ")
    }

    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma avaliação encontrada</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {hasSearchFilter 
              ? "Não há avaliações disponíveis que correspondam à sua busca."
              : "Não há avaliações disponíveis para suas roles funcionais ou todas já foram respondidas."
            }
          </p>
          {userFunctionalRoles.length > 0 && !hasSearchFilter && (
            <p className="text-xs text-muted-foreground mt-2">
              Você tem acesso a formulários para: {getRolesLabels()}
            </p>
          )}
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
          isCompleted={false}
        />
      ))}
    </div>
  )
}
