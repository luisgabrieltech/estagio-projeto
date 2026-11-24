import { prisma } from '@/lib/services/prisma'
import type { Certificate, CertificateWithDetails, CertificateMetadata } from '@/types/entities/certificate'
import type { PaginatedResponse } from '@/types/common/pagination'
import type {
  ICertificateRepository,
  ValidationLogData,
} from '@/lib/domain/certificate/certificate.repository'
import type { CreateCertificateDTO, CertificateFiltersDTO } from '@/lib/domain/certificate/certificate.schema'

const certificateSelect = {
  id: true,
  validationCode: true,
  userId: true,
  formId: true,
  issuedAt: true,
  hash: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} as const

const certificateWithDetailsSelect = {
  ...certificateSelect,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  form: {
    select: {
      id: true,
      title: true,
      description: true,
    },
  },
} as const

function isCertificateMetadata(value: unknown): value is CertificateMetadata {
  if (!value || typeof value !== 'object') {
    return false
  }
  
  const obj = value as Record<string, unknown>
  
  return (
    typeof obj.completionDate === 'string' &&
    typeof obj.formTitle === 'string' &&
    typeof obj.userName === 'string' &&
    typeof obj.userEmail === 'string' &&
    (obj.formDescription === undefined || typeof obj.formDescription === 'string') &&
    (obj.workload === undefined || typeof obj.workload === 'string')
  )
}

function parseMetadata(metadata: unknown): CertificateMetadata | undefined {
  if (!metadata) {
    return undefined
  }
  
  if (isCertificateMetadata(metadata)) {
    return metadata
  }
  
  console.warn('Invalid certificate metadata structure:', metadata)
  return undefined
}

function toCertificate(data: {
  id: string
  validationCode: string
  userId: string
  formId: string
  issuedAt: Date
  hash: string
  metadata: unknown
  createdAt: Date
  updatedAt: Date
}): Certificate {
  return {
    ...data,
    metadata: parseMetadata(data.metadata),
  }
}

function toCertificateWithDetails(data: {
  id: string
  validationCode: string
  userId: string
  formId: string
  issuedAt: Date
  hash: string
  metadata: unknown
  createdAt: Date
  updatedAt: Date
  user: { id: string; name: string; email: string }
  form: { id: string; title: string; description: string }
}): CertificateWithDetails {
  return {
    ...data,
    metadata: parseMetadata(data.metadata),
  }
}

export class PrismaCertificateRepository implements ICertificateRepository {
  async findById(id: string): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      select: certificateSelect,
    })
    return certificate ? toCertificate(certificate) : null
  }

  async findByCode(validationCode: string): Promise<CertificateWithDetails | null> {
    const certificate = await prisma.certificate.findUnique({
      where: { validationCode: validationCode.toUpperCase() },
      select: certificateWithDetailsSelect,
    })
    return certificate ? toCertificateWithDetails(certificate) : null
  }

  async findByUser(
    userId: string,
    filters?: CertificateFiltersDTO
  ): Promise<PaginatedResponse<CertificateWithDetails>> {
    const page = filters?.page ?? 1
    const pageSize = filters?.pageSize ?? 10

    const where = { userId }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        select: certificateWithDetailsSelect,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.certificate.count({ where }),
    ])

    return {
      data: certificates.map(toCertificateWithDetails),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async findByUserAndForm(userId: string, formId: string): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findFirst({
      where: { userId, formId },
      select: certificateSelect,
    })
    return certificate ? toCertificate(certificate) : null
  }

  async create(data: CreateCertificateDTO): Promise<Certificate> {
    const certificate = await prisma.certificate.create({
      data: {
        validationCode: data.validationCode,
        userId: data.userId,
        formId: data.formId,
        hash: data.hash,
        metadata: data.metadata ?? {},
      },
      select: certificateSelect,
    })
    return toCertificate(certificate)
  }

  async logValidation(data: ValidationLogData): Promise<void> {
    await prisma.validationLog.create({
      data: {
        certificateId: data.certificateId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  }

  async count(filters?: Partial<CertificateFiltersDTO>): Promise<number> {
    const where = this.buildWhereClause(filters)
    return prisma.certificate.count({ where })
  }

  async codeExists(validationCode: string): Promise<boolean> {
    const certificate = await prisma.certificate.findUnique({
      where: { validationCode: validationCode.toUpperCase() },
      select: { id: true },
    })
    return certificate !== null
  }

  private buildWhereClause(filters?: Partial<CertificateFiltersDTO>) {
    const where: Record<string, unknown> = {}

    if (filters?.userId) {
      where.userId = filters.userId
    }

    if (filters?.formId) {
      where.formId = filters.formId
    }

    return where
  }
}

export const prismaCertificateRepository = new PrismaCertificateRepository()
