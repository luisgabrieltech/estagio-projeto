"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableCell, TableRow } from "@/components/ui/table"
import { getImageUrl, FUNCTIONAL_ROLES_OPTIONS } from "@/lib/utils"
import { Key, Lock, MoreHorizontal, Trash2, Unlock, User as UserIcon } from "lucide-react"
import type { User, UserRole } from "@/types/entities/user"

/**
 * Props for the UserManagementTableRow component
 */
export interface UserManagementTableRowProps {
  /** User data to display */
  user: User
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
}

/**
 * UserManagementTableRow Component
 * 
 * Table row component for displaying a single user in the desktop view.
 * Includes user info, role badges, status, and action dropdown.
 * 
 * @example
 * ```tsx
 * <UserManagementTableRow
 *   user={user}
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
export function UserManagementTableRow({
  user,
  statusLoading,
  onViewProfile,
  onResetPassword,
  onRoleClick,
  onFunctionalRolesClick,
  onActivateUser,
  onDeactivateUser,
  onDeleteUser,
}: UserManagementTableRowProps) {
  return (
    <TableRow>
      {/* User Info */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getImageUrl("/images/placeholders/placeholder.svg")} alt={user.name} />
            <AvatarFallback className="bg-upe-blue text-white">
              {user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{user.name}</div>
        </div>
      </TableCell>

      {/* Email */}
      <TableCell>{user.email}</TableCell>

      {/* Role */}
      <TableCell>
        <RoleBadge role={user.role} />
      </TableCell>

      {/* Functional Roles */}
      <TableCell>
        <FunctionalRolesBadges user={user} />
      </TableCell>

      {/* Status */}
      <TableCell>
        {user.active ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ativo
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Inativo
          </Badge>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <UserActionsDropdown
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
      </TableCell>
    </TableRow>
  )
}

/**
 * Badge component for displaying user role
 */
function RoleBadge({ role }: { role: UserRole | string }) {
  switch (role) {
    case "ADMIN":
      return <Badge className="bg-upe-red hover:bg-upe-red/90">Administrador</Badge>
    case "CSA":
      return <Badge className="bg-purple-500 hover:bg-purple-600">CSA</Badge>
    case "USER":
      return <Badge variant="outline">Usuário</Badge>
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}

/**
 * Badge component for displaying user functional roles
 */
function FunctionalRolesBadges({ user }: { user: User }) {
  const roles = user.extraData?.functionalRoles || []

  if (!roles || roles.length === 0) {
    return <span className="text-muted-foreground text-sm">Não informado</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role: string) => {
        const roleLabel = FUNCTIONAL_ROLES_OPTIONS.find((r) => r.value === role)?.label || role
        return (
          <Badge key={role} variant="secondary" className="text-xs">
            {roleLabel}
          </Badge>
        )
      })}
    </div>
  )
}

/**
 * Dropdown menu for user actions
 */
function UserActionsDropdown({
  user,
  statusLoading,
  onViewProfile,
  onResetPassword,
  onRoleClick,
  onFunctionalRolesClick,
  onActivateUser,
  onDeactivateUser,
  onDeleteUser,
}: {
  user: User
  statusLoading: string | null
  onViewProfile: (user: User) => void
  onResetPassword: (userId: string) => void
  onRoleClick: (user: User) => void
  onFunctionalRolesClick: (user: User) => void
  onActivateUser: (userId: string) => void
  onDeactivateUser: (userId: string) => void
  onDeleteUser: (userId: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewProfile(user)}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Ver Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
          <Key className="mr-2 h-4 w-4" />
          <span>Redefinir Senha</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRoleClick(user)}>
          <UserIcon className="mr-2 h-4 w-4 text-upe-blue" />
          <span>Definir Cargo</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFunctionalRolesClick(user)}>
          <UserIcon className="mr-2 h-4 w-4 text-purple-600" />
          <span>Gerenciar Cargos Funcionais</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.active ? (
          <DropdownMenuItem 
            onClick={() => onDeactivateUser(user.id)} 
            disabled={statusLoading === user.id}
          >
            <Lock className="mr-2 h-4 w-4 text-yellow-500" />
            <span>Desativar Usuário</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            onClick={() => onActivateUser(user.id)} 
            disabled={statusLoading === user.id}
          >
            <Unlock className="mr-2 h-4 w-4 text-green-500" />
            <span>Ativar Usuário</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-upe-red focus:text-upe-red"
          onClick={() => onDeleteUser(user.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir Usuário</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
