"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchFilter } from "@/components/common/Filters/SearchFilter"
import { SelectFilter, SelectOption } from "@/components/common/Filters/SelectFilter"

/**
 * Props for the FormListFilters component
 */
export interface FormListFiltersProps {
  /** Current search query */
  searchQuery: string
  /** Current status filter */
  statusFilter: string
  /** Callback when search query changes */
  onSearchChange: (value: string) => void
  /** Callback when status filter changes */
  onStatusChange: (value: string) => void
}

/**
 * Status filter options
 */
const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "Todos os status" },
  { value: "AVAILABLE", label: "Disponível" },
  { value: "HIDDEN", label: "Oculto" },
  { value: "FROZEN", label: "Congelado" },
  { value: "SCHEDULED", label: "Agendado" },
]

/**
 * FormListFilters Component
 * 
 * Filter panel for the forms list with search and status filter.
 * Uses common SearchFilter and SelectFilter components.
 * 
 * @example
 * ```tsx
 * <FormListFilters
 *   searchQuery={searchQuery}
 *   statusFilter={statusFilter}
 *   onSearchChange={setSearchQuery}
 *   onStatusChange={setStatusFilter}
 * />
 * ```
 */
export function FormListFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: FormListFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filtros e Busca</CardTitle>
        <CardDescription>
          Filtre e busque formulários por status ou palavras-chave
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <SearchFilter
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Buscar formulários..."
            className="flex-1"
          />
          <SelectFilter
            value={statusFilter}
            onChange={onStatusChange}
            options={STATUS_OPTIONS}
            placeholder="Filtrar por status"
            className="w-full md:w-[200px]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
