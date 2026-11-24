"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useEvaluations } from "@/hooks/evaluations/useEvaluations"
import { EvaluationsHeader } from "./EvaluationsHeader"
import { EvaluationsSearch } from "./EvaluationsSearch"
import { EvaluationsTabs } from "./EvaluationsTabs"

/**
 * Props for the EvaluationsList component
 */
export interface EvaluationsListProps {
  /** Initial search query */
  initialSearchQuery?: string
  /** Whether to include the DashboardLayout wrapper */
  withLayout?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * EvaluationsList Component
 * 
 * Main component for displaying the list of evaluations.
 * Composes EvaluationsHeader, EvaluationsSearch, and EvaluationsTabs.
 * Uses the useEvaluations hook for data management.
 * 
 * @example
 * ```tsx
 * // With layout wrapper (for page use)
 * <EvaluationsList withLayout />
 * 
 * // Without layout (for embedding)
 * <EvaluationsList />
 * ```
 */
export function EvaluationsList({ 
  initialSearchQuery = "",
  withLayout = false,
  className = "" 
}: EvaluationsListProps) {
  const {
    loading,
    searchQuery,
    debouncedSearchQuery,
    userFunctionalRoles,
    availableEvaluations,
    completedEvaluations,
    setSearchQuery,
  } = useEvaluations({ initialSearchQuery })

  const content = (
    <div className={`w-full p-4 md:p-6 ${className}`}>
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <EvaluationsHeader functionalRoles={userFunctionalRoles} />
        <EvaluationsSearch 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Tabs with Available and Completed Evaluations */}
      <EvaluationsTabs
        availableEvaluations={availableEvaluations}
        completedEvaluations={completedEvaluations}
        loading={loading}
        hasSearchFilter={!!debouncedSearchQuery}
        userFunctionalRoles={userFunctionalRoles}
      />
    </div>
  )

  if (withLayout) {
    return <DashboardLayout>{content}</DashboardLayout>
  }

  return content
}
