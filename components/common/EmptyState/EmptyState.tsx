"use client"

import { ReactNode } from "react"
import { LucideIcon, FileQuestion, AlertCircle, Lock, Inbox } from "lucide-react"

/**
 * Props for the EmptyState component
 */
export interface EmptyStateProps {
  /** Icon to display (Lucide component or ReactNode) */
  icon?: LucideIcon | ReactNode
  /** Empty state title */
  title: string
  /** Optional empty state description */
  description?: string
  /** Optional action (button, link, etc) */
  action?: ReactNode
  /** Empty state variant */
  variant?: "default" | "error" | "no-permission" | "no-data"
  /** Additional CSS classes */
  className?: string
}

/**
 * EmptyState Component
 * 
 * Reusable component for displaying empty states with:
 * - Customizable icon
 * - Title and description
 * - Optional action (button, link, etc)
 * - Pre-defined variants (no data, error, no permission)
 * 
 * @example
 * ```tsx
 * // Default empty state
 * <EmptyState
 *   title="Nenhum usuário encontrado"
 *   description="Não há usuários cadastrados no sistema"
 *   action={
 *     <Button>
 *       <Plus className="mr-2 h-4 w-4" />
 *       Adicionar Usuário
 *     </Button>
 *   }
 * />
 * 
 * // Error state
 * <EmptyState
 *   variant="error"
 *   title="Erro ao carregar dados"
 *   description="Ocorreu um erro ao carregar os dados. Tente novamente."
 *   action={<Button onClick={retry}>Tentar Novamente</Button>}
 * />
 * 
 * // No permission state
 * <EmptyState
 *   variant="no-permission"
 *   title="Acesso negado"
 *   description="Você não tem permissão para acessar este recurso"
 * />
 * ```
 */
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  variant = "default",
  className = ""
}: EmptyStateProps) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case "error":
        return AlertCircle
      case "no-permission":
        return Lock
      case "no-data":
        return Inbox
      default:
        return FileQuestion
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case "error":
        return "text-destructive"
      case "no-permission":
        return "text-orange-500"
      case "no-data":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  const iconColor = getIconColor()
  
  // Determine which icon to render
  const IconComponent = (icon && typeof icon === 'function') ? icon as LucideIcon : getDefaultIcon()

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className={`mb-4 ${iconColor}`}>
        {icon && typeof icon !== 'function' ? (
          // Custom ReactNode icon
          <>{icon}</>
        ) : (
          // LucideIcon component
          <IconComponent className="h-16 w-16" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}
