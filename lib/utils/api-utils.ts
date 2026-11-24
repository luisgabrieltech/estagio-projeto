/**
 * API URL utilities
 * Provides consistent URL generation with basePath support
 * 
 * This file can be used in both client and server code.
 * For server-only auth utilities, import directly from './api-auth-utils'
 */

import { basePath } from '@/lib/config/routes'

// NOTE: api-auth-utils is server-only, import it directly where needed

/**
 * Gera URL da API com o basePath correto
 * @param path - Caminho da API (ex: '/forms', 'user/profile')
 * @returns URL completa da API (ex: '/api/forms')
 * @example
 * getApiUrl('/forms') // "/api/forms"
 * getApiUrl('user/profile') // "/api/user/profile"
 */
export function getApiUrl(path: string): string {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${basePath}/api/${cleanPath}`
}

/**
 * Gera URL da API de autenticação com o basePath correto
 * @param path - Caminho da API de auth (ex: '/register', 'forgot-password')
 * @returns URL completa da API de auth (ex: '/api/auth/register')
 * @example
 * getAuthApiUrl('/register') // "/api/auth/register"
 * getAuthApiUrl('forgot-password') // "/api/auth/forgot-password"
 */
export function getAuthApiUrl(path: string): string {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${basePath}/api/auth/${cleanPath}`
}

/**
 * Gera URL de imagem com o basePath correto
 * @param path - Caminho da imagem (ex: '/images/logos/placeholder-logo.png', 'avatar.png')
 * @returns URL completa da imagem (ex: '/images/logos/placeholder-logo.png')
 * @example
 * getImageUrl('/images/logos/placeholder-logo.png') // "/images/logos/placeholder-logo.png"
 * getImageUrl('/images/placeholders/avatar.png') // "/images/placeholders/avatar.png"
 */
export function getImageUrl(path: string): string {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${basePath}/${cleanPath}`
}

/**
 * Builds a query string from an object of parameters
 * Automatically filters out undefined and null values
 * @param params - Object with query parameters
 * @returns Query string (without leading ?)
 * @example
 * buildQueryString({ page: 1, search: 'test' }) // "page=1&search=test"
 * buildQueryString({ page: 1, search: undefined }) // "page=1"
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

/**
 * Builds a complete API URL with query parameters
 * @param path - API path
 * @param params - Query parameters object
 * @returns Complete API URL with query string
 * @example
 * buildApiUrl('/forms', { page: 1, status: 'PUBLISHED' })
 * // "/api/forms?page=1&status=PUBLISHED"
 */
export function buildApiUrl(path: string, params?: Record<string, any>): string {
  const baseUrl = getApiUrl(path)
  
  if (!params || Object.keys(params).length === 0) {
    return baseUrl
  }
  
  const queryString = buildQueryString(params)
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * Standard API error response type
 */
export interface ApiError {
  error: string
  message?: string
  details?: any
}

/**
 * Standard API success response type
 */
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

/**
 * Handles API response and throws on error
 * @param response - Fetch Response object
 * @returns Parsed JSON data
 * @throws Error with message from API or HTTP status
 */
export async function handleApiResponse<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    let errorDetails: any = null
    
    try {
      const errorData: ApiError = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
      errorDetails = errorData.details
      
      // Format validation details if available
      if (errorDetails && typeof errorDetails === 'object') {
        const detailMessages = Object.entries(errorDetails)
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages]
            return `${field}: ${msgArray.join(', ')}`
          })
          .join('; ')
        
        if (detailMessages) {
          errorMessage = `${errorMessage}${detailMessages ? ` - ${detailMessages}` : ''}`
        }
      }
    } catch {
      // If JSON parsing fails, use default error message
    }
    
    const error = new Error(errorMessage) as any
    error.details = errorDetails
    throw error
  }
  
  return response.json()
}

/**
 * Makes a typed API request with automatic error handling
 * Automatically extracts data from { data: T } response format
 * @param path - API path
 * @param options - Fetch options
 * @returns Parsed response data (extracted from { data: T } wrapper if present)
 * @example
 * const users = await apiRequest<User[]>('/admin/users')
 * const form = await apiRequest<Form>('/forms/123', { method: 'GET' })
 */
export async function apiRequest<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = getApiUrl(path)
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  
  const json = await handleApiResponse<any>(response)
  
  // API returns { data: T } format - extract the data
  // If response has a 'data' property, return it; otherwise return the whole response
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T
  }
  
  return json as T
}
