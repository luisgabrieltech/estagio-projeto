import { NextResponse } from 'next/server'
import { requireAdminOrCSA } from '@/lib/api/auth'
import { handleDomainError, NotFoundError } from '@/lib/domain/errors'
import { ResponseAnalyticsService } from '@/lib/domain/response'
import type { AnalyticsFilters, StatisticsFormData, QuestionStats } from '@/lib/domain/response'
import { prisma } from '@/lib/services/prisma'

const analyticsService = new ResponseAnalyticsService()

export async function GET(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    await requireAdminOrCSA()

    const { formId } = await params
    const filters = extractFilters(req)

    const form = await fetchFormForStatistics(formId)

    if (!form) {
      throw new NotFoundError('Formulário', formId)
    }

    const uniqueRespondents = await prisma.response.groupBy({
      by: ['userId'],
      where: { formId },
      _count: { userId: true },
    })
    const totalUniqueRespondents = uniqueRespondents.length

    const questionStats: QuestionStats[] = form.questions.map(question => {
      const filteredResponses = analyticsService.filterResponses(question.responses, filters)
      return analyticsService.calculateQuestionStats(question, filteredResponses, totalUniqueRespondents)
    })

    return NextResponse.json({ data: questionStats })
  } catch (error) {
    return handleDomainError(error)
  }
}

function extractFilters(req: Request): AnalyticsFilters {
  const { searchParams } = new URL(req.url)

  return {
    campusFilter: searchParams.get('campus')?.split(',').filter(Boolean) || [],
    courseFilter: searchParams.get('course')?.split(',').filter(Boolean) || [],
    roleFilter: searchParams.get('role')?.split(',').filter(Boolean) || [],
    dateFromFilter: searchParams.get('dateFrom'),
    dateToFilter: searchParams.get('dateTo'),
  }
}

async function fetchFormForStatistics(formId: string): Promise<StatisticsFormData | null> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      id: true,
      title: true,
      questions: {
        select: {
          id: true,
          text: true,
          type: true,
          required: true,
          options: true,
          rows: true,
          columns: true,
          order: true,
          responses: {
            select: {
              id: true,
              value: true,
              createdAt: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  extraData: true,
                  createdAt: true,
                },
              },
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!form) return null

  return {
    id: form.id,
    title: form.title,
    questions: form.questions.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      required: q.required,
      options: q.options as string[],
      rows: q.rows as string[],
      columns: q.columns as string[],
      order: q.order,
      responses: q.responses.map(r => ({
        id: r.id,
        value: r.value,
        createdAt: r.createdAt,
        userId: r.userId,
        user: {
          id: r.user.id,
          extraData: r.user.extraData as Record<string, unknown> | null,
          createdAt: r.user.createdAt,
        },
      })),
    })),
  }
}
