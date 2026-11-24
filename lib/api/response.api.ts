import { apiRequest, buildQueryString } from '@/lib/utils/api-utils'
import type { 
  Response,
  ResponseWithDetails,
  ResponseFilters,
  FormMetrics,
  QuestionStats,
  DetailedResponse
} from '@/types/entities/response'
import type { PaginatedResponse } from '@/types/common/pagination'

export async function getResponses(
  filters: ResponseFilters = {}
): Promise<PaginatedResponse<ResponseWithDetails>> {
  const queryString = buildQueryString(filters)
  const path = queryString ? `/admin/responses?${queryString}` : '/admin/responses'
  const json = await apiRequest<{ data?: ResponseWithDetails[]; responses?: ResponseWithDetails[]; pagination?: any }>(path)
  
  return {
    data: json.data || json.responses || [],
    pagination: json.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 0 }
  }
}

export async function getFormResponses(
  formId: string,
  filters: ResponseFilters = {}
): Promise<PaginatedResponse<ResponseWithDetails>> {
  const queryString = buildQueryString({ ...filters, formId })
  const path = `/admin/responses?${queryString}`
  const json = await apiRequest<{ data?: ResponseWithDetails[]; responses?: ResponseWithDetails[]; pagination?: any }>(path)
  
  return {
    data: json.data || json.responses || [],
    pagination: json.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 0 }
  }
}

export async function getUserResponses(userId: string): Promise<Response[]> {
  return apiRequest<Response[]>(`/user/${userId}/responses`)
}

export async function getDetailedResponse({
  userId,
  formId
}: {
  userId: string
  formId: string
}): Promise<DetailedResponse> {
  return apiRequest<DetailedResponse>(`/admin/responses/detailed?userId=${userId}&formId=${formId}`)
}

export async function saveResponses({
  formId,
  responses
}: {
  formId: string
  responses: Record<string, any>
}): Promise<Response[]> {
  return apiRequest<Response[]>('/responses', {
    method: 'POST',
    body: JSON.stringify({ formId, responses }),
  })
}

export async function getFormMetrics(
  formId: string,
  filters: ResponseFilters = {}
): Promise<FormMetrics> {
  const queryString = buildQueryString(filters)
  const path = queryString 
    ? `/admin/responses/${formId}/metrics?${queryString}` 
    : `/admin/responses/${formId}/metrics`
  return apiRequest<FormMetrics>(path)
}

export async function getQuestionStats({
  formId,
  questionId
}: {
  formId: string
  questionId: string
}): Promise<QuestionStats> {
  return apiRequest<QuestionStats>(`/admin/responses/${formId}/questions/${questionId}/stats`)
}

export async function deleteResponse(id: string): Promise<void> {
  return apiRequest<void>(`/admin/responses/${id}`, {
    method: 'DELETE',
  })
}
