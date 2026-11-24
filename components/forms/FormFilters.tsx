"use client"

import { Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormFiltersProps {
  searchQuery: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function FormFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: FormFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filtros e Busca</CardTitle>
        <CardDescription>Filtre e busque formulários por status ou palavras-chave</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar formulários..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="AVAILABLE">Disponível</SelectItem>
              <SelectItem value="HIDDEN">Oculto</SelectItem>
              <SelectItem value="FROZEN">Congelado</SelectItem>
              <SelectItem value="SCHEDULED">Agendado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
