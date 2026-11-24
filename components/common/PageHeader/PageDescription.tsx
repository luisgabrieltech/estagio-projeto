"use client"

/**
 * PageDescription Component
 * 
 * Displays a description or subtitle for a page.
 */
export interface PageDescriptionProps {
  /** The description text to display */
  children: string
  /** Additional CSS classes */
  className?: string
}

/**
 * PageDescription component for displaying page descriptions
 * 
 * @example
 * ```tsx
 * <PageDescription>Gerencie os usuários do sistema</PageDescription>
 * ```
 */
export function PageDescription({ children, className = "" }: PageDescriptionProps) {
  return (
    <p className={`text-muted-foreground mt-1 ${className}`}>
      {children}
    </p>
  )
}
