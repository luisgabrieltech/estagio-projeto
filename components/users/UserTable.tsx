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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getImageUrl, FUNCTIONAL_ROLES_OPTIONS } from "@/lib/utils"
import { Key, Lock, Loader2, MoreHorizontal, Trash2, Unlock, User as UserIcon } from "lucide-react"
import type { User, UserRole } from "@/types/entities/user"

interface UserTableProps {
  users: User[]
  loading: boolean
  statusLoading: string | null
  onViewProfile: (user: User) => void
  onResetPassword: (userId: string) => void
  onRoleClick: (user: User) => void
  onFunctionalRolesClick: (user: User) => void
  onActivateUser: (userId: string) => void
  onDeactivateUser: (userId: string) => void
  onDeleteUser: (userId: string) => void
}

export function UserTable({
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
}: UserTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-upe-blue" />
      </div>
    )
  }

  return (
    <>
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
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
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
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <FunctionalRolesBadges user={user} />
                  </TableCell>
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
                  <TableCell className="text-right">
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
                          <DropdownMenuItem onClick={() => onDeactivateUser(user.id)} disabled={statusLoading === user.id}>
                            <Lock className="mr-2 h-4 w-4 text-yellow-500" />
                            <span>Desativar Usuário</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onActivateUser(user.id)} disabled={statusLoading === user.id}>
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <UserIcon className="h-8 w-8 mb-2" />
                    <p>Nenhum usuário encontrado</p>
                    <p className="text-sm">Tente ajustar os filtros ou adicionar novos usuários</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id} className="overflow-hidden">
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
                        <DropdownMenuItem onClick={() => onDeactivateUser(user.id)} disabled={statusLoading === user.id}>
                          <Lock className="mr-2 h-4 w-4 text-yellow-500" />
                          <span>Desativar Usuário</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onActivateUser(user.id)} disabled={statusLoading === user.id}>
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
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
            <UserIcon className="h-8 w-8 mb-2" />
            <p>Nenhum usuário encontrado</p>
            <p className="text-sm text-center px-4">Tente ajustar os filtros ou adicionar novos usuários</p>
          </div>
        )}
      </div>
    </>
  )
}

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
