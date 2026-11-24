import { NextRequest } from 'next/server'
import { success } from '@/lib/api/server-helpers'
import { requireAuth } from '@/lib/api/auth'
import { handleDomainError } from '@/lib/domain/errors'
import { UserService } from '@/lib/domain/user'
import { prismaUserRepository } from '@/lib/infrastructure'
import { transformUserWithFunctionalRoles } from '@/lib/utils/format'

const userService = new UserService(prismaUserRepository)

export async function GET() {
  try {
    const session = await requireAuth()
    const user = await userService.getProfileByEmail(session.user.email!)

    return success(transformUserWithFunctionalRoles(user))
  } catch (error) {
    return handleDomainError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { name, extraData } = await request.json()

    const user = await userService.updateProfileByEmail(session.user.email!, {
      name,
      extraData,
    })

    return success(transformUserWithFunctionalRoles(user))
  } catch (error) {
    return handleDomainError(error)
  }
}
