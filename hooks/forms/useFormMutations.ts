import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formKeys } from '@/lib/query/keys'
import { createForm, updateForm, deleteForm, updateFormVisibility, updateFormStatus } from '@/lib/api/form.api'
import type { FormCreateData, FormUpdateData } from '@/types/entities/form'

/**
 * Hook for creating a new form
 * 
 * Automatically invalidates form list queries on success to ensure
 * the UI reflects the newly created form.
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 * 
 * @example
 * ```tsx
 * function CreateFormDialog() {
 *   const { mutate, isPending, isError, error } = useCreateForm()
 * 
 *   const handleSubmit = (data: FormCreateData) => {
 *     mutate(data, {
 *       onSuccess: (form) => {
 *         toast({ title: 'Form created successfully' })
 *         router.push(`/forms/${form.id}`)
 *       }
 *     })
 *   }
 * 
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useCreateForm() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createForm,
    onSuccess: () => {
      // Invalidate all form list queries to refetch with new form
      queryClient.invalidateQueries({ queryKey: formKeys.lists() })
    },
  })
}

/**
 * Hook for updating an existing form
 * 
 * Automatically invalidates both the specific form detail query and
 * all form list queries on success to ensure the UI is up to date.
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 * 
 * @example
 * ```tsx
 * function EditFormDialog({ formId }: { formId: string }) {
 *   const { mutate, isPending } = useUpdateForm()
 * 
 *   const handleSubmit = (data: FormUpdateData) => {
 *     mutate({ id: formId, data }, {
 *       onSuccess: () => {
 *         toast({ title: 'Form updated successfully' })
 *       }
 *     })
 *   }
 * 
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useUpdateForm() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateForm,
    onSuccess: (data, variables) => {
      // Invalidate the specific form detail query
      queryClient.invalidateQueries({ queryKey: formKeys.detail(variables.id) })
      // Invalidate form with questions query if it exists
      queryClient.invalidateQueries({ queryKey: formKeys.withQuestions(variables.id) })
      // Invalidate all form list queries
      queryClient.invalidateQueries({ queryKey: formKeys.lists() })
    },
  })
}

/**
 * Hook for deleting a form
 * 
 * Automatically invalidates all form list queries on success to ensure
 * the deleted form is removed from the UI.
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 * 
 * @example
 * ```tsx
 * function DeleteFormButton({ formId }: { formId: string }) {
 *   const { mutate, isPending } = useDeleteForm()
 * 
 *   const handleDelete = () => {
 *     if (confirm('Are you sure you want to delete this form?')) {
 *       mutate(formId, {
 *         onSuccess: () => {
 *           toast({ title: 'Form deleted successfully' })
 *           router.push('/forms')
 *         }
 *       })
 *     }
 *   }
 * 
 *   return <button onClick={handleDelete} disabled={isPending}>Delete</button>
 * }
 * ```
 */
export function useDeleteForm() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteForm,
    onSuccess: () => {
      // Invalidate all form list queries to refetch without deleted form
      queryClient.invalidateQueries({ queryKey: formKeys.lists() })
    },
  })
}

/**
 * Hook for updating form visibility settings
 * 
 * Updates visible roles and external status for a form.
 * Automatically invalidates form queries on success.
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 */
export function useUpdateFormVisibility() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateFormVisibility,
    onSuccess: (data, variables) => {
      // Invalidate the specific form detail query
      queryClient.invalidateQueries({ queryKey: formKeys.detail(variables.id) })
      // Invalidate all form list queries
      queryClient.invalidateQueries({ queryKey: formKeys.lists() })
      queryClient.invalidateQueries({ queryKey: formKeys.public() })
    },
  })
}

/**
 * Hook for updating form status (draft/published)
 * 
 * Updates the form status.
 * Automatically invalidates form queries on success.
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 */
export function useUpdateFormStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateFormStatus,
    onSuccess: (data, variables) => {
      // Invalidate the specific form detail query
      queryClient.invalidateQueries({ queryKey: formKeys.detail(variables.id) })
      // Invalidate all form list queries
      queryClient.invalidateQueries({ queryKey: formKeys.lists() })
    },
  })
}
