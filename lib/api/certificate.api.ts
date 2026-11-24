import { apiRequest, getApiUrl } from '@/lib/utils/api-utils'
import type { 
  Certificate,
  CertificateWithDetails,
  PublicCertificateVerification
} from '@/types/entities/certificate'

export async function getCertificates(): Promise<CertificateWithDetails[]> {
  return apiRequest<CertificateWithDetails[]>('/certificates')
}

export async function getCertificate(id: string): Promise<CertificateWithDetails> {
  return apiRequest<CertificateWithDetails>(`/certificates/${id}`)
}

export async function getUserCertificates(userId: string): Promise<Certificate[]> {
  return apiRequest<Certificate[]>(`/certificates?userId=${userId}`)
}

export async function getFormCertificates(formId: string): Promise<Certificate[]> {
  return apiRequest<Certificate[]>(`/certificates?formId=${formId}`)
}

export async function generateCertificate({
  userId,
  formId
}: {
  userId: string
  formId: string
}): Promise<Certificate> {
  return apiRequest<Certificate>('/certificates', {
    method: 'POST',
    body: JSON.stringify({ userId, formId }),
  })
}

export async function validateCertificate(code: string): Promise<PublicCertificateVerification> {
  return apiRequest<PublicCertificateVerification>(`/certificates/validate/${encodeURIComponent(code)}`)
}

export async function downloadCertificate(id: string): Promise<Blob> {
  const url = getApiUrl(`/certificates/${id}/download`)
  const response = await fetch(url, {
    credentials: 'include',
  })
  
  if (!response.ok) {
    throw new Error(`Failed to download certificate: ${response.statusText}`)
  }
  
  return response.blob()
}

export async function deleteCertificate(id: string): Promise<void> {
  return apiRequest<void>(`/certificates/${id}`, {
    method: 'DELETE',
  })
}
