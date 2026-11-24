"use client"

import { useSession } from "next-auth/react"
import { useQuery } from '@tanstack/react-query'
import { useEvaluations } from '@/hooks/evaluations'
import { userKeys } from '@/lib/query/keys'
import { apiRequest } from '@/lib/utils/api-utils'
import { getUserFunctionalRoles, FUNCTIONAL_ROLES_OPTIONS } from '@/lib/utils'
import type { UserProfile, EvaluationForm } from '@/hooks/evaluations/useEvaluations'

/**
 * Dashboard data structure
 */
export interface DashboardData {
  /** Pending evaluations count */
  pendingCount: number
  /** Completed evaluations count */
  completedCount: number
  /** Pending evaluations list (limited) */
  pendingForms: EvaluationForm[]
  /** User's functional roles */
  userFunctionalRoles: string[]
  /** User's functional roles with labels */
  userFunctionalRolesWithLabels: { value: string; label: string }[]
  /** User profile data */
  userProfile: UserProfile | null
}

/**
 * Return type for useDashboard hook
 */
export interface UseDashboardReturn extends DashboardData {
  /** Loading state */
  loading: boolean
  /** Error state */
  error: string | null
  /** Refresh all data */
  refresh: () => Promise<void>
}

/**
 * Custom hook for dashboard data
 * 
 * This hook combines evaluations data with user profile to provide
 * all necessary data for the dashboard page.
 * 
 * Uses TanStack Query through useEvaluations for automatic caching,
 * background refetching, and request deduplication.
 * 
 * @returns Dashboard data, loading state, and control functions
 * 
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const {
 *     pendingCount,
 *     completedCount,
 *     pendingForms,
 *     userFunctionalRolesWithLabels,
 *     loading,
 *     error,
 *     refresh
 *   } = useDashboard()
 * 
 *   if (loading) return <DashboardSkeleton />
 *   if (error) return <ErrorState error={error} />
 * 
 *   return (
 *     <div>
 *       <StatsCards pending={pendingCount} completed={completedCount} />
 *       <RoleBadges roles={userFunctionalRolesWithLabels} />
 *       <PendingFormsList forms={pendingForms} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useDashboard(): UseDashboardReturn {
  const { data: session } = useSession()

  // Use evaluations hook for forms and responses data
  const {
    availableEvaluations,
    completedEvaluations,
    userProfile,
    userFunctionalRoles,
    loading: evaluationsLoading,
    error: evaluationsError,
    refresh: refreshEvaluations
  } = useEvaluations()

  // Derive dashboard data from evaluations
  const pendingCount = availableEvaluations.length
  const completedCount = completedEvaluations.length
  
  // Limit pending forms for dashboard display (show first 5)
  const pendingForms = availableEvaluations.slice(0, 5)

  // Map functional roles to labels
  const userFunctionalRolesWithLabels = userFunctionalRoles.map(role => {
    const roleOption = FUNCTIONAL_ROLES_OPTIONS.find(r => r.value === role)
    return {
      value: role,
      label: roleOption?.label || role
    }
  })

  return {
    pendingCount,
    completedCount,
    pendingForms,
    userFunctionalRoles,
    userFunctionalRolesWithLabels,
    userProfile,
    loading: evaluationsLoading,
    error: evaluationsError,
    refresh: refreshEvaluations
  }
}
