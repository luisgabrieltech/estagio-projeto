import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/services/prisma'
import type { Form, FormWithStats } from '@/types/entities/form'
import type { PaginatedResponse } from '@/types/common/pagination'
import type {
  IFormRepository,
  FormEntity,
  FormWithQuestionResponses,
  CreateFormData,
  UpdateFormData,
} from '@/lib/domain/form/form.repository'
import type { FormFiltersDTO } from '@/lib/domain/form/form.schema'
import type { FormStatus, ExternalStatus } from '@prisma/client'

function toJsonValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === null) return Prisma.JsonNull
  if (value === undefined) return undefined
  return value as Prisma.InputJsonValue
}

const formSelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  status: true,
  externalStatus: true,
  deadline: true,
  estimatedTime: true,
  generatesCertificate: true,
  certificateHours: true,
  visibleToRoles: true,
  visibleToUserIds: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
} as const

const questionSelect = {
  id: true,
  customId: true,
  text: true,
  type: true,
  required: true,
  options: true,
  rows: true,
  columns: true,
  order: true,
  conditional: true,
  formId: true,
  createdAt: true,
  updatedAt: true,
} as const

export class PrismaFormRepository implements IFormRepository {
  async findById(id: string): Promise<FormEntity | null> {
    const form = await prisma.form.findUnique({
      where: { id },
      select: {
        ...formSelect,
        questions: {
          select: questionSelect,
          orderBy: { order: 'asc' },
        },
      },
    })
    return form as FormEntity | null
  }

  async findWithQuestionResponses(id: string): Promise<FormWithQuestionResponses | null> {
    const form = await prisma.form.findUnique({
      where: { id },
      select: {
        ...formSelect,
        questions: {
          select: {
            ...questionSelect,
            _count: {
              select: { responses: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })
    return form as FormWithQuestionResponses | null
  }

  async findMany(filters: FormFiltersDTO): Promise<PaginatedResponse<Form>> {
    const { page = 1, pageSize = 10, ...filterParams } = filters
    const where = this.buildWhereClause(filterParams)

    const [forms, total] = await Promise.all([
      prisma.form.findMany({
        where,
        select: {
          ...formSelect,
          _count: {
            select: { questions: true },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.form.count({ where }),
    ])

    const formIds = forms.map(f => f.id)
    const respondentCounts = await prisma.response.groupBy({
      by: ['formId', 'userId'],
      where: { formId: { in: formIds } },
    })

    const respondentCountMap = new Map<string, number>()
    for (const formId of formIds) {
      const count = respondentCounts.filter(r => r.formId === formId).length
      respondentCountMap.set(formId, count)
    }

    const formsWithRespondentCount = forms.map(form => ({
      ...form,
      respondentCount: respondentCountMap.get(form.id) || 0,
    }))

    return {
      data: formsWithRespondentCount as Form[],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async findByStatus(status: FormStatus): Promise<Form[]> {
    const forms = await prisma.form.findMany({
      where: { status },
      select: formSelect,
      orderBy: { createdAt: 'desc' },
    })
    return forms as Form[]
  }

  async findByExternalStatus(externalStatus: ExternalStatus): Promise<Form[]> {
    const forms = await prisma.form.findMany({
      where: { externalStatus },
      select: formSelect,
      orderBy: { createdAt: 'desc' },
    })
    return forms as Form[]
  }

  async create(data: CreateFormData): Promise<FormEntity> {
    const form = await prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        createdById: data.createdById,
        deadline: data.deadline,
        estimatedTime: data.estimatedTime,
        generatesCertificate: data.generatesCertificate ?? false,
        certificateHours: data.certificateHours,
        visibleToRoles: data.visibleToRoles ?? [],
        visibleToUserIds: data.visibleToUserIds ?? [],
        questions: data.questions?.length
          ? {
              create: data.questions.map((q, index) => ({
                customId: q.customId,
                text: q.text,
                type: q.type,
                required: q.required ?? false,
                options: q.options ?? [],
                rows: q.rows ?? [],
                columns: q.columns ?? [],
                order: q.order ?? index,
                conditional: toJsonValue(q.conditional),
              })),
            }
          : undefined,
      },
      select: {
        ...formSelect,
        questions: {
          select: questionSelect,
          orderBy: { order: 'asc' },
        },
      },
    })
    return form as FormEntity
  }

  async update(id: string, data: UpdateFormData): Promise<Form> {
    const updateData: Record<string, unknown> = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.category !== undefined) updateData.category = data.category
    if (data.status !== undefined) updateData.status = data.status
    if (data.externalStatus !== undefined) updateData.externalStatus = data.externalStatus
    if (data.deadline !== undefined) updateData.deadline = data.deadline
    if (data.estimatedTime !== undefined) updateData.estimatedTime = data.estimatedTime
    if (data.generatesCertificate !== undefined) updateData.generatesCertificate = data.generatesCertificate
    if (data.certificateHours !== undefined) updateData.certificateHours = data.certificateHours
    if (data.visibleToRoles !== undefined) updateData.visibleToRoles = data.visibleToRoles
    if (data.visibleToUserIds !== undefined) updateData.visibleToUserIds = data.visibleToUserIds

    const form = await prisma.form.update({
      where: { id },
      data: updateData,
      select: formSelect,
    })
    return form as Form
  }

  async updateWithQuestions(id: string, data: UpdateFormData): Promise<FormEntity> {
    const { questions, ...formData } = data

    const form = await prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {}
      if (formData.title !== undefined) updateData.title = formData.title
      if (formData.description !== undefined) updateData.description = formData.description
      if (formData.category !== undefined) updateData.category = formData.category
      if (formData.status !== undefined) updateData.status = formData.status
      if (formData.externalStatus !== undefined) updateData.externalStatus = formData.externalStatus
      if (formData.deadline !== undefined) updateData.deadline = formData.deadline
      if (formData.estimatedTime !== undefined) updateData.estimatedTime = formData.estimatedTime
      if (formData.generatesCertificate !== undefined) updateData.generatesCertificate = formData.generatesCertificate
      if (formData.certificateHours !== undefined) updateData.certificateHours = formData.certificateHours
      if (formData.visibleToRoles !== undefined) updateData.visibleToRoles = formData.visibleToRoles
      if (formData.visibleToUserIds !== undefined) updateData.visibleToUserIds = formData.visibleToUserIds

      if (Object.keys(updateData).length > 0) {
        await tx.form.update({
          where: { id },
          data: updateData,
        })
      }

      if (questions) {
        const existingQuestionIds = questions
          .filter((q) => q.id)
          .map((q) => q.id as string)

        const questionsToDelete = await tx.question.findMany({
          where: {
            formId: id,
            id: { notIn: existingQuestionIds },
            responses: { none: {} },
          },
          select: { id: true },
        })

        if (questionsToDelete.length > 0) {
          await tx.question.deleteMany({
            where: {
              id: { in: questionsToDelete.map((q) => q.id) },
            },
          })
        }

        for (const question of questions) {
          if (question.id) {
            await tx.question.update({
              where: { id: question.id },
              data: {
                customId: question.customId,
                text: question.text,
                type: question.type,
                required: question.required ?? false,
                options: question.options ?? [],
                rows: question.rows ?? [],
                columns: question.columns ?? [],
                order: question.order,
                conditional: toJsonValue(question.conditional),
              },
            })
          } else {
            await tx.question.create({
              data: {
                formId: id,
                customId: question.customId,
                text: question.text,
                type: question.type,
                required: question.required ?? false,
                options: question.options ?? [],
                rows: question.rows ?? [],
                columns: question.columns ?? [],
                order: question.order,
                conditional: toJsonValue(question.conditional),
              },
            })
          }
        }
      }

      return tx.form.findUnique({
        where: { id },
        select: {
          ...formSelect,
          questions: {
            select: questionSelect,
            orderBy: { order: 'asc' },
          },
        },
      })
    })

    return form as FormEntity
  }

  async delete(id: string): Promise<void> {
    await prisma.form.delete({
      where: { id },
    })
  }

  async count(filters?: Partial<FormFiltersDTO>): Promise<number> {
    const where = filters ? this.buildWhereClause(filters) : {}
    return prisma.form.count({ where })
  }

  async hasResponses(id: string): Promise<boolean> {
    const count = await prisma.response.count({
      where: { formId: id },
    })
    return count > 0
  }

  async getQuestionIdsWithResponses(formId: string): Promise<string[]> {
    const questions = await prisma.question.findMany({
      where: {
        formId,
        responses: { some: {} },
      },
      select: { id: true },
    })
    return questions.map((q) => q.id)
  }

  async findAllWithStats(): Promise<FormWithStats[]> {
    const forms = await prisma.form.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        externalStatus: true,
        deadline: true,
        estimatedTime: true,
        generatesCertificate: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
        responses: {
          select: {
            userId: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalActiveUsers = await prisma.user.count({
      where: { active: true },
    })

    return forms.map((form) => {
      const uniqueRespondents = new Set(form.responses.map((r) => r.userId))
      const totalResponses = uniqueRespondents.size
      const totalQuestions = form._count.questions

      const responseRate =
        totalActiveUsers > 0 ? (totalResponses / totalActiveUsers) * 100 : 0

      const lastResponse =
        form.responses.length > 0
          ? form.responses.reduce((latest, current) =>
              new Date(current.createdAt) > new Date(latest.createdAt)
                ? current
                : latest
            ).createdAt
          : null

      return {
        id: form.id,
        title: form.title,
        description: form.description,
        category: form.category,
        status: form.status,
        externalStatus: form.externalStatus,
        deadline: form.deadline,
        estimatedTime: form.estimatedTime,
        generatesCertificate: form.generatesCertificate,
        totalResponses,
        totalQuestions,
        responseRate,
        lastResponse,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        createdBy: form.createdBy,
      }
    })
  }

  private buildWhereClause(filters: Partial<FormFiltersDTO>) {
    const where: Record<string, unknown> = {}

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.externalStatus) {
      where.externalStatus = filters.externalStatus
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.generatesCertificate !== undefined) {
      where.generatesCertificate = filters.generatesCertificate
    }

    if (filters.createdById) {
      where.createdById = filters.createdById
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        (where.createdAt as Record<string, unknown>).gte = filters.dateFrom
      }
      if (filters.dateTo) {
        (where.createdAt as Record<string, unknown>).lte = filters.dateTo
      }
    }

    return where
  }
}

export const prismaFormRepository = new PrismaFormRepository()
