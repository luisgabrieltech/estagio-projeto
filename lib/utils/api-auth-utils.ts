/**
 * API Authentication and Authorization utilities
 * Consolidates common auth patterns used across API routes
 * 
 * NOTE: This file is SERVER-ONLY. Do not import in client components.
 */

import "server-only"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { ADMIN_ROLES } from "@/lib/config"

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean
  session: any | null
  error?: NextResponse
}

/**
 * Validates user session and returns session or error response
 * @returns Object with validation result, session, and optional error response
 * @example
 * const { valid, session, error } = await validateSession()
 * if (!valid) return error
 */
export async function validateSession(): Promise<SessionValidationResult> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      valid: false,
      session: null,
      error: NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }
  }
  
  return {
    valid: true,
    session
  }
}

/**
 * Validates user session and admin role (ADMIN or CSA)
 * @returns Object with validation result, session, and optional error response
 * @example
 * const { valid, session, error } = await validateAdminSession()
 * if (!valid) return error
 */
export async function validateAdminSession(): Promise<SessionValidationResult> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      valid: false,
      session: null,
      error: NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }
  }
  
  if (!ADMIN_ROLES.includes(session.user.role as any)) {
    return {
      valid: false,
      session,
      error: NextResponse.json({ 
        message: "Sem permissão para acessar esta API" 
      }, { status: 403 })
    }
  }
  
  return {
    valid: true,
    session
  }
}

/**
 * Validates user session by email
 * @returns Object with validation result, session, and optional error response
 * @example
 * const { valid, session, error } = await validateSessionByEmail()
 * if (!valid) return error
 */
export async function validateSessionByEmail(): Promise<SessionValidationResult> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return {
      valid: false,
      session: null,
      error: NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }
  }
  
  return {
    valid: true,
    session
  }
}
