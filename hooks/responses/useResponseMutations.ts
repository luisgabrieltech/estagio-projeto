import { useMutation, useQueryClient } from '@tanstack/react-query'
import { responseKeys, formKeys, userKeys } from '@/lib/query/keys'
import { saveResponses, deleteResponse } from '@/lib/api/response.api'

/**
 * Hook for saving or updating responses for a form
 * 
 * Automatically invalidates related queries on success:
 * - Form responses queries
 * - User responses queries
 * - Form details (to update completion status)
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 * 
 * @example
 * ```tsx
 * function EvaluationForm({ formId }: { formId: string }) {
 *   const { mutate, isPending } = useSaveResponses()
 * 
 *   const handleSubmit = (responses: Record<string, any>) => {
 *     mutate({ formId, responses }, {
 *       onSuccess: () => {
 *         toast({ title: 'Respostas salvas com sucesso' })
 *         router.push('/dashboard/avaliacoes')
 *       }
 *     })
 *   }
 * 
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useSaveResponses() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: saveResponses,
    onSuccess: (data, variables) => {
      // Invalidate form responses queries
      queryClient.invalidateQueries({ queryKey: responseKeys.byForm(variables.formId) })
      
      // Invalidate user responses queries (if we have userId in the response)
      if (data && data.length > 0 && data[0].userId) {
        queryClient.invalidateQueries({ queryKey: responseKeys.byUser(data[0].userId) })
      }
      
      // Invalidate form details to update completion status
      queryClient.invalidateQueries({ queryKey: formKeys.detail(variables.formId) })
      queryClient.invalidateQueries({ queryKey: formKeys.withQuestions(variables.formId) })
    },
  })
}

/**
 * Hook for deleting a response
 * 
 * Automatically invalidates all response list queries on success to ensure
 * the deleted response is removed from the UI.
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 * 
 * @example
 * ```tsx
 * function DeleteResponseButton({ responseId }: { responseId: string }) {
 *   const { mutate, isPending } = useDeleteResponse()
 * 
 *   const handleDelete = () => {
 *     if (confirm('Tem certeza que deseja deletar esta resposta?')) {
 *       mutate(responseId, {
 *         onSuccess: () => {
 *           toast({ title: 'Resposta deletada com sucesso' })
 *         }
 *       })
 *     }
 *   }
 * 
 *   return <button onClick={handleDelete} disabled={isPending}>Deletar</button>
 * }
 * ```
 */
export function useDeleteResponse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteResponse,
    onSuccess: () => {
      // Invalidate all response queries to refetch without deleted response
      queryClient.invalidateQueries({ queryKey: responseKeys.all })
    },
  })
}
