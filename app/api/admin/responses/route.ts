import { NextRequest } from 'next/server'
import { paginated } from '@/lib/api/server-helpers'
import { requireAdminOrCSA } from '@/lib/api/auth'
import { ResponseService, handleDomainError } from '@/lib/domain'
import { prismaResponseRepository, prismaFormRepository } from '@/lib/infrastructure'

const responseService = new ResponseService(prismaResponseRepository, prismaFormRepository)

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrCSA()
    
    const { searchParams } = new URL(request.url)
    const filters = {
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
      formId: searchParams.get('formId') || undefined,
      userId: searchParams.get('userId') || undefined,
    }
    
    const result = await responseService.getResponsesWithDetails(filters)
    
    return paginated(result.data, result.pagination)
  } catch (error) {
    return handleDomainError(error)
  }
}
