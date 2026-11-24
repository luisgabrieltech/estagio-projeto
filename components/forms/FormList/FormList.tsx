"use client"

import { useState } from "react"
import { useForms } from "@/hooks/forms"
import { useDeleteForm, useUpdateFormVisibility } from "@/hooks/forms/useFormMutations"
import { useToast } from "@/components/ui/use-toast"
import { FormListHeader } from "./FormListHeader"
import { FormListFilters } from "./FormListFilters"
import { FormListTable } from "./FormListTable"
import { FormActions } from "@/components/forms/FormActions"
import type { ExternalStatus } from "@prisma/client"

/**
 * Props for the FormList component
 */
export interface FormListProps {
  /** Optional callback when a form is selected */
  onFormSelect?: (formId: string) => void
}

/**
 * FormList Component
 * 
 * Main component for displaying and managing a list of forms.
 * Handles:
 * - Form listing with pagination
 * - Search and filtering
 * - Form actions (delete, visibility management)
 * - Loading and empty states
 * 
 * @example
 * ```tsx
 * <FormList />
 * ```
 */
export function FormList({ onFormSelect }: FormListProps) {
  const { toast } = useToast()
  
  // Use forms hook for data management
  const {
    forms,
    loading,
    filters,
    pagination,
    setSearchQuery,
    setStatusFilter,
    setPage,
    updateForm,
    removeForm,
    refresh
  } = useForms()

  // Use mutation hooks
  const deleteFormMutation = useDeleteForm()
  const updateVisibilityMutation = useUpdateFormVisibility()

  const [deleteFormId, setDeleteFormId] = useState<string | null>(null)
  const [deleteFormName, setDeleteFormName] = useState("")
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Visibility dialog state
  const [visibilityFormId, setVisibilityFormId] = useState<string | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<ExternalStatus>("HIDDEN")
  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false)

  /**
   * Handle delete button click
   */
  const handleDeleteClick = (formId: string, formName: string) => {
    setDeleteFormId(formId)
    setDeleteFormName(formName)
    setDeleteConfirmInput("")
    setIsDeleteDialogOpen(true)
  }

  /**
   * Confirm delete with optimistic update
   */
  const confirmDelete = async () => {
    if (!deleteFormId) return
    
    const formIdToDelete = deleteFormId
    
    // Close dialog immediately
    setIsDeleteDialogOpen(false)
    setDeleteFormId(null)
    setDeleteFormName("")
    setDeleteConfirmInput("")
    
    // Optimistic update: remove from list immediately
    removeForm(formIdToDelete)
    
    try {
      await deleteFormMutation.mutateAsync(formIdToDelete)

      toast({
        title: "Sucesso",
        description: "Formulário excluído com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir formulário",
        variant: "destructive",
      })
      // Refresh on error to restore state
      await refresh()
    }
  }

  /**
   * Open visibility dialog
   */
  const openVisibilityDialog = (form: any) => {
    // Find the full form data from the forms array
    const fullForm = forms.find(f => f.id === form.id)
    setVisibilityFormId(form.id)
    setSelectedRoles(fullForm?.visibleToRoles || [])
    setSelectedStatus(form.externalStatus || "HIDDEN")
    setIsVisibilityDialogOpen(true)
  }

  /**
   * Save visibility changes
   */
  const handleSaveVisibility = async () => {
    if (!visibilityFormId) return
    
    const formId = visibilityFormId
    const roles = selectedRoles
    const status = selectedStatus
    
    // Close dialog immediately
    setIsVisibilityDialogOpen(false)
    
    // Optimistic update
    updateForm(formId, {
      visibleToRoles: roles,
      externalStatus: status
    })
    
    try {
      await updateVisibilityMutation.mutateAsync({
        id: formId,
        visibleToRoles: roles,
        externalStatus: status
      })

      toast({
        title: "Sucesso",
        description: "Visibilidade atualizada com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar visibilidade",
        variant: "destructive",
      })
      // Refresh on error to restore state
      await refresh()
    }
  }

  /**
   * Handle page change with smooth scroll
   */
  const handlePageChange = (page: number) => {
    setPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FormListHeader />

      {/* Filters */}
      <FormListFilters
        searchQuery={filters.search || ''}
        statusFilter={filters.status || 'all'}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
      />

      {/* Table */}
      <FormListTable
        forms={forms}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onDelete={handleDeleteClick}
        onVisibility={openVisibilityDialog}
        onSelect={onFormSelect}
      />

      {/* Action Dialogs */}
      <FormActions
        isDeleteDialogOpen={isDeleteDialogOpen}
        deleteFormName={deleteFormName}
        deleteConfirmInput={deleteConfirmInput}
        onDeleteDialogChange={setIsDeleteDialogOpen}
        onDeleteConfirmInputChange={setDeleteConfirmInput}
        onConfirmDelete={confirmDelete}
        isVisibilityDialogOpen={isVisibilityDialogOpen}
        selectedRoles={selectedRoles}
        selectedStatus={selectedStatus}
        isUpdating={updateVisibilityMutation.isPending}
        onVisibilityDialogChange={setIsVisibilityDialogOpen}
        onRolesChange={setSelectedRoles}
        onStatusChange={(status) => setSelectedStatus(status as ExternalStatus)}
        onSaveVisibility={handleSaveVisibility}
      />
    </div>
  )
}
