import { apiRequest } from '@/lib/utils/api-utils'
import type { 
  User, 
  UserFilters, 
  UserCreateData, 
  UserUpdateData,
  UserListResponse 
} from '@/types/entities/user'

export async function getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
  const queryString = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')
  
  const path = queryString ? `/admin/users?${queryString}` : '/admin/users'
  const json = await apiRequest<{ data?: User[]; pagination?: any }>(path)
  
  return {
    users: json.data || [],
    pagination: json.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 0 }
  }
}

export async function getUser(_id: string): Promise<User> {
  return apiRequest<User>(`/user/profile`)
}

export async function createUser(data: UserCreateData): Promise<User> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateUser({ 
  id, 
  data 
}: { 
  id: string
  data: UserUpdateData 
}): Promise<User> {
  return apiRequest<User>(`/user/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(`/user/${id}`, {
    method: 'DELETE',
  })
}

export async function resetUserPassword({
  id,
  password
}: {
  id: string
  password: string
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/user/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}
