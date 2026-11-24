import { NextResponse } from 'next/server'
import { ErrorCode, errorCodeToStatus } from './error-codes'

export interface SuccessResponse<T> {
  success: true
  data: T
  timestamp: string
}

export interface ErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: Record<string, string[]>
  }
  timestamp: string
}

export interface PaginatedResponse<T> extends Omit<SuccessResponse<T[]>, 'data'> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function getTimestamp(): string {
  return new Date().toISOString()
}

export function formatSuccess<T>(data: T, status = 200): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: getTimestamp(),
  }
  return NextResponse.json(response, { status })
}

export function formatError(
  code: ErrorCode,
  message: string,
  details?: Record<string, string[]>
): NextResponse<ErrorResponse> {
  const status = errorCodeToStatus[code]
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && Object.keys(details).length > 0 ? { details } : {}),
    },
    timestamp: getTimestamp(),
  }
  return NextResponse.json(response, { status })
}

export function formatPaginated<T>(
  data: T[],
  pagination: PaginationMeta,
  status = 200
): NextResponse<PaginatedResponse<T>> {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    timestamp: getTimestamp(),
  }
  return NextResponse.json(response, { status })
}

export function formatCreated<T>(data: T): NextResponse<SuccessResponse<T>> {
  return formatSuccess(data, 201)
}
