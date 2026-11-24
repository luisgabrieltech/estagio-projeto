"use client"

import { useQuery } from '@tanstack/react-query'
import { certificateKeys } from '@/lib/query/keys'
import { 
  getCertificates, 
  getCertificate, 
  getUserCertificates, 
  getFormCertificates,
  validateCertificate
} from '@/lib/api/certificate.api'

/**
 * Hook for fetching paginated list of certificates
 * 
 * Uses TanStack Query for automatic caching, background refetching,
 * and request deduplication.
 * 
 * @param filters - Optional filters for certificates
 * @returns Query result with data, loading states, and refetch function
 * 
 * @example
 * ```tsx
 * function CertificatesList() {
 *   const { data, isLoading, isError, error, refetch } = useCertificates()
 * 
 *   if (isLoading) return <LoadingState />
 *   if (isError) return <ErrorState error={error} onRetry={refetch} />
 * 
 *   return <CertificatesTable data={data} />
 * }
 * ```
 */
export function useCertificates() {
  return useQuery({
    queryKey: certificateKeys.lists(),
    queryFn: () => getCertificates(),
  })
}

/**
 * Hook for fetching a single certificate by ID
 * 
 * Uses TanStack Query for automatic caching and background refetching.
 * 
 * @param id - Certificate ID
 * @returns Query result with data, loading states, and refetch function
 * 
 * @example
 * ```tsx
 * function CertificateDetails({ id }: { id: string }) {
 *   const { data, isLoading, isError } = useCertificate(id)
 * 
 *   if (isLoading) return <LoadingState />
 *   if (isError) return <ErrorState />
 * 
 *   return <CertificateCard certificate={data} />
 * }
 * ```
 */
export function useCertificate(id: string) {
  return useQuery({
    queryKey: certificateKeys.detail(id),
    queryFn: () => getCertificate(id),
    enabled: !!id,
  })
}

/**
 * Hook for fetching certificates for a specific user
 * 
 * Uses TanStack Query for automatic caching and background refetching.
 * 
 * @param userId - User ID
 * @returns Query result with data, loading states, and refetch function
 * 
 * @example
 * ```tsx
 * function UserCertificates({ userId }: { userId: string }) {
 *   const { data, isLoading, isError } = useUserCertificates(userId)
 * 
 *   if (isLoading) return <LoadingState />
 *   if (isError) return <ErrorState />
 * 
 *   return <CertificatesList certificates={data} />
 * }
 * ```
 */
export function useUserCertificates(userId: string) {
  return useQuery({
    queryKey: certificateKeys.byUser(userId),
    queryFn: () => getUserCertificates(userId),
    enabled: !!userId,
  })
}

/**
 * Hook for fetching certificates for a specific form
 * 
 * Uses TanStack Query for automatic caching and background refetching.
 * 
 * @param formId - Form ID
 * @returns Query result with data, loading states, and refetch function
 * 
 * @example
 * ```tsx
 * function FormCertificates({ formId }: { formId: string }) {
 *   const { data, isLoading, isError } = useFormCertificates(formId)
 * 
 *   if (isLoading) return <LoadingState />
 *   if (isError) return <ErrorState />
 * 
 *   return <CertificatesList certificates={data} />
 * }
 * ```
 */
export function useFormCertificates(formId: string) {
  return useQuery({
    queryKey: certificateKeys.byForm(formId),
    queryFn: () => getFormCertificates(formId),
    enabled: !!formId,
  })
}

/**
 * Hook for validating a certificate by its validation code
 * 
 * Uses TanStack Query for automatic caching and background refetching.
 * 
 * @param code - Certificate validation code
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with validation data, loading states, and refetch function
 * 
 * @example
 * ```tsx
 * function CertificateValidator({ code }: { code: string }) {
 *   const { data, isLoading, isError } = useCertificateValidation(code)
 * 
 *   if (isLoading) return <LoadingState />
 *   if (isError) return <ErrorState message="Certificado inválido" />
 * 
 *   return <ValidationResult validation={data} />
 * }
 * ```
 */
export function useCertificateValidation(code: string, enabled: boolean = true) {
  return useQuery({
    queryKey: certificateKeys.validation(code),
    queryFn: () => validateCertificate(code),
    enabled: enabled && !!code,
  })
}
