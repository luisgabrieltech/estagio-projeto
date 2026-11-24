"use client"

import { PageHeader } from "@/components/common/PageHeader"

/**
 * Props for the UserManagementHeader component
 */
export interface UserManagementHeaderProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * UserManagementHeader Component
 * 
 * Header component for the user management page.
 * Uses the common PageHeader component for consistent styling.
 * 
 * @example
 * ```tsx
 * <UserManagementHeader />
 * ```
 */
export function UserManagementHeader({ className = "" }: UserManagementHeaderProps) {
  return (
    <PageHeader
      title="Gestão de Usuários"
      description="Gerencie os usuários do sistema"
      className={className}
    />
  )
}
