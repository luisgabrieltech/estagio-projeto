"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FUNCTIONAL_ROLES_OPTIONS } from "@/lib/utils"
import { Filter, Search } from "lucide-react"

interface UserFiltersProps {
  searchQuery: string
  roleFilter: string
  functionalRoleFilter: string
  onSearchChange: (value: string) => void
  onRoleFilterChange: (value: string) => void
  onFunctionalRoleFilterChange: (value: string) => void
}

export function UserFilters({
  searchQuery,
  roleFilter,
  functionalRoleFilter,
  onSearchChange,
  onRoleFilterChange,
  onFunctionalRoleFilterChange,
}: UserFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filtros e Busca</CardTitle>
        <CardDescription>Filtre e busque usuários por cargo, cargo funcional ou palavras-chave</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, e-mail ou matrícula..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por cargo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos</SelectItem>
              <SelectItem value="ADMIN">Administradores</SelectItem>
              <SelectItem value="CSA">CSA</SelectItem>
              <SelectItem value="USER">Usuários</SelectItem>
            </SelectContent>
          </Select>
          <Select value={functionalRoleFilter} onValueChange={onFunctionalRoleFilterChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Cargo funcional" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos funcionais</SelectItem>
              {FUNCTIONAL_ROLES_OPTIONS.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
