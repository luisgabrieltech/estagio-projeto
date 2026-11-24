import { Role, FunctionalRole } from "@prisma/client"

/**
 * Re-export Role enum as UserRole for convenience
 * 
 * Available values:
 * - ADMIN: System administrator with full access
 * - CSA: Comissão Setorial de Avaliação - manages forms
 * - USER: Regular user
 */
export { Role as UserRole } from "@prisma/client"

/**
 * Re-export FunctionalRole enum for convenience
 * 
 * Available values:
 * - DOCENTE: Teacher/Professor
 * - DISCENTE: Student
 * - EGRESSO: Alumni
 * - TECNICO_UNIDADES_ENSINO: Technical staff at teaching units
 * - TECNICO_COMPLEXO_HOSPITALAR: Technical staff at hospital complex
 */
export { FunctionalRole } from "@prisma/client"

/**
 * User entity representing a system user
 * 
 * @example
 * ```typescript
 * const user: User = {
 *   id: 'cuid123',
 *   name: 'João Silva',
 *   email: 'joao@example.test',
 *   role: 'USER',
 *   functionalRoles: ['DOCENTE'],
 *   active: true,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface User {
  /** Unique identifier (CUID) */
  id: string
  /** User's full name */
  name: string
  /** User's email address (unique) */
  email: string
  /** System role (ADMIN, CSA, or USER) */
  role: Role
  /** Functional roles within the institution */
  functionalRoles: FunctionalRole[]
  /** Additional user data stored as JSON */
  extraData?: UserExtraData
  /** Whether the user account is active */
  active: boolean
  /** Timestamp when user was created */
  createdAt: Date
  /** Timestamp when user was last updated */
  updatedAt: Date
}

/**
 * Extra data stored in JSON field for user
 * 
 * This interface allows for flexible storage of additional user information
 * that may vary by user type or institution requirements
 */
export interface UserExtraData {
  /** User's registration/matriculation number */
  registration?: string
  /** Legacy: functional roles as strings (use User.functionalRoles instead) */
  functionalRoles?: string[]
  /** Department or unit within the institution */
  department?: string
  /** Campus location */
  campus?: string
  /** Course or program of study */
  course?: string
  /** Magic link authentication token (temporary) */
  magicToken?: string | null
  /** Magic link token expiration timestamp */
  magicTokenExpires?: string | null
  /** Timestamp of last magic login */
  lastMagicLogin?: string
  /** How the user was created (e.g., 'magic-login', 'registration') */
  createdVia?: string
  /** Allow additional properties */
  [key: string]: any
}

/**
 * User profile for display purposes
 */
export interface UserProfile {
  id: string
  name: string
  email: string
  role: Role
  extraData?: UserExtraData
  functionalRoles: FunctionalRole[]
}

/**
 * User with functional roles as strings
 */
export interface UserWithFunctionalRoles {
  id: string
  name: string
  email: string
  role: Role
  functionalRoles: string[]
}

/**
 * User summary with response and certificate counts
 */
export interface UserWithCounts {
  id: string
  name: string
  email: string
  role: Role
  extraData?: UserExtraData
  active: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    responses: number
    certificates: number
  }
}

/**
 * Filters for querying users
 */
export interface UserFilters {
  search?: string
  role?: Role | string
  functionalRole?: FunctionalRole | string
  active?: boolean
  page?: number
  pageSize?: number
}

/**
 * User creation data (for registration)
 */
export interface UserCreateData {
  /** User's full name */
  name: string
  /** User's email address */
  email: string
  /** User's password (will be hashed) */
  password: string
  /** System role (defaults to USER) */
  role?: Role
  /** Functional roles within the institution */
  functionalRoles?: FunctionalRole[]
  /** Additional user data */
  extraData?: UserExtraData
}

/**
 * User update data (for profile updates)
 */
export interface UserUpdateData {
  /** User's full name */
  name?: string
  /** User's email address */
  email?: string
  /** System role */
  role?: Role
  /** Functional roles within the institution */
  functionalRoles?: FunctionalRole[]
  /** Additional user data */
  extraData?: UserExtraData
  /** Whether the user account is active */
  active?: boolean
}

/**
 * User response data (from API)
 * Includes computed counts for responses and certificates
 */
export interface UserResponse {
  /** User data */
  user: User
  /** Number of form responses */
  responsesCount: number
  /** Number of certificates */
  certificatesCount: number
}

/**
 * User list response from API
 */
export interface UserListResponse {
  /** List of users */
  users: User[]
  /** Pagination data */
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * Role display labels in Portuguese
 */
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  CSA: 'CSA',
  USER: 'Usuário'
}

/**
 * Functional role display labels in Portuguese
 */
export const FUNCTIONAL_ROLE_LABELS: Record<FunctionalRole, string> = {
  DOCENTE: 'Docente',
  DISCENTE: 'Discente',
  EGRESSO: 'Egresso',
  TECNICO_UNIDADES_ENSINO: 'Técnico - Unidades de Ensino',
  TECNICO_COMPLEXO_HOSPITALAR: 'Técnico - Complexo Hospitalar'
}
