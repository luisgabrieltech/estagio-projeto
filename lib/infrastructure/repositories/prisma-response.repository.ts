import { prisma } from '@/lib/services/prisma'
import type { ResponseWithDetails } from '@/types/entities/response'
import type { PaginatedResponse } from '@/types/common/pagination'
import type {
  IResponseRepository,
  ResponseEntity,
  CreateResponseData,
} from '@/lib/domain/response/response.repository'
import type { ResponseFiltersDTO } from '@/lib/domain/response/response.schema'

const responseSelect = {
  id: true,
  userId: true,
  formId: true,
  questionId: true,
  value: true,
  createdAt: true,
  updatedAt: true,
} as const

const responseWithDetailsSelect = {
  id: true,
  value: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      functionalRoles: true,
    },
  },
  form: {
    select: {
      id: true,
      title: true,
      category: true,
    },
  },
  question: {
    select: {
      id: true,
      text: true,
      type: true,
      required: true,
    },
  },
} as const

export class PrismaResponseRepository implements IResponseRepository {
  async findById(id: string): Promise<ResponseEntity | null> {
    const response = await prisma.response.findUnique({
      where: { id },
      select: responseSelect,
    })
    return response as ResponseEntity | null
  }

  async findByUserFormQuestion(
    userId: string,
    formId: string,
    questionId: string
  ): Promise<ResponseEntity | null> {
    const response = await prisma.response.findUnique({
      where: {
        userId_formId_questionId: {
          userId,
          formId,
          questionId,
        },
      },
      select: responseSelect,
    })
    return response as ResponseEntity | null
  }

  async findByUser(userId: string): Promise<ResponseEntity[]> {
    const responses = await prisma.response.findMany({
      where: { userId },
      select: {
        ...responseSelect,
        form: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return responses as ResponseEntity[]
  }

  async findByForm(formId: string): Promise<ResponseEntity[]> {
    const responses = await prisma.response.findMany({
      where: { formId },
      select: responseSelect,
      orderBy: { createdAt: 'desc' },
    })
    return responses as ResponseEntity[]
  }

  async findByUserAndForm(
    userId: string,
    formId: string
  ): Promise<ResponseEntity[]> {
    const responses = await prisma.response.findMany({
      where: { userId, formId },
      select: responseSelect,
      orderBy: { createdAt: 'desc' },
    })
    return responses as ResponseEntity[]
  }

  async findManyWithDetails(
    filters: ResponseFiltersDTO
  ): Promise<PaginatedResponse<ResponseWithDetails>> {
    const { page = 1, pageSize = 10 } = filters
    const where = this.buildWhereClause(filters)

    const [responses, total] = await Promise.all([
      prisma.response.findMany({
        where,
        select: responseWithDetailsSelect,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.response.count({ where }),
    ])

    return {
      data: responses.map((r) => ({
        id: r.id,
        value: r.value,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          email: r.user.email,
          functionalRoles: r.user.functionalRoles,
        },
        form: {
          id: r.form.id,
          title: r.form.title,
          category: r.form.category,
        },
        question: {
          id: r.question.id,
          text: r.question.text,
          type: r.question.type,
          required: r.question.required,
        },
      })) as ResponseWithDetails[],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async saveMany(responses: CreateResponseData[]): Promise<ResponseEntity[]> {
    const created = await prisma.$transaction(
      responses.map((r) =>
        prisma.response.create({
          data: {
            userId: r.userId,
            formId: r.formId,
            questionId: r.questionId,
            value: r.value,
          },
          select: responseSelect,
        })
      )
    )
    return created as ResponseEntity[]
  }

  async hasUserRespondedToForm(
    userId: string,
    formId: string
  ): Promise<boolean> {
    const count = await prisma.response.count({
      where: { userId, formId },
    })
    return count > 0
  }

  async count(filters?: Partial<ResponseFiltersDTO>): Promise<number> {
    const where = filters ? this.buildWhereClause(filters) : {}
    return prisma.response.count({ where })
  }

  async countUniqueUsersByForm(formId: string): Promise<number> {
    const result = await prisma.response.groupBy({
      by: ['userId'],
      where: { formId },
    })
    return result.length
  }

  async getRespondedFormIds(userId: string): Promise<string[]> {
    const result = await prisma.response.groupBy({
      by: ['formId'],
      where: { userId },
    })
    return result.map((r) => r.formId)
  }

  private buildWhereClause(filters: Partial<ResponseFiltersDTO>) {
    const where: Record<string, unknown> = {}

    if (filters.formId) {
      where.formId = filters.formId
    }

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.questionId) {
      where.questionId = filters.questionId
    }

    if (filters.responseDate) {
      where.createdAt = {
        gte: filters.responseDate.from,
        lte: filters.responseDate.to,
      }
    }

    if (filters.searchTerm) {
      where.OR = [
        { value: { contains: filters.searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: filters.searchTerm, mode: 'insensitive' } } },
      ]
    }

    if (filters.userRole && filters.userRole.length > 0) {
      where.user = {
        ...((where.user as object) || {}),
        functionalRoles: { hasSome: filters.userRole },
      }
    }

    return where
  }
}

export const prismaResponseRepository = new PrismaResponseRepository()
