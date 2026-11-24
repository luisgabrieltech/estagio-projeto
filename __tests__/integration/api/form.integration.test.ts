import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/utils/mocks/server'
import { success, paginated, created } from '@/lib/api/server-helpers'
import { handleDomainError } from '@/lib/domain/errors/handle-domain-error'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/domain/errors'
import { FormStatus, ExternalStatus, QuestionType } from '@prisma/client'
import { 
  createForm, 
  createForms, 
  createPublishedForm,
  createQuestion,
  createMultipleChoiceQuestion
} from '@/__tests__/utils/factories'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || ''

describe('Form API Routes Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('GET /api/admin/forms', () => {
    it('should return paginated list of forms', async () => {
      const forms = createForms(5)
      const pagination = { page: 1, pageSize: 10, total: 5, totalPages: 1 }
      
      const response = paginated(forms, pagination)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('pagination')
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.data).toHaveLength(5)
      expect(body.pagination).toEqual(pagination)
    })

    it('should handle pagination parameters correctly', async () => {
      const forms = createForms(10)
      const pagination = { page: 2, pageSize: 5, total: 20, totalPages: 4 }
      
      const response = paginated(forms, pagination)
      const body = await response.json()

      expect(body.pagination.page).toBe(2)
      expect(body.pagination.pageSize).toBe(5)
      expect(body.pagination.totalPages).toBe(4)
    })

    it('should return empty list when no forms exist', async () => {
      const forms: ReturnType<typeof createForm>[] = []
      const pagination = { page: 1, pageSize: 10, total: 0, totalPages: 0 }
      
      const response = paginated(forms, pagination)
      const body = await response.json()

      expect(body.data).toHaveLength(0)
      expect(body.pagination.total).toBe(0)
    })

    it('should filter forms by status', async () => {
      const publishedForms = createForms(3, { status: FormStatus.ACTIVE })
      const pagination = { page: 1, pageSize: 10, total: 3, totalPages: 1 }
      
      const response = paginated(publishedForms, pagination)
      const body = await response.json()

      expect(body.data).toHaveLength(3)
      body.data.forEach((form: { status: string }) => {
        expect(form.status).toBe('ACTIVE')
      })
    })
  })

  describe('GET /api/forms?id=:id', () => {
    it('should return single form data', async () => {
      const form = createForm({ id: 'form-123', title: 'Test Form' })
      
      const response = success(form)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toHaveProperty('data')
      expect(body.data.id).toBe('form-123')
      expect(body.data.title).toBe('Test Form')
    })

    it('should return form with questions', async () => {
      const form = createForm({ id: 'form-123' })
      const questions = [
        createQuestion(form.id, { text: 'Question 1' }),
        createMultipleChoiceQuestion(form.id, ['A', 'B', 'C'], { text: 'Question 2' })
      ]
      form.questions = questions
      
      const response = success(form)
      const body = await response.json()

      expect(body.data.questions).toHaveLength(2)
      expect(body.data.questions[0].text).toBe('Question 1')
      expect(body.data.questions[1].type).toBe('MULTIPLE_CHOICE')
    })

    it('should return 404 for non-existent form', async () => {
      const error = new NotFoundError('Formulário', 'non-existent-id')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })
  })

  describe('POST /api/forms', () => {
    it('should create form and return 201', async () => {
      const createdFormData = createForm({ id: 'new-form-id', title: 'New Form' })
      
      const response = created(createdFormData)
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body).toHaveProperty('data')
      expect(body.data.title).toBe('New Form')
    })

    it('should create form with questions', async () => {
      const createdFormData = createForm({ 
        id: 'new-form-id',
        title: 'Form with Questions',
        questions: [
          createQuestion('new-form-id', { text: 'Question 1', type: QuestionType.TEXT, required: true }),
          createMultipleChoiceQuestion('new-form-id', ['A', 'B'], { text: 'Question 2' })
        ]
      })
      
      const response = created(createdFormData)
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body.data.questions).toHaveLength(2)
    })

    it('should return validation error for invalid data', async () => {
      const error = new ValidationError('Dados inválidos', { title: ['Título é obrigatório'] })
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.details).toHaveProperty('title')
    })

    it('should return 403 for non-admin users', async () => {
      const error = new ForbiddenError('Acesso negado')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(403)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('FORBIDDEN')
    })
  })

  describe('POST /api/forms (update)', () => {
    it('should update form and return updated data', async () => {
      const updatedForm = createForm({ id: 'form-123', title: 'Updated Title' })
      
      const response = success(updatedForm)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.title).toBe('Updated Title')
    })

    it('should update form status', async () => {
      const updatedForm = createPublishedForm({ id: 'form-123' })
      
      const response = success(updatedForm)
      const body = await response.json()

      expect(body.data.status).toBe('PUBLISHED')
      expect(body.data.externalStatus).toBe('OPEN')
    })

    it('should return 404 when updating non-existent form', async () => {
      const error = new NotFoundError('Formulário', 'non-existent-id')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })
  })

  describe('PATCH /api/forms', () => {
    it('should update form visibility', async () => {
      const updatedForm = createForm({ 
        id: 'form-123', 
        visibleToRoles: ['DOCENTE', 'DISCENTE'] 
      })
      
      const response = success(updatedForm)
      const body = await response.json()

      expect(body.data.visibleToRoles).toContain('DOCENTE')
      expect(body.data.visibleToRoles).toContain('DISCENTE')
    })

    it('should update external status', async () => {
      const updatedForm = createForm({ 
        id: 'form-123', 
        externalStatus: ExternalStatus.FROZEN
      })
      
      const response = success(updatedForm)
      const body = await response.json()

      expect(body.data.externalStatus).toBe('FROZEN')
    })
  })

  describe('DELETE /api/forms', () => {
    it('should delete form successfully', async () => {
      const response = success({ message: 'Formulário excluído' })
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.data.message).toBe('Formulário excluído')
    })

    it('should return 404 when deleting non-existent form', async () => {
      const error = new NotFoundError('Formulário', 'non-existent-id')
      const response = handleDomainError(error)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })
  })

  describe('Form Data Format', () => {
    it('should return form with all required fields', async () => {
      const form = createForm()
      
      const response = success(form)
      const body = await response.json()

      expect(body.data).toHaveProperty('id')
      expect(body.data).toHaveProperty('title')
      expect(body.data).toHaveProperty('description')
      expect(body.data).toHaveProperty('category')
      expect(body.data).toHaveProperty('status')
      expect(body.data).toHaveProperty('externalStatus')
      expect(body.data).toHaveProperty('createdAt')
      expect(body.data).toHaveProperty('updatedAt')
    })

    it('should return form with optional fields when present', async () => {
      const form = createForm({
        deadline: new Date('2025-12-31'),
        estimatedTime: '30 minutos',
        generatesCertificate: true,
        certificateHours: '4'
      })
      
      const response = success(form)
      const body = await response.json()

      expect(body.data).toHaveProperty('deadline')
      expect(body.data).toHaveProperty('estimatedTime')
      expect(body.data.generatesCertificate).toBe(true)
      expect(body.data.certificateHours).toBe('4')
    })
  })

  describe('Question Data Format', () => {
    it('should return question with all required fields', async () => {
      const form = createForm()
      const question = createQuestion(form.id)
      form.questions = [question]
      
      const response = success(form)
      const body = await response.json()

      const q = body.data.questions[0]
      expect(q).toHaveProperty('id')
      expect(q).toHaveProperty('text')
      expect(q).toHaveProperty('type')
      expect(q).toHaveProperty('required')
      expect(q).toHaveProperty('order')
    })

    it('should return multiple choice question with options', async () => {
      const form = createForm()
      const question = createMultipleChoiceQuestion(form.id, ['Option A', 'Option B', 'Option C'])
      form.questions = [question]
      
      const response = success(form)
      const body = await response.json()

      const q = body.data.questions[0]
      expect(q.type).toBe('MULTIPLE_CHOICE')
      expect(q.options).toHaveLength(3)
      expect(q.options).toContain('Option A')
    })
  })

  describe('MSW Handler Integration', () => {
    it('should intercept GET /api/admin/forms request', async () => {
      const mockForms = createForms(3)
      
      server.use(
        http.get(`${baseUrl}/api/admin/forms`, () => {
          return HttpResponse.json({
            data: mockForms,
            pagination: { page: 1, pageSize: 10, total: 3, totalPages: 1 }
          })
        })
      )

      const response = await fetch(`${baseUrl}/api/admin/forms`)
      const body = await response.json()

      expect(body.data).toHaveLength(3)
    })

    it('should intercept POST /api/admin/forms request', async () => {
      const newForm = createForm({ title: 'Created via MSW' })
      
      server.use(
        http.post(`${baseUrl}/api/admin/forms`, () => {
          return HttpResponse.json({ data: newForm }, { status: 201 })
        })
      )

      const response = await fetch(`${baseUrl}/api/admin/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Created via MSW' })
      })
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body.data.title).toBe('Created via MSW')
    })

    it('should intercept GET /api/forms request for public forms', async () => {
      const mockForms = createForms(2, { status: FormStatus.ACTIVE })
      
      server.use(
        http.get(`${baseUrl}/api/forms`, () => {
          return HttpResponse.json({
            data: mockForms,
            pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 }
          })
        })
      )

      const response = await fetch(`${baseUrl}/api/forms`)
      const body = await response.json()

      expect(body.data).toHaveLength(2)
    })
  })
})
