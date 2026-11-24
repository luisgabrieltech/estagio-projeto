"use client"

import { Loader2, User as UserIcon } from "lucide-react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserManagementTableRow } from "./UserManagementTableRow"
import { UserManagementCard } from "./UserManagementCard"
import type { User } from "@/types/entities/user"

/**
 * Props for the UserManagementTable component
 */
export interface UserManagementTableProps {
  /** List of users to display */
  users: User[]
  /** Whether the table is in loading state */
  loading: boolean
  /** ID of user currently having status changed (for loading indicator) */
  statusLoading: string | null
  /** Callback when user profile is viewed */
  onViewProfile: (user: User) => void
  /** Callback when password reset is requested */
  onResetPassword: (userId: string) => void
  /** Callback when role edit is clicked */
  onRoleClick: (user: User) => void
  /** Callback when functional roles edit is clicked */
  onFunctionalRolesClick: (user: User) => void
  /** Callback when user is activated */
  onActivateUser: (userId: string) => void
  /** Callback when user is deactivated */
  onDeactivateUser: (userId: string) => void
  /** Callback when user is deleted */
  onDeleteUser: (userId: string) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * UserManagementTable Component
 * 
 * Table component for displaying users in the admin dashboard.
 * Shows desktop table view and mobile card view.
 * 
 * @example
 * ```tsx
 * <UserManagementTable
 *   users={users}
 *   loading={loading}
 *   statusLoading={statusLoading}
 *   onViewProfile={handleViewProfile}
 *   onResetPassword={handleResetPassword}
 *   onRoleClick={handleRoleClick}
 *   onFunctionalRolesClick={handleFunctionalRolesClick}
 *   onActivateUser={handleActivateUser}
 *   onDeactivateUser={handleDeactivateUser}
 *   onDeleteUser={handleDeleteUser}
 * />
 * ```
 */
export function UserManagementTable({
  users,
  loading,
  statusLoading,
  onViewProfile,
  onResetPassword,
  onRoleClick,
  onFunctionalRolesClick,
  onActivateUser,
  onDeactivateUser,
  onDeleteUser,
  className = ""
}: UserManagementTableProps) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-upe-blue" />
      </div>
    )
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-muted-foreground py-12 ${className}`}>
        <UserIcon className="h-8 w-8 mb-2" />
        <p>Nenhum usuário encontrado</p>
        <p className="text-sm text-center px-4">
          Tente ajustar os filtros ou adicionar novos usuários
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Cargos Funcionais</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserManagementTableRow
                key={user.id}
                user={user}
                statusLoading={statusLoading}
                onViewProfile={onViewProfile}
                onResetPassword={onResetPassword}
                onRoleClick={onRoleClick}
                onFunctionalRolesClick={onFunctionalRolesClick}
                onActivateUser={onActivateUser}
                onDeactivateUser={onDeactivateUser}
                onDeleteUser={onDeleteUser}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <UserManagementCard
            key={user.id}
            user={user}
            statusLoading={statusLoading}
            onViewProfile={onViewProfile}
            onResetPassword={onResetPassword}
            onRoleClick={onRoleClick}
            onFunctionalRolesClick={onFunctionalRolesClick}
            onActivateUser={onActivateUser}
            onDeactivateUser={onDeactivateUser}
            onDeleteUser={onDeleteUser}
          />
        ))}
      </div>
    </div>
  )
}
