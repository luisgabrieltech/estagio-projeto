import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FormService } from '@/lib/domain/form/form.service'
import type { IFormRepository } from '@/lib/domain/form/form.repository'
import { ConflictError, NotFoundError, ValidationError, ForbiddenError } from '@/lib/domain/errors'
import { Category } from '@prisma/client'

describe('FormService Unit Tests', () => {
  let formService: FormService
  let mockRepository: IFormRepository

  const createMockForm = (overrides = {}) => ({
    id: 'form-123',
    title: 'Test Form',
    description: 'Test Description',
    category: Category.DOCENTES,
    status: 'DRAFT' as const,
    externalStatus: 'HIDDEN' as const,
    createdById: 'user-123',
    deadline: null,
    estimatedTime: null,
    generatesCertificate: false,
    certificateHours: null,
    visibleToRoles: [],
    visibleToUserIds: [],
    questions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findMany: vi.fn(),
      findByStatus: vi.fn(),
      findByExternalStatus: vi.fn(),
      findAllWithStats: vi.fn(),
      findWithQuestionResponses: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateWithQuestions: vi.fn(),
      delete: vi.fn(),
      hasResponses: vi.fn(),
      count: vi.fn(),
      getQuestionIdsWithResponses: vi.fn(),
    }
    formService = new FormService(mockRepository)
  })

  describe('createForm', () => {
    it('should create form with valid data', async () => {
      const mockForm = createMockForm()
      vi.mocked(mockRepository.create).mockResolvedValue(mockForm)

      const result = await formService.createForm({
        title: 'Test Form',
        description: 'Test Description',
        category: Category.DOCENTES,
        createdById: 'user-123',
        generatesCertificate: false,
        visibleToRoles: [],
        visibleToUserIds: [],
        questions: [],
      })

      expect(result.id).toBe('form-123')
      expect(mockRepository.create).toHaveBeenCalled()
    })

    it('should throw ValidationError when title is missing', async () => {
      await expect(
        formService.createForm({
          title: '',
          description: 'Test Description with enough characters',
          category: Category.DOCENTES,
          createdById: 'user-123',
          generatesCertificate: false,
          visibleToRoles: [],
          visibleToUserIds: [],
          questions: [],
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when certificate enabled without hours', async () => {
      await expect(
        formService.createForm({
          title: 'Test Form',
          description: 'Test Description with enough characters',
          category: Category.DOCENTES,
          createdById: 'user-123',
          generatesCertificate: true,
          certificateHours: undefined,
          visibleToRoles: [],
          visibleToUserIds: [],
          questions: [],
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should create form with certificate when hours provided', async () => {
      vi.mocked(mockRepository.create).mockResolvedValue(
        createMockForm({ generatesCertificate: true, certificateHours: '4' })
      )

      const result = await formService.createForm({
        title: 'Test Form',
        description: 'Test Description with enough characters',
        category: Category.DOCENTES,
        createdById: 'user-123',
        generatesCertificate: true,
        certificateHours: '4',
        visibleToRoles: [],
        visibleToUserIds: [],
        questions: [],
      })

      expect(result.generatesCertificate).toBe(true)
      expect(result.certificateHours).toBe('4')
    })
  })

  describe('getFormById', () => {
    it('should return form when exists', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(createMockForm())

      const result = await formService.getFormById('form-123')

      expect(result.id).toBe('form-123')
    })

    it('should throw NotFoundError when form does not exist', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(formService.getFormById('nonexistent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('updateForm', () => {
    it('should update form with valid data', async () => {
      vi.mocked(mockRepository.findWithQuestionResponses).mockResolvedValue(
        createMockForm({ questions: [] }) as any
      )
      vi.mocked(mockRepository.update).mockResolvedValue(createMockForm({ title: 'Updated Title' }))
      vi.mocked(mockRepository.findById).mockResolvedValue(createMockForm({ title: 'Updated Title' }))

      const result = await formService.updateForm('form-123', { title: 'Updated Title' })

      expect(result.title).toBe('Updated Title')
    })

    it('should throw NotFoundError when form does not exist', async () => {
      vi.mocked(mockRepository.findWithQuestionResponses).mockResolvedValue(null)

      await expect(
        formService.updateForm('nonexistent', { title: 'Updated Title' })
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ForbiddenError when user is not the creator', async () => {
      vi.mocked(mockRepository.findWithQuestionResponses).mockResolvedValue(
        createMockForm({ createdById: 'other-user', questions: [] }) as any
      )

      await expect(
        formService.updateForm('form-123', { title: 'Updated Title' }, 'user-123')
      ).rejects.toThrow(ForbiddenError)
    })

    it('should throw ConflictError when deleting question with responses', async () => {
      vi.mocked(mockRepository.findWithQuestionResponses).mockResolvedValue(
        createMockForm({
          questions: [
            {
              id: 'q-1',
              text: 'Question 1',
              type: 'TEXT',
              required: true,
              order: 0,
              options: null,
              formId: 'form-123',
              _count: { responses: 5 },
            },
          ],
        }) as any
      )

      await expect(
        formService.updateForm('form-123', { questions: [] })
      ).rejects.toThrow(ConflictError)
    })
  })

  describe('deleteForm', () => {
    it('should delete form without responses', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(createMockForm())
      vi.mocked(mockRepository.hasResponses).mockResolvedValue(false)
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined)

      await expect(formService.deleteForm('form-123')).resolves.toBeUndefined()
    })

    it('should throw NotFoundError when form does not exist', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(formService.deleteForm('nonexistent')).rejects.toThrow(NotFoundError)
    })

    it('should throw ForbiddenError when user is not the creator', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(
        createMockForm({ createdById: 'other-user' })
      )

      await expect(formService.deleteForm('form-123', 'user-123')).rejects.toThrow(ForbiddenError)
    })

    it('should throw ConflictError when form has responses', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(createMockForm())
      vi.mocked(mockRepository.hasResponses).mockResolvedValue(true)

      await expect(formService.deleteForm('form-123')).rejects.toThrow(ConflictError)
    })
  })

  describe('getForms', () => {
    it('should return paginated forms', async () => {
      const paginatedResult = {
        data: [createMockForm()],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      }
      vi.mocked(mockRepository.findMany).mockResolvedValue(paginatedResult)

      const result = await formService.getForms({ page: 1, pageSize: 10 })

      expect(result.data).toHaveLength(1)
    })

    it('should throw ValidationError for invalid pageSize', async () => {
      await expect(
        formService.getForms({ page: 1, pageSize: 500 })
      ).rejects.toThrow(ValidationError)
    })
  })
})
