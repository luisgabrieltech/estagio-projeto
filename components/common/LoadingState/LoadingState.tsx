"use client"

import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Props for the LoadingState component
 */
export interface LoadingStateProps {
  /** Loading state variant */
  variant?: "spinner" | "skeleton" | "inline"
  /** Loading state size */
  size?: "sm" | "md" | "lg"
  /** Optional message to display */
  message?: string
  /** Number of skeleton lines (only for variant="skeleton") */
  lines?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * LoadingState Component
 * 
 * Reusable component for displaying loading states with:
 * - Variants: spinner, skeleton, inline
 * - Sizes: sm, md, lg
 * - Optional message
 * - Configurable for different contexts
 * 
 * @example
 * ```tsx
 * // Default spinner
 * <LoadingState message="Carregando dados..." />
 * 
 * // Skeleton loader
 * <LoadingState variant="skeleton" lines={5} />
 * 
 * // Small inline spinner
 * <LoadingState variant="inline" size="sm" />
 * ```
 */
export function LoadingState({
  variant = "spinner",
  size = "md",
  message,
  lines = 3,
  className = ""
}: LoadingStateProps) {
  const getSpinnerSize = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4"
      case "lg":
        return "h-12 w-12"
      default:
        return "h-8 w-8"
    }
  }

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-sm"
      case "lg":
        return "text-lg"
      default:
        return "text-base"
    }
  }

  if (variant === "spinner") {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <Loader2 className={`${getSpinnerSize()} animate-spin text-upe-blue`} />
        {message && (
          <p className={`mt-4 text-muted-foreground ${getTextSize()}`}>
            {message}
          </p>
        )}
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className={`${getSpinnerSize()} animate-spin text-upe-blue`} />
        {message && (
          <span className={`text-muted-foreground ${getTextSize()}`}>
            {message}
          </span>
        )}
      </div>
    )
  }

  if (variant === "skeleton") {
    const getSkeletonHeight = () => {
      switch (size) {
        case "sm":
          return "h-3"
        case "lg":
          return "h-6"
        default:
          return "h-4"
      }
    }

    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={`${getSkeletonHeight()} w-full`}
            style={{
              width: index === lines - 1 ? "75%" : "100%"
            }}
          />
        ))}
      </div>
    )
  }

  return null
}

/**
 * LoadingSpinner Component
 * 
 * Shortcut for LoadingState with variant="spinner"
 */
export function LoadingSpinner({
  message,
  size = "md",
  className
}: Omit<LoadingStateProps, "variant">) {
  return (
    <LoadingState
      variant="spinner"
      message={message}
      size={size}
      className={className}
    />
  )
}

/**
 * LoadingSkeleton Component
 * 
 * Shortcut for LoadingState with variant="skeleton"
 */
export function LoadingSkeleton({
  lines = 3,
  size = "md",
  className
}: Omit<LoadingStateProps, "variant" | "message">) {
  return (
    <LoadingState
      variant="skeleton"
      lines={lines}
      size={size}
      className={className}
    />
  )
}

/**
 * InlineLoader Component
 * 
 * Shortcut for LoadingState with variant="inline"
 */
export function InlineLoader({
  message,
  size = "sm",
  className
}: Omit<LoadingStateProps, "variant">) {
  return (
    <LoadingState
      variant="inline"
      message={message}
      size={size}
      className={className}
    />
  )
}
