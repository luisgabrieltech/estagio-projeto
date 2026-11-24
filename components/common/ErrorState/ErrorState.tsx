"use client"

import { ReactNode } from "react"
import { AlertCircle, AlertTriangle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

/**
 * Props for the ErrorState component
 */
export interface ErrorStateProps {
  /** Error title */
  title?: string
  /** Error message */
  message: string
  /** Error severity */
  variant?: "error" | "warning" | "info"
  /** Optional retry action */
  onRetry?: () => void
  /** Optional custom action */
  action?: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * ErrorState Component
 * 
 * Reusable component for displaying error states with:
 * - Different severity levels (error, warning, info)
 * - Optional retry action
 * - Custom actions
 * - Consistent styling
 * 
 * @example
 * ```tsx
 * // Simple error
 * <ErrorState
 *   message="Erro ao carregar dados"
 *   onRetry={handleRetry}
 * />
 * 
 * // Warning with custom action
 * <ErrorState
 *   variant="warning"
 *   title="Atenção"
 *   message="Alguns dados podem estar desatualizados"
 *   action={<Button>Atualizar</Button>}
 * />
 * ```
 */
export function ErrorState({
  title,
  message,
  variant = "error",
  onRetry,
  action,
  className = ""
}: ErrorStateProps) {
  const getIcon = () => {
    switch (variant) {
      case "warning":
        return AlertTriangle
      case "info":
        return AlertCircle
      default:
        return XCircle
    }
  }

  const getVariantClass = () => {
    switch (variant) {
      case "warning":
        return "border-orange-500/50 text-orange-900 dark:text-orange-100"
      case "info":
        return "border-blue-500/50 text-blue-900 dark:text-blue-100"
      default:
        return "border-destructive/50 text-destructive"
    }
  }

  const Icon = getIcon()
  const defaultTitle = variant === "warning" ? "Atenção" : variant === "info" ? "Informação" : "Erro"

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <Alert className={`max-w-2xl ${getVariantClass()}`}>
        <Icon className="h-4 w-4" />
        <AlertTitle>{title || defaultTitle}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
        </AlertDescription>
        {(onRetry || action) && (
          <div className="mt-4 flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                Tentar Novamente
              </Button>
            )}
            {action}
          </div>
        )}
      </Alert>
    </div>
  )
}
