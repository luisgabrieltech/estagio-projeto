import { NextRequest } from 'next/server'
import { paginated } from '@/lib/api/server-helpers'
import { requireAdmin } from '@/lib/api/auth'
import { handleDomainError } from '@/lib/domain/errors'
import { UserService } from '@/lib/domain/user'
import { prismaUserRepository } from '@/lib/infrastructure'
import type { Role, FunctionalRole } from '@prisma/client'

const userService = new UserService(prismaUserRepository)

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const filters = {
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
      search: searchParams.get('search') || undefined,
      role: (searchParams.get('role') as Role) || undefined,
      functionalRole: (searchParams.get('functionalRole') as FunctionalRole) || undefined,
      active: searchParams.get('active') !== null 
        ? searchParams.get('active') === 'true' 
        : undefined,
    }

    const result = await userService.getUsers(filters)

    return paginated(result.data, result.pagination)
  } catch (error) {
    return handleDomainError(error)
  }
}
