import { paginated } from '@/lib/api/server-helpers'
import { requireAuth } from '@/lib/api/auth'
import { handleDomainError } from '@/lib/domain/errors'
import { UserService } from '@/lib/domain/user'
import { prismaUserRepository } from '@/lib/infrastructure'

const userService = new UserService(prismaUserRepository)

export async function GET() {
  try {
    await requireAuth()

    const result = await userService.getUsers({
      page: 1,
      pageSize: 100,
    })

    return paginated(result.data, result.pagination)
  } catch (error) {
    return handleDomainError(error)
  }
}
