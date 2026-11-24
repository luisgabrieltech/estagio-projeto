"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LoadingState } from "./LoadingState"

/**
 * Props for PageLoading component
 */
export interface PageLoadingProps {
  /** Loading message to display */
  message?: string
  /** Whether to wrap in DashboardLayout */
  withLayout?: boolean
}

/**
 * PageLoading Component
 * 
 * Standardized full-page loading state for dashboard pages.
 * Provides consistent loading UX across the application.
 * 
 * @example
 * ```tsx
 * // With dashboard layout
 * if (loading) return <PageLoading message="Carregando dados..." />
 * 
 * // Without layout (for nested components)
 * if (loading) return <PageLoading message="Carregando..." withLayout={false} />
 * ```
 */
export function PageLoading({ 
  message = "Carregando...",
  withLayout = true 
}: PageLoadingProps) {
  const content = (
    <div className="w-full p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
      <LoadingState message={message} size="lg" />
    </div>
  )

  if (withLayout) {
    return <DashboardLayout>{content}</DashboardLayout>
  }

  return content
}

/**
 * CardLoading Component
 * 
 * Loading state for card content
 */
export function CardLoading({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingState message={message} size="md" />
    </div>
  )
}

/**
 * TableLoading Component
 * 
 * Loading state for table content with skeleton rows
 */
export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 py-4">
      <LoadingState variant="skeleton" lines={rows} size="md" />
    </div>
  )
}
