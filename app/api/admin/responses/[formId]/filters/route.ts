import { NextResponse } from 'next/server'
import { requireAdminOrCSA } from '@/lib/api/auth'
import { handleDomainError, NotFoundError } from '@/lib/domain/errors'
import { ResponseAnalyticsService } from '@/lib/domain/response'
import type { FiltersFormData } from '@/lib/domain/response'
import { prisma } from '@/lib/services/prisma'

const analyticsService = new ResponseAnalyticsService()

export async function GET(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    await requireAdminOrCSA()

    const { formId } = await params

    const form = await fetchFormForFilters(formId)

    if (!form) {
      throw new NotFoundError('Formulário', formId)
    }

    const filterOptions = analyticsService.calculateFilterOptions(form)

    return NextResponse.json({ data: filterOptions })
  } catch (error) {
    return handleDomainError(error)
  }
}

async function fetchFormForFilters(formId: string): Promise<FiltersFormData | null> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      id: true,
      title: true,
      responses: {
        select: {
          id: true,
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
  })

  if (!form) return null

  return {
    id: form.id,
    title: form.title,
    responses: form.responses.map(r => ({
      id: r.id,
      userId: r.userId,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        extraData: r.user.extraData as Record<string, unknown> | null,
        createdAt: r.user.createdAt,
      },
    })),
  }
}
