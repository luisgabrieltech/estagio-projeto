"use client"

import { ReactNode } from "react"

/**
 * PageActions Component
 * 
 * Container for action buttons or other interactive elements in the page header.
 */
export interface PageActionsProps {
  /** Action elements (buttons, dropdowns, etc.) */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * PageActions component for displaying action buttons in page headers
 * 
 * @example
 * ```tsx
 * <PageActions>
 *   <Button>Novo Usuário</Button>
 *   <Button variant="outline">Exportar</Button>
 * </PageActions>
 * ```
 */
export function PageActions({ children, className = "" }: PageActionsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  )
}
