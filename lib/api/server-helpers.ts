import { NextResponse } from 'next/server'
import {
  formatSuccess,
  formatPaginated,
  formatCreated,
  SuccessResponse,
  PaginatedResponse,
  PaginationMeta,
} from './response-format'

export type { SuccessResponse, PaginatedResponse, PaginationMeta }

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  timestamp: string
}

export interface ApiPaginatedResponse<T> {
  success: true
  data: T[]
  pagination: PaginationMeta
  timestamp: string
}

export function success<T>(data: T, status = 200): NextResponse<SuccessResponse<T>> {
  return formatSuccess(data, status)
}

export function paginated<T>(
  data: T[],
  pagination: PaginationMeta,
  status = 200
): NextResponse<PaginatedResponse<T>> {
  return formatPaginated(data, pagination, status)
}

export function created<T>(data: T): NextResponse<SuccessResponse<T>> {
  return formatCreated(data)
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}
