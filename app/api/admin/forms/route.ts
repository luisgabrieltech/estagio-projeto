import { NextRequest } from 'next/server'
import { paginated } from '@/lib/api/server-helpers'
import { requireAdmin } from '@/lib/api/auth'
import { handleDomainError } from '@/lib/domain/errors'
import { FormService } from '@/lib/domain/form'
import { prismaFormRepository } from '@/lib/infrastructure'
import type { ExternalStatus } from '@prisma/client'

const formService = new FormService(prismaFormRepository)

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const filters = {
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
      search: searchParams.get('search') || undefined,
      externalStatus: (searchParams.get('status') as ExternalStatus) || undefined,
    }

    const result = await formService.getForms(filters)

    return paginated(result.data, result.pagination)
  } catch (error) {
    return handleDomainError(error)
  }
}
