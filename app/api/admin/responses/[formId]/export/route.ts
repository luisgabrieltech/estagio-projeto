import { NextResponse } from 'next/server'
import { requireAdminOrCSA } from '@/lib/api/auth'
import { handleDomainError, NotFoundError, ValidationError } from '@/lib/domain/errors'
import { ExportService } from '@/lib/domain/response'
import type { ExportFilters, ExportFormData, ExportQuestionData } from '@/lib/domain/response'
import { prisma } from '@/lib/services/prisma'

const exportService = new ExportService()

export async function GET(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    await requireAdminOrCSA()

    const { formId } = await params
    const { searchParams } = new URL(req.url)

    const format = searchParams.get('format') || 'csv'
    const includeMetrics = searchParams.get('includeMetrics') === 'true'
    const includePersonalData = searchParams.get('includePersonalData') !== 'false'

    const filters: ExportFilters = {
      campusFilter: searchParams.get('campus')?.split(',').filter(Boolean) || [],
      courseFilter: searchParams.get('course')?.split(',').filter(Boolean) || [],
      roleFilter: searchParams.get('role')?.split(',').filter(Boolean) || [],
      dateFromFilter: searchParams.get('dateFrom'),
      dateToFilter: searchParams.get('dateTo'),
      questionIds: searchParams.get('questionIds')?.split(',').filter(Boolean) || [],
    }

    // Fetch form with questions and responses
    const form = await fetchFormData(formId, filters.questionIds)

    if (!form) {
      throw new NotFoundError('Formulário', formId)
    }

    const { questions, data } = exportService.processExportData(form, filters)

    if (format === 'csv') {
      return generateCSVResponse(form, questions, data, includeMetrics, includePersonalData)
    } else if (format === 'excel') {
      return generateExcelResponse(form, questions, data, includeMetrics, includePersonalData)
    } else {
      throw new ValidationError('Formato não suportado')
    }
  } catch (error) {
    return handleDomainError(error)
  }
}

async function fetchFormData(
  formId: string,
  questionIds: string[]
): Promise<ExportFormData | null> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      id: true,
      title: true,
      questions: {
        select: {
          id: true,
          customId: true,
          text: true,
          type: true,
          order: true,
          options: true,
          rows: true,
          columns: true,
          responses: {
            select: {
              id: true,
              value: true,
              userId: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  extraData: true,
                },
              },
            },
          },
        },
        orderBy: { order: 'asc' },
        where: questionIds.length > 0 ? { id: { in: questionIds } } : undefined,
      },
    },
  })

  if (!form) return null

  // Transform to ExportFormData type
  return {
    id: form.id,
    title: form.title,
    questions: form.questions.map(q => ({
      id: q.id,
      customId: q.customId,
      text: q.text,
      type: q.type,
      order: q.order,
      options: q.options as string[],
      rows: q.rows as string[],
      columns: q.columns as string[],
      responses: q.responses.map(r => ({
        id: r.id,
        value: r.value,
        userId: r.userId,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          email: r.user.email,
          extraData: r.user.extraData as Record<string, unknown> | null,
        },
      })),
    })),
  }
}

function generateCSVResponse(
  form: ExportFormData,
  questions: ExportQuestionData[],
  exportData: ReturnType<ExportService['processExportData']>['data'],
  includeMetrics: boolean,
  includePersonalData: boolean
) {
  const { content, fileName } = exportService.generateCSV(
    form,
    questions,
    exportData,
    includeMetrics,
    includePersonalData
  )

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache',
    },
  })
}

function generateExcelResponse(
  form: ExportFormData,
  questions: ExportQuestionData[],
  exportData: ReturnType<ExportService['processExportData']>['data'],
  includeMetrics: boolean,
  includePersonalData: boolean
) {
  const { content, fileName } = exportService.generateExcel(
    form,
    questions,
    exportData,
    includeMetrics,
    includePersonalData
  )

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/tab-separated-values; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache',
    },
  })
}
