/**
 * Test Wrapper Utilities
 * 
 * Provides React Query wrapper and utilities for testing hooks and components
 * that depend on QueryClientProvider.
 * 
 * @module __tests__/utils/test-wrapper
 * Requirements: 3.1
 */
import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Creates a QueryClient configured for testing
 * 
 * - Disables retries to make tests deterministic
 * - Sets gcTime to 0 to prevent caching between tests
 * 
 * @returns QueryClient configured for testing
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface TestWrapperProps {
  children: ReactNode
}

/**
 * Test wrapper component with QueryClientProvider
 * 
 * Use this to wrap components that need React Query context
 * 
 * @example
 * ```tsx
 * render(
 *   <TestWrapper>
 *     <MyComponent />
 *   </TestWrapper>
 * )
 * ```
 */
export function TestWrapper({ children }: TestWrapperProps): React.ReactElement {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

/**
 * Creates a wrapper function for renderHook
 * 
 * Use this with @testing-library/react-hooks renderHook
 * 
 * @example
 * ```tsx
 * const { result } = renderHook(() => useMyHook(), {
 *   wrapper: createWrapper()
 * })
 * ```
 */
export function createWrapper() {
  const queryClient = createTestQueryClient()
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
