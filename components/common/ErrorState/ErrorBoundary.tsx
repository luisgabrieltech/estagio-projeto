"use client"

import React, { Component, ReactNode } from "react"
import { ErrorState } from "./ErrorState"
import { captureException, isSentryEnabled, setTag } from "@/lib/monitoring/sentry"

/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode
  /** Optional custom fallback component */
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  /** Optional error handler callback */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  /** Optional component name for better error tracking */
  componentName?: string
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary Component
 * 
 * React Error Boundary that catches JavaScript errors anywhere in the child
 * component tree and displays a fallback UI.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary
 *   fallback={({ error, reset }) => (
 *     <CustomErrorDisplay error={error} onReset={reset} />
 *   )}
 *   onError={(error, errorInfo) => {
 *     logErrorToService(error, errorInfo)
 *   }}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    
    // Report error to Sentry
    // Requirements: 5.3.1, 5.3.3
    if (isSentryEnabled()) {
      setTag("error_boundary", "true")
      if (this.props.componentName) {
        setTag("component_name", this.props.componentName)
      }
      
      captureException(error, {
        componentStack: errorInfo.componentStack,
        componentName: this.props.componentName,
        source: "ErrorBoundary",
      })
    }
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      // Default fallback UI
      return (
        <ErrorState
          title="Algo deu errado"
          message={
            process.env.NODE_ENV === "development"
              ? this.state.error.message
              : "Ocorreu um erro inesperado. Por favor, tente novamente."
          }
          onRetry={this.reset}
        />
      )
    }

    return this.props.children
  }
}
