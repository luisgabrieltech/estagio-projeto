import { isValidValidationCode } from '@/lib/utils/validation-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CertificateService, generateValidationCode, generateCertificateHash } from '@/lib/domain/certificate/certificate.service'
import type { ICertificateRepository } from '@/lib/domain/certificate/certificate.repository'
import type { IFormRepository } from '@/lib/domain/form/form.repository'
import type { IResponseRepository } from '@/lib/domain/response/response.repository'
import type { IUserRepository } from '@/lib/domain/user/user.repository'
import { ConflictError, NotFoundError, ValidationError, ForbiddenError } from '@/lib/domain/errors'
import { Category, Role, FormStatus, ExternalStatus } from '@prisma/client'

describe('CertificateService Unit Tests', () => {
  let certificateService: CertificateService
  let mockCertificateRepo: ICertificateRepository
  let mockFormRepo: IFormRepository
  let mockResponseRepo: IResponseRepository
  let mockUserRepo: IUserRepository

  const createMockUser = (overrides = {}) => ({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed',
    role: Role.USER,
    functionalRoles: [],
    active: true,
    extraData: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    resetToken: null,
    resetTokenExpiry: null,
    ...overrides,
  })

  const createMockForm = (overrides = {}) => ({
    id: 'form-123',
    title: 'Test Form',
    description: 'Test Description',
    category: Category.DOCENTES,
    status: FormStatus.ACTIVE,
    externalStatus: ExternalStatus.AVAILABLE,
    createdById: 'admin-123',
    deadline: null,
    estimatedTime: null,
    generatesCertificate: true,
    certificateHours: '4',
    visibleToRoles: [],
    visibleToUserIds: [],
    questions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  const createMockCertificate = (overrides = {}) => ({
    id: 'cert-123',
    userId: 'user-123',
    formId: 'form-123',
    validationCode: 'UPE-CPA-ABC12-XYZ1',
    hash: 'somehash',
    metadata: {
      completionDate: new Date().toISOString(),
      formTitle: 'Test Form',
      userName: 'Test User',
      userEmail: 'test@example.com',
      workload: '4',
    },
    issuedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  beforeEach(() => {
    mockCertificateRepo = {
      findById: vi.fn(),
      findByCode: vi.fn(),
      findByUser: vi.fn(),
      findByUserAndForm: vi.fn(),
      create: vi.fn(),
      codeExists: vi.fn(),
      logValidation: vi.fn(),
      count: vi.fn(),
    }

    mockFormRepo = {
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

    mockResponseRepo = {
      findById: vi.fn(),
      findByUser: vi.fn(),
      findByForm: vi.fn(),
      findByUserAndForm: vi.fn(),
      findByUserFormQuestion: vi.fn(),
      findManyWithDetails: vi.fn(),
      saveMany: vi.fn(),
      hasUserRespondedToForm: vi.fn(),
      getRespondedFormIds: vi.fn(),
      countUniqueUsersByForm: vi.fn(),
      count: vi.fn(),
    }

    mockUserRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      updatePassword: vi.fn(),
      setResetToken: vi.fn(),
      findByResetToken: vi.fn(),
      resetPassword: vi.fn(),
    }

    certificateService = new CertificateService(
      mockCertificateRepo,
      mockFormRepo,
      mockResponseRepo,
      mockUserRepo
    )
  })

  describe('generateValidationCode', () => {
    it('should generate code in correct format', () => {
      const code = generateValidationCode('form-123', 'user-123')
      
      expect(code).toMatch(/^AVALIA-[A-Z0-9]{5}-[A-Z0-9]{4}$/)
      expect(isValidValidationCode(code)).toBe(true)
      expect(isValidValidationCode('UPE-CPA-ABC12-XYZ1')).toBe(true)
    })

    it('should generate unique codes for different inputs', () => {
      const code1 = generateValidationCode('form-1', 'user-1')
      const code2 = generateValidationCode('form-2', 'user-2')
      
      expect(code1).not.toBe(code2)
    })
  })

  describe('generateCertificateHash', () => {
    it('should generate consistent hash for same input', () => {
      const data = {
        userId: 'user-123',
        formId: 'form-123',
        validationCode: 'UPE-CPA-ABC12-XYZ1',
        issuedAt: new Date('2024-01-01'),
      }
      
      const hash1 = generateCertificateHash(data)
      const hash2 = generateCertificateHash(data)
      
      expect(hash1).toBe(hash2)
    })

    it('should generate different hash for different input', () => {
      const hash1 = generateCertificateHash({
        userId: 'user-1',
        formId: 'form-1',
        validationCode: 'CODE1',
        issuedAt: new Date(),
      })
      
      const hash2 = generateCertificateHash({
        userId: 'user-2',
        formId: 'form-2',
        validationCode: 'CODE2',
        issuedAt: new Date(),
      })
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('generateCertificate', () => {
    it('should generate certificate for completed form', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(createMockUser())
      vi.mocked(mockFormRepo.findById).mockResolvedValue(createMockForm())
      vi.mocked(mockCertificateRepo.findByUserAndForm).mockResolvedValue(null)
      vi.mocked(mockResponseRepo.findByUserAndForm).mockResolvedValue([{ id: 'resp-1' }] as any)
      vi.mocked(mockCertificateRepo.codeExists).mockResolvedValue(false)
      vi.mocked(mockCertificateRepo.create).mockResolvedValue(createMockCertificate())

      const result = await certificateService.generateCertificate('user-123', 'form-123')

      expect(result.id).toBe('cert-123')
      expect(mockCertificateRepo.create).toHaveBeenCalled()
    })

    it('should throw NotFoundError when user does not exist', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(null)

      await expect(
        certificateService.generateCertificate('nonexistent', 'form-123')
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw NotFoundError when form does not exist', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(createMockUser())
      vi.mocked(mockFormRepo.findById).mockResolvedValue(null)

      await expect(
        certificateService.generateCertificate('user-123', 'nonexistent')
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ForbiddenError when form does not generate certificates', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(createMockUser())
      vi.mocked(mockFormRepo.findById).mockResolvedValue(
        createMockForm({ generatesCertificate: false })
      )

      await expect(
        certificateService.generateCertificate('user-123', 'form-123')
      ).rejects.toThrow(ForbiddenError)
    })

    it('should throw ConflictError when certificate already exists', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(createMockUser())
      vi.mocked(mockFormRepo.findById).mockResolvedValue(createMockForm())
      vi.mocked(mockCertificateRepo.findByUserAndForm).mockResolvedValue(createMockCertificate())

      await expect(
        certificateService.generateCertificate('user-123', 'form-123')
      ).rejects.toThrow(ConflictError)
    })

    it('should throw ValidationError when user has not completed form', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(createMockUser())
      vi.mocked(mockFormRepo.findById).mockResolvedValue(createMockForm())
      vi.mocked(mockCertificateRepo.findByUserAndForm).mockResolvedValue(null)
      vi.mocked(mockResponseRepo.findByUserAndForm).mockResolvedValue([])

      await expect(
        certificateService.generateCertificate('user-123', 'form-123')
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('validateCertificate', () => {
    it('should validate existing certificate', async () => {
      const certWithDetails = {
        ...createMockCertificate(),
        user: createMockUser(),
        form: createMockForm(),
      }
      vi.mocked(mockCertificateRepo.findByCode).mockResolvedValue(certWithDetails as any)
      vi.mocked(mockCertificateRepo.logValidation).mockResolvedValue(undefined)

      const result = await certificateService.validateCertificate({
        validationCode: 'UPE-CPA-ABC12-XYZ1',
      })

      expect(result.id).toBe('cert-123')
      expect(mockCertificateRepo.logValidation).toHaveBeenCalled()
    })

    it('should throw NotFoundError for invalid code', async () => {
      vi.mocked(mockCertificateRepo.findByCode).mockResolvedValue(null)

      await expect(
        certificateService.validateCertificate({ validationCode: 'INVALID' })
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError for empty code', async () => {
      await expect(
        certificateService.validateCertificate({ validationCode: '' })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('getCertificateById', () => {
    it('should return certificate when exists', async () => {
      vi.mocked(mockCertificateRepo.findById).mockResolvedValue(createMockCertificate())

      const result = await certificateService.getCertificateById('cert-123')

      expect(result.id).toBe('cert-123')
    })

    it('should throw NotFoundError when certificate does not exist', async () => {
      vi.mocked(mockCertificateRepo.findById).mockResolvedValue(null)

      await expect(
        certificateService.getCertificateById('nonexistent')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('getCertificatesByUser', () => {
    it('should return user certificates', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(createMockUser())
      vi.mocked(mockCertificateRepo.findByUser).mockResolvedValue({
        data: [createMockCertificate() as any],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      })

      const result = await certificateService.getCertificatesByUser('user-123')

      expect(result.data).toHaveLength(1)
    })

    it('should throw NotFoundError when user does not exist', async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(null)

      await expect(
        certificateService.getCertificatesByUser('nonexistent')
      ).rejects.toThrow(NotFoundError)
    })
  })
})
