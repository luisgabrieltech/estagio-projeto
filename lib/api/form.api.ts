import { apiRequest } from '@/lib/utils/api-utils'
import type { 
  Form, 
  FormFilters, 
  FormCreateData, 
  FormUpdateData
} from '@/types/entities/form'
import type { PaginatedResponse } from '@/types/common/pagination'

export async function getForms(filters: FormFilters = {}): Promise<PaginatedResponse<Form>> {
  const queryString = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')
  
  const path = queryString ? `/admin/forms?${queryString}` : '/admin/forms'
  const json = await apiRequest<{ data?: Form[]; forms?: Form[]; pagination?: any }>(path)
  
  return {
    data: json.data || json.forms || [],
    pagination: json.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 0 }
  }
}

export async function getPublicForms(): Promise<Form[]> {
  return apiRequest<Form[]>('/forms')
}

export async function getForm(id: string): Promise<Form> {
  return apiRequest<Form>(`/forms?id=${id}`)
}

export async function getFormWithQuestions(id: string): Promise<Form> {
  return apiRequest<Form>(`/forms?id=${id}`)
}

export async function createForm(data: FormCreateData): Promise<Form> {
  return apiRequest<Form>('/forms', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateForm({ 
  id, 
  data 
}: { 
  id: string
  data: FormUpdateData 
}): Promise<Form> {
  return apiRequest<Form>('/forms', {
    method: 'POST',
    body: JSON.stringify({ id, ...data }),
  })
}

export async function deleteForm(id: string): Promise<void> {
  return apiRequest<void>('/forms', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  })
}

export async function updateFormVisibility({ 
  id, 
  visibleToRoles,
  externalStatus
}: { 
  id: string
  visibleToRoles: string[]
  externalStatus?: string
}): Promise<Form> {
  return apiRequest<Form>('/forms?action=visibility', {
    method: 'PATCH',
    body: JSON.stringify({ id, visibleToRoles, status: externalStatus }),
  })
}

export async function updateFormExternalStatus({ 
  id, 
  status
}: { 
  id: string
  status: string
}): Promise<Form> {
  return apiRequest<Form>('/forms?action=external-status', {
    method: 'PATCH',
    body: JSON.stringify({ id, status }),
  })
}

export async function updateFormStatus({ 
  id, 
  status
}: { 
  id: string
  status: string
}): Promise<Form> {
  return apiRequest<Form>('/forms', {
    method: 'PATCH',
    body: JSON.stringify({ id, status }),
  })
}
