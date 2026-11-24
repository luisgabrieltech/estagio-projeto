'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
}

const getAuthBasePath = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return basePath ? `${basePath}/api/auth` : '/api/auth'
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider 
      basePath={getAuthBasePath()}
      refetchInterval={5 * 60} 
    >
      {children}
    </NextAuthSessionProvider>
  )
} 