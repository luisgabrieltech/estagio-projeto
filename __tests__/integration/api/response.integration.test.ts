/**
 * Integration Tests for Response API Routes
 *
 * Tests that response API routes return correct response formats
 * and handle submission and query operations consistently.
 *
 * Validates: Requirements 3.1.1
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/utils/mocks/server'
import { success, paginated, created } from '@/lib/api/server-helpers'
import { handleDomainError } from '@/lib/domain/errors/handle-domain-error'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/domain/errors'
import { 
  createResponse, 
  createResponses, 
  createResponseWithDetails,
  createDetailedResponse,
  createQuestionStats,
  createFormMetrics
} from '@/__tests__/utils/factories'
import { createForm, createQuestion } from '@/__tests__/utils/factories'

// Mock session for auth helpers
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || ''

describe('Response API Routes Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  /**
   * Test: POST /api/responses - Submit responses
   * Validates: Requirements 3.1.1
   */
  describe('POST /api/responses', () => {
    it('should submit responses successfully', async () => {
      const response = success({ message: 'Respostas salvas com sucesso!' })
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.message).toBe('Respostas salvas com sucesso!')
    })

    it('should return validation error for empty responses', async () => {
      const error = new ValidationError('Nenhuma resposta enviada')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 404 for non-existent form', async () => {
      const error = new NotFoundError('Formulário', 'non-existent-form')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })

    it('should return 403 when not authenticated', async () => {
      const error = new ForbiddenError('Não autenticado')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(403)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('FORBIDDEN')
    })
  })

  /**
   * Test: GET /api/responses - Get user responses
   * Validates: Requirements 3.1.1
   */
  describe('GET /api/responses', () => {
    it('should return user responses', async () => {
      const responses = createResponses(3)
      
      const response = success(responses)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data).toHaveLength(3)
    })

    it('should return empty array when user has no responses', async () => {
      const response = success([])
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data).toHaveLength(0)
    })
  })

  /**
   * Test: GET /api/admin/responses - List responses with pagination
   * Validates: Requirements 3.1.1
   */
  describe('GET /api/admin/responses', () => {
    it('should return paginated list of responses', async () => {
      const responses = createResponses(5)
      const pagination = { page: 1, pageSize: 10, total: 5, totalPages: 1 }
      
      const response = paginated(responses, pagination)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('pagination')
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.data).toHaveLength(5)
    })

    it('should filter responses by formId', async () => {
      const responses = createResponses(3, { formId: 'form-123' })
      const pagination = { page: 1, pageSize: 10, total: 3, totalPages: 1 }
      
      const response = paginated(responses, pagination)
      const body = await response.json()

      expect(body.data).toHaveLength(3)
      body.data.forEach((r: { formId: string }) => {
        expect(r.formId).toBe('form-123')
      })
    })

    it('should filter responses by userId', async () => {
      const responses = createResponses(2, { userId: 'user-456' })
      const pagination = { page: 1, pageSize: 10, total: 2, totalPages: 1 }
      
      const response = paginated(responses, pagination)
      const body = await response.json()

      expect(body.data).toHaveLength(2)
      body.data.forEach((r: { userId: string }) => {
        expect(r.userId).toBe('user-456')
      })
    })

    it('should return empty list when no responses match filters', async () => {
      const responses: ReturnType<typeof createResponse>[] = []
      const pagination = { page: 1, pageSize: 10, total: 0, totalPages: 0 }
      
      const response = paginated(responses, pagination)
      const body = await response.json()

      expect(body.data).toHaveLength(0)
      expect(body.pagination.total).toBe(0)
    })
  })

  /**
   * Test: Response with details format
   * Validates: Requirements 3.1.1
   */
  describe('Response With Details Format', () => {
    it('should return response with user details', async () => {
      const responseWithDetails = createResponseWithDetails({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          functionalRoles: ['DOCENTE']
        }
      })
      
      const response = success(responseWithDetails)
      const body = await response.json()

      expect(body.data.user).toHaveProperty('id')
      expect(body.data.user).toHaveProperty('name')
      expect(body.data.user).toHaveProperty('email')
      expect(body.data.user.functionalRoles).toContain('DOCENTE')
    })

    it('should return response with form details', async () => {
      const responseWithDetails = createResponseWithDetails({
        form: {
          id: 'form-1',
          title: 'Test Form',
          category: 'DOCENTES'
        }
      })
      
      const response = success(responseWithDetails)
      const body = await response.json()

      expect(body.data.form).toHaveProperty('id')
      expect(body.data.form).toHaveProperty('title')
      expect(body.data.form).toHaveProperty('category')
    })

    it('should return response with question details', async () => {
      const responseWithDetails = createResponseWithDetails({
        question: {
          id: 'question-1',
          text: 'Test Question',
          type: 'MULTIPLE_CHOICE',
          required: true
        }
      })
      
      const response = success(responseWithDetails)
      const body = await response.json()

      expect(body.data.question).toHaveProperty('id')
      expect(body.data.question).toHaveProperty('text')
      expect(body.data.question).toHaveProperty('type')
      expect(body.data.question).toHaveProperty('required')
    })
  })

  /**
   * Test: Detailed response (full submission) format
   * Validates: Requirements 3.1.1
   */
  describe('Detailed Response Format', () => {
    it('should return detailed response with all answers', async () => {
      const detailedResponse = createDetailedResponse({
        responses: [
          { questionId: 'q1', questionText: 'Question 1', questionType: 'TEXT', value: 'Answer 1', answeredAt: new Date() },
          { questionId: 'q2', questionText: 'Question 2', questionType: 'MULTIPLE_CHOICE', value: 'Option A', answeredAt: new Date() }
        ]
      })
      
      const response = success(detailedResponse)
      const body = await response.json()

      expect(body.data.responses).toHaveLength(2)
      expect(body.data.responses[0]).toHaveProperty('questionId')
      expect(body.data.responses[0]).toHaveProperty('value')
    })

    it('should return submission metadata', async () => {
      const detailedResponse = createDetailedResponse({
        submittedAt: new Date(),
        timeSpent: 600,
        isComplete: true
      })
      
      const response = success(detailedResponse)
      const body = await response.json()

      expect(body.data).toHaveProperty('submittedAt')
      expect(body.data).toHaveProperty('timeSpent')
      expect(body.data).toHaveProperty('isComplete')
      expect(body.data.isComplete).toBe(true)
    })
  })

  /**
   * Test: Question statistics format
   * Validates: Requirements 3.1.1
   */
  describe('Question Statistics Format', () => {
    it('should return question stats with option breakdown', async () => {
      const stats = createQuestionStats({
        questionId: 'q1',
        questionText: 'How satisfied are you?',
        questionType: 'MULTIPLE_CHOICE',
        totalResponses: 100,
        optionStats: [
          { option: 'Very Satisfied', count: 40, percentage: 40 },
          { option: 'Satisfied', count: 35, percentage: 35 },
          { option: 'Neutral', count: 25, percentage: 25 }
        ]
      })
      
      const response = success(stats)
      const body = await response.json()

      expect(body.data).toHaveProperty('questionId')
      expect(body.data).toHaveProperty('totalResponses')
      expect(body.data.optionStats).toHaveLength(3)
      expect(body.data.optionStats[0]).toHaveProperty('option')
      expect(body.data.optionStats[0]).toHaveProperty('count')
      expect(body.data.optionStats[0]).toHaveProperty('percentage')
    })

    it('should return skip rate for optional questions', async () => {
      const stats = createQuestionStats({
        isRequired: false,
        skipRate: 15
      })
      
      const response = success(stats)
      const body = await response.json()

      expect(body.data.isRequired).toBe(false)
      expect(body.data.skipRate).toBe(15)
    })
  })

  /**
   * Test: Form metrics format
   * Validates: Requirements 3.1.1
   */
  describe('Form Metrics Format', () => {
    it('should return overview metrics', async () => {
      const metrics = createFormMetrics()
      
      const response = success(metrics)
      const body = await response.json()

      expect(body.data.overview).toHaveProperty('totalResponses')
      expect(body.data.overview).toHaveProperty('totalUsers')
      expect(body.data.overview).toHaveProperty('responseRate')
      expect(body.data.overview).toHaveProperty('averageTime')
      expect(body.data.overview).toHaveProperty('completionRate')
    })

    it('should return demographic breakdown', async () => {
      const metrics = createFormMetrics()
      
      const response = success(metrics)
      const body = await response.json()

      expect(body.data.demographics).toHaveProperty('byCampus')
      expect(body.data.demographics).toHaveProperty('byCourse')
      expect(body.data.demographics).toHaveProperty('byRole')
      expect(body.data.demographics).toHaveProperty('byPeriod')
    })

    it('should return timeline data', async () => {
      const metrics = createFormMetrics()
      
      const response = success(metrics)
      const body = await response.json()

      expect(body.data.timeline).toBeInstanceOf(Array)
      expect(body.data.timeline[0]).toHaveProperty('date')
      expect(body.data.timeline[0]).toHaveProperty('responses')
      expect(body.data.timeline[0]).toHaveProperty('cumulative')
    })
  })

  /**
   * Test: Response data format consistency
   * Validates: Requirements 3.1.1
   */
  describe('Response Data Format', () => {
    it('should return response with all required fields', async () => {
      const responseData = createResponse()
      
      const response = success(responseData)
      const body = await response.json()

      expect(body.data).toHaveProperty('id')
      expect(body.data).toHaveProperty('userId')
      expect(body.data).toHaveProperty('formId')
      expect(body.data).toHaveProperty('questionId')
      expect(body.data).toHaveProperty('value')
      expect(body.data).toHaveProperty('createdAt')
      expect(body.data).toHaveProperty('updatedAt')
    })
  })

  /**
   * Test: MSW handler integration
   * Validates: Requirements 3.1.1
   */
  describe('MSW Handler Integration', () => {
    it('should intercept GET /api/admin/responses request', async () => {
      const mockResponses = createResponses(3)
      
      server.use(
        http.get(`${baseUrl}/api/admin/responses`, () => {
          return HttpResponse.json({
            data: mockResponses,
            pagination: { page: 1, pageSize: 10, total: 3, totalPages: 1 }
          })
        })
      )

      const response = await fetch(`${baseUrl}/api/admin/responses`)
      const body = await response.json()

      expect(body.data).toHaveLength(3)
    })

    it('should intercept POST /api/responses request', async () => {
      server.use(
        http.post(`${baseUrl}/api/responses`, () => {
          return HttpResponse.json({ 
            data: { message: 'Respostas salvas com sucesso!' },
            success: true 
          }, { status: 201 })
        })
      )

      const response = await fetch(`${baseUrl}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          responses: [
            { formId: 'form-1', questionId: 'q1', value: 'Answer 1' }
          ]
        })
      })
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body.data.message).toBe('Respostas salvas com sucesso!')
    })

    it('should intercept GET /api/responses request for user responses', async () => {
      const mockResponses = createResponses(2)
      
      server.use(
        http.get(`${baseUrl}/api/responses`, () => {
          return HttpResponse.json({ data: mockResponses })
        })
      )

      const response = await fetch(`${baseUrl}/api/responses?user=me`)
      const body = await response.json()

      expect(body.data).toHaveLength(2)
    })
  })
})
