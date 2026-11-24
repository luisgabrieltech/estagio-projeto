"use client"

import { Badge } from "@/components/ui/badge"
import { FUNCTIONAL_ROLES_OPTIONS } from "@/lib/utils"

/**
 * Props for the EvaluationsHeader component
 */
export interface EvaluationsHeaderProps {
  /** User's functional roles to display */
  functionalRoles?: string[]
  /** Additional CSS classes */
  className?: string
}

/**
 * EvaluationsHeader Component
 * 
 * Displays the page header with title, description, and user's functional roles.
 * 
 * @example
 * ```tsx
 * <EvaluationsHeader functionalRoles={['DOCENTE', 'COORDENADOR']} />
 * ```
 */
export function EvaluationsHeader({ 
  functionalRoles = [],
  className = "" 
}: EvaluationsHeaderProps) {
  /**
   * Get the label for a functional role
   */
  const getRoleLabel = (role: string): string => {
    const option = FUNCTIONAL_ROLES_OPTIONS.find(r => r.value === role)
    return option?.label || role
  }

  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-upe-blue">Avaliações</h1>
      <p className="text-muted-foreground">
        Gerencie e responda suas avaliações
      </p>
      
      {/* User's Functional Roles */}
      {functionalRoles.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs text-muted-foreground">Suas roles:</span>
          {functionalRoles.map((role) => (
            <Badge 
              key={role} 
              variant="secondary"
              className="text-xs bg-upe-blue/10 text-upe-blue"
            >
              {getRoleLabel(role)}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
