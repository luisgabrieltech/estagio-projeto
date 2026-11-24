import crypto from 'crypto'
import type { Certificate, CertificateWithDetails, CertificateMetadata } from '@/types/entities/certificate'
import type { PaginatedResponse } from '@/types/common/pagination'
import type { ICertificateRepository } from './certificate.repository'
import type { IFormRepository } from '@/lib/domain/form/form.repository'
import type { IResponseRepository } from '@/lib/domain/response/response.repository'
import type { IUserRepository } from '@/lib/domain/user/user.repository'
import {
  validateCertificateSchema,
  certificateFiltersSchema,
  type ValidateCertificateDTO,
  type CertificateFiltersDTO,
} from './certificate.schema'
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
  formatZodErrors,
} from '@/lib/domain/errors'

export function generateValidationCode(formId: string, userId: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  const hash = crypto
    .createHash('sha256')
    .update(`${formId}${userId}${timestamp}${random}`)
    .digest('hex')
    .substring(0, 5)

  return `AVALIA-${hash}-${timestamp.substring(0, 4)}`.toUpperCase()
}

export function generateCertificateHash(data: {
  userId: string
  formId: string
  validationCode: string
  issuedAt: Date
}): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

export class CertificateService {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly formRepository: IFormRepository,
    private readonly responseRepository: IResponseRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async generateCertificate(userId: string, formId: string): Promise<Certificate> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('Usuário', userId)
    }

    const form = await this.formRepository.findById(formId)
    if (!form) {
      throw new NotFoundError('Formulário', formId)
    }

    if (!form.generatesCertificate) {
      throw new ForbiddenError('Este formulário não gera certificado')
    }

    const existingCertificate = await this.certificateRepository.findByUserAndForm(userId, formId)
    if (existingCertificate) {
      throw new ConflictError('Certificado já foi gerado para este formulário')
    }

    const responses = await this.responseRepository.findByUserAndForm(userId, formId)
    if (!responses || responses.length === 0) {
      throw new ValidationError('Usuário não completou o formulário')
    }

    let validationCode = generateValidationCode(formId, userId)
    let attempts = 0
    const maxAttempts = 10

    while (await this.certificateRepository.codeExists(validationCode) && attempts < maxAttempts) {
      validationCode = generateValidationCode(formId, userId)
      attempts++
    }

    if (attempts >= maxAttempts) {
      throw new ValidationError('Não foi possível gerar código de validação único')
    }

    const issuedAt = new Date()

    const hash = generateCertificateHash({
      userId,
      formId,
      validationCode,
      issuedAt,
    })

    const metadata: CertificateMetadata = {
      completionDate: issuedAt.toISOString(),
      formTitle: form.title,
      formDescription: form.description ?? undefined,
      userName: user.name,
      userEmail: user.email,
      workload: form.certificateHours ?? undefined,
    }

    return this.certificateRepository.create({
      userId,
      formId,
      validationCode,
      hash,
      metadata,
    })
  }

  async validateCertificate(data: ValidateCertificateDTO): Promise<CertificateWithDetails> {
    const parseResult = validateCertificateSchema.safeParse(data)
    if (!parseResult.success) {
      const details = formatZodErrors(parseResult.error.errors)
      throw new ValidationError('Dados de validação inválidos', details)
    }
    const validated = parseResult.data

    const certificate = await this.certificateRepository.findByCode(validated.validationCode)
    if (!certificate) {
      throw new NotFoundError('Certificado')
    }

    await this.certificateRepository.logValidation({
      certificateId: certificate.id,
      ipAddress: validated.ipAddress,
      userAgent: validated.userAgent,
    })

    return certificate
  }

  async getCertificatesByUser(
    userId: string,
    filters?: CertificateFiltersDTO
  ): Promise<PaginatedResponse<CertificateWithDetails>> {
    if (filters) {
      const parseResult = certificateFiltersSchema.safeParse(filters)
      if (!parseResult.success) {
        const details = formatZodErrors(parseResult.error.errors)
        throw new ValidationError('Filtros inválidos', details)
      }
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('Usuário', userId)
    }

    return this.certificateRepository.findByUser(userId, filters)
  }

  async getCertificateMetadata(certificate: Certificate): Promise<CertificateMetadata> {
    if (certificate.metadata) return certificate.metadata

    const [user, form] = await Promise.all([
      this.userRepository.findById(certificate.userId),
      this.formRepository.findById(certificate.formId),
    ])
    if (!user || !form) {
      throw new NotFoundError('Dados do certificado', certificate.id)
    }

    return {
      completionDate: certificate.issuedAt.toISOString(),
      formTitle: form.title,
      formDescription: form.description ?? undefined,
      userName: user.name,
      userEmail: user.email,
      workload: form.certificateHours ?? undefined,
    }
  }

  async getCertificateById(id: string): Promise<Certificate> {
    const certificate = await this.certificateRepository.findById(id)
    if (!certificate) {
      throw new NotFoundError('Certificado', id)
    }
    return certificate
  }
}
