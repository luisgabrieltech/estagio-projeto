import { useMutation, useQueryClient } from '@tanstack/react-query'
import { certificateKeys, userKeys, formKeys } from '@/lib/query/keys'
import { generateCertificate, deleteCertificate } from '@/lib/api/certificate.api'

/**
 * Hook for generating a certificate for a user's form completion
 * 
 * Automatically invalidates related queries on success:
 * - User certificates queries
 * - Form certificates queries
 * - Certificate list queries
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 * 
 * @example
 * ```tsx
 * function GenerateCertificateButton({ userId, formId }: { userId: string, formId: string }) {
 *   const { mutate, isPending } = useGenerateCertificate()
 * 
 *   const handleGenerate = () => {
 *     mutate({ userId, formId }, {
 *       onSuccess: (certificate) => {
 *         toast({ title: 'Certificado gerado com sucesso' })
 *         router.push(`/certificates/${certificate.id}`)
 *       }
 *     })
 *   }
 * 
 *   return <button onClick={handleGenerate} disabled={isPending}>Gerar Certificado</button>
 * }
 * ```
 */
export function useGenerateCertificate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: generateCertificate,
    onSuccess: (data, variables) => {
      // Invalidate user certificates queries
      queryClient.invalidateQueries({ queryKey: certificateKeys.byUser(variables.userId) })
      
      // Invalidate form certificates queries
      queryClient.invalidateQueries({ queryKey: certificateKeys.byForm(variables.formId) })
      
      // Invalidate certificate list queries
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() })
      
      // Invalidate user details to update certificate count
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) })
    },
  })
}

/**
 * Hook for deleting a certificate
 * 
 * Automatically invalidates all certificate queries on success to ensure
 * the deleted certificate is removed from the UI.
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 * 
 * @example
 * ```tsx
 * function DeleteCertificateButton({ certificateId }: { certificateId: string }) {
 *   const { mutate, isPending } = useDeleteCertificate()
 * 
 *   const handleDelete = () => {
 *     if (confirm('Tem certeza que deseja deletar este certificado?')) {
 *       mutate(certificateId, {
 *         onSuccess: () => {
 *           toast({ title: 'Certificado deletado com sucesso' })
 *         }
 *       })
 *     }
 *   }
 * 
 *   return <button onClick={handleDelete} disabled={isPending}>Deletar</button>
 * }
 * ```
 */
export function useDeleteCertificate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteCertificate,
    onSuccess: () => {
      // Invalidate all certificate queries to refetch without deleted certificate
      queryClient.invalidateQueries({ queryKey: certificateKeys.all })
    },
  })
}
