"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvailableEvaluations } from "./AvailableEvaluations"
import { CompletedEvaluations } from "./CompletedEvaluations"
import type { EvaluationForm } from "@/hooks/evaluations/useEvaluations"

/**
 * Props for the EvaluationsTabs component
 */
export interface EvaluationsTabsProps {
  /** List of available evaluations */
  availableEvaluations: EvaluationForm[]
  /** List of completed evaluations */
  completedEvaluations: EvaluationForm[]
  /** Whether data is loading */
  loading?: boolean
  /** Whether a search filter is active */
  hasSearchFilter?: boolean
  /** User's functional roles for empty state message */
  userFunctionalRoles?: string[]
  /** Default active tab */
  defaultTab?: "available" | "completed"
  /** Additional CSS classes */
  className?: string
}

/**
 * EvaluationsTabs Component
 * 
 * Tab navigation for switching between available and completed evaluations.
 * Composes AvailableEvaluations and CompletedEvaluations components.
 * 
 * @example
 * ```tsx
 * <EvaluationsTabs 
 *   availableEvaluations={available}
 *   completedEvaluations={completed}
 *   loading={loading}
 *   hasSearchFilter={!!searchQuery}
 *   userFunctionalRoles={['DOCENTE']}
 * />
 * ```
 */
export function EvaluationsTabs({ 
  availableEvaluations,
  completedEvaluations,
  loading = false,
  hasSearchFilter = false,
  userFunctionalRoles = [],
  defaultTab = "available",
  className = "" 
}: EvaluationsTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className={`space-y-6 ${className}`}>
      <TabsList className="bg-muted/50">
        <TabsTrigger 
          value="available" 
          className="data-[state=active]:bg-upe-blue data-[state=active]:text-white"
        >
          Disponíveis
          {!loading && availableEvaluations.length > 0 && (
            <span className="ml-2 text-xs">({availableEvaluations.length})</span>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="completed" 
          className="data-[state=active]:bg-upe-blue data-[state=active]:text-white"
        >
          Concluídas
          {!loading && completedEvaluations.length > 0 && (
            <span className="ml-2 text-xs">({completedEvaluations.length})</span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="available" className="space-y-4">
        <AvailableEvaluations
          evaluations={availableEvaluations}
          loading={loading}
          hasSearchFilter={hasSearchFilter}
          userFunctionalRoles={userFunctionalRoles}
        />
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        <CompletedEvaluations
          evaluations={completedEvaluations}
          loading={loading}
          hasSearchFilter={hasSearchFilter}
        />
      </TabsContent>
    </Tabs>
  )
}
