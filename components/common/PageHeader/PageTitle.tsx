"use client"

/**
 * PageTitle Component
 * 
 * Displays the main title of a page with consistent styling.
 */
export interface PageTitleProps {
  /** The title text to display */
  children: string
  /** Additional CSS classes */
  className?: string
}

/**
 * PageTitle component for displaying page titles
 * 
 * @example
 * ```tsx
 * <PageTitle>Gestão de Usuários</PageTitle>
 * ```
 */
export function PageTitle({ children, className = "" }: PageTitleProps) {
  return (
    <h1 className={`text-2xl font-bold text-upe-blue ${className}`}>
      {children}
    </h1>
  )
}
