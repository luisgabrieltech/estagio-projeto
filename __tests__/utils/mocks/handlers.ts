/**
 * MSW Handlers
 * 
 * Mock Service Worker handlers for API mocking in tests
 * 
 * @module __tests__/utils/mocks/handlers
 * Requirements: 3.2, 5.1, 5.2, 5.3
 */
import { http, HttpResponse } from 'msw'
import { createUsers, createUser, createForms, createForm } from '../factories'

const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || ''

/**
 * User API handlers
 */
export const userHandlers = [
  // GET /api/admin/users - List users with pagination
  http.get(`${baseUrl}/api/admin/users`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    
    const users = createUsers(pageSize)
    
    return HttpResponse.json({
      data: users,
      pagination: {
        page,
        pageSize,
        total: 100,
        totalPages: Math.ceil(100 / pageSize),
      },
    })
  }),

  // GET /api/admin/users/:id - Get single user
  http.get(`${baseUrl}/api/admin/users/:id`, ({ params }) => {
    const { id } = params
    const user = createUser({ id: id as string })
    
    return HttpResponse.json({ data: user })
  }),

  // POST /api/admin/users - Create user
  http.post(`${baseUrl}/api/admin/users`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const user = createUser(body)
    
    return HttpResponse.json({ data: user }, { status: 201 })
  }),

  // PUT /api/admin/users/:id - Update user
  http.put(`${baseUrl}/api/admin/users/:id`, async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as Record<string, unknown>
    const user = createUser({ id: id as string, ...body })
    
    return HttpResponse.json({ data: user })
  }),

  // DELETE /api/admin/users/:id - Delete user
  http.delete(`${baseUrl}/api/admin/users/:id`, () => {
    return HttpResponse.json({ success: true })
  }),

  // GET /api/user - Get current user
  http.get(`${baseUrl}/api/user`, () => {
    const user = createUser({ id: 'current-user' })
    return HttpResponse.json({ data: user })
  }),
]

/**
 * Form API handlers
 */
export const formHandlers = [
  // GET /api/admin/forms - List forms with pagination
  http.get(`${baseUrl}/api/admin/forms`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    
    const forms = createForms(pageSize)
    
    return HttpResponse.json({
      data: forms,
      pagination: {
        page,
        pageSize,
        total: 50,
        totalPages: Math.ceil(50 / pageSize),
      },
    })
  }),

  // GET /api/admin/forms/:id - Get single form
  http.get(`${baseUrl}/api/admin/forms/:id`, ({ params }) => {
    const { id } = params
    const form = createForm({ id: id as string })
    
    return HttpResponse.json({ data: form })
  }),

  // POST /api/admin/forms - Create form
  http.post(`${baseUrl}/api/admin/forms`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const form = createForm(body)
    
    return HttpResponse.json({ data: form }, { status: 201 })
  }),

  // PUT /api/admin/forms/:id - Update form
  http.put(`${baseUrl}/api/admin/forms/:id`, async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as Record<string, unknown>
    const form = createForm({ id: id as string, ...body })
    
    return HttpResponse.json({ data: form })
  }),

  // DELETE /api/admin/forms/:id - Delete form
  http.delete(`${baseUrl}/api/admin/forms/:id`, () => {
    return HttpResponse.json({ success: true })
  }),

  // GET /api/forms - List public forms
  http.get(`${baseUrl}/api/forms`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    
    const forms = createForms(pageSize)
    
    return HttpResponse.json({
      data: forms,
      pagination: {
        page,
        pageSize,
        total: 20,
        totalPages: Math.ceil(20 / pageSize),
      },
    })
  }),
]

/**
 * Response API handlers
 */
export const responseHandlers = [
  // GET /api/admin/responses - List responses
  http.get(`${baseUrl}/api/admin/responses`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    
    return HttpResponse.json({
      data: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
    })
  }),

  // POST /api/responses - Submit response
  http.post(`${baseUrl}/api/responses`, async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({ 
      data: { id: 'response-1', ...body as object },
      success: true 
    }, { status: 201 })
  }),
]

/**
 * Certificate API handlers
 */
export const certificateHandlers = [
  // GET /api/certificates - List certificates
  http.get(`${baseUrl}/api/certificates`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    
    return HttpResponse.json({
      data: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
    })
  }),

  // GET /api/certificates/validate/:code - Validate certificate
  http.get(`${baseUrl}/api/certificates/validate/:code`, ({ params }) => {
    const { code } = params
    
    return HttpResponse.json({
      valid: true,
      certificate: {
        id: 'cert-1',
        validationCode: code,
        issuedAt: new Date().toISOString(),
      },
    })
  }),
]

/**
 * All handlers combined
 */
export const handlers = [
  ...userHandlers,
  ...formHandlers,
  ...responseHandlers,
  ...certificateHandlers,
]

/**
 * Error handler factory - creates handlers that return errors
 * 
 * @param path - API path to mock
 * @param status - HTTP status code
 * @param message - Error message
 */
export function createErrorHandler(
  path: string,
  status: number = 500,
  message: string = 'Internal Server Error'
) {
  return http.get(`${baseUrl}${path}`, () => {
    return HttpResponse.json(
      { error: 'ERROR', message },
      { status }
    )
  })
}

/**
 * Creates a handler that returns a 404 Not Found error
 */
export function createNotFoundHandler(path: string) {
  return createErrorHandler(path, 404, 'Not Found')
}

/**
 * Creates a handler that returns a 401 Unauthorized error
 */
export function createUnauthorizedHandler(path: string) {
  return createErrorHandler(path, 401, 'Unauthorized')
}

/**
 * Creates a handler that returns a 403 Forbidden error
 */
export function createForbiddenHandler(path: string) {
  return createErrorHandler(path, 403, 'Forbidden')
}
