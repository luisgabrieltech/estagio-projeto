"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { DataTable } from "@/components/common/DataTable"
import { DataTableHeader } from "@/components/common/DataTable/DataTableHeader"
import { DataTableBody } from "@/components/common/DataTable/DataTableBody"
import { DataTableRow } from "@/components/common/DataTable/DataTableRow"
import { DataTableCell } from "@/components/common/DataTable/DataTableCell"
import { LoadingState } from "@/components/common/LoadingState/LoadingState"
import { EmptyState } from "@/components/common/EmptyState/EmptyState"
import { FormListItem, FormTableData } from "./FormListItem"
import type { PaginationData } from "@/types/common/pagination"

/**
 * Props for the FormListTable component
 */
export interface FormListTableProps {
  /** List of forms to display */
  forms: FormTableData[]
  /** Loading state */
  loading: boolean
  /** Pagination data */
  pagination: PaginationData
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Callback when delete is clicked */
  onDelete: (formId: string, formName: string) => void
  /** Callback when visibility is clicked */
  onVisibility: (form: FormTableData) => void
  /** Optional callback when a form is selected */
  onSelect?: (formId: string) => void
}

/**
 * FormListTable Component
 * 
 * Table component for displaying forms list with pagination.
 * Handles loading and empty states.
 * Uses DataTable common component and FormListItem for each row.
 */
export function FormListTable({
  forms,
  loading,
  pagination,
  onPageChange,
  onDelete,
  onVisibility,
  onSelect,
}: FormListTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulários de Avaliação</CardTitle>
        <CardDescription>
          {loading ? (
            "Carregando..."
          ) : (
            <>
              Total: {pagination.total} formulários • Página {pagination.page} de {pagination.totalPages}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Loading State */}
        {loading && (
          <LoadingState message="Carregando formulários..." />
        )}

        {/* Empty State */}
        {!loading && forms.length === 0 && (
          <EmptyState
            variant="no-data"
            title="Nenhum formulário encontrado"
            description="Tente ajustar os filtros ou criar um novo formulário"
          />
        )}

        {/* Table - Desktop View */}
        {!loading && forms.length > 0 && (
          <>
            <div className="hidden lg:block">
              <DataTable>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableCell header>Título</DataTableCell>
                    <DataTableCell header>Status Interno</DataTableCell>
                    <DataTableCell header>Status Externo</DataTableCell>
                    <DataTableCell header>Criado em</DataTableCell>
                    <DataTableCell header>Prazo</DataTableCell>
                    <DataTableCell header>Tempo Estimado</DataTableCell>
                    <DataTableCell header>Respostas</DataTableCell>
                    <DataTableCell header align="right">Ações</DataTableCell>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {forms.map((form) => (
                    <FormListItem
                      key={form.id}
                      form={form}
                      onDelete={onDelete}
                      onVisibility={onVisibility}
                      onSelect={onSelect}
                    />
                  ))}
                </DataTableBody>
              </DataTable>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {forms.map((form) => (
                <FormListItem
                  key={form.id}
                  form={form}
                  onDelete={onDelete}
                  onVisibility={onVisibility}
                  onSelect={onSelect}
                  variant="card"
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
