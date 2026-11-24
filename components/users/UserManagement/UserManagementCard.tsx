"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getImageUrl, FUNCTIONAL_ROLES_OPTIONS } from "@/lib/utils"
import { Key, Lock, MoreHorizontal, Trash2, Unlock, User as UserIcon } from "lucide-react"
import type { User, UserRole } from "@/types/entities/user"

/**
 * Props for the UserManagementCard component
 */
export interface UserManagementCardProps {
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
 * UserManagementCard Component
 * 
 * Card component for displaying a single user in the mobile view.
 * Includes user info, role badges, status, and action dropdown.
 * 
 * @example
 * ```tsx
 * <UserManagementCard
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
export function UserManagementCard({
  user,
  statusLoading,
  onViewProfile,
  onResetPassword,
  onRoleClick,
  onFunctionalRolesClick,
  onActivateUser,
  onDeactivateUser,
  onDeleteUser,
}: UserManagementCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={getImageUrl("/images/placeholders/placeholder.svg")} alt={user.name} />
              <AvatarFallback className="bg-upe-blue text-white">
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{user.name}</CardTitle>
              <CardDescription className="text-sm truncate">{user.email}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
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
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <RoleBadge role={user.role} />
          {user.active ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Ativo
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Inativo
            </Badge>
          )}
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Cargos Funcionais</div>
          <FunctionalRolesBadges user={user} />
        </div>
      </CardContent>
    </Card>
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
