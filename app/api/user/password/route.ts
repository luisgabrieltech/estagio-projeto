import { NextRequest } from 'next/server'
import { success } from '@/lib/api/server-helpers'
import { requireAuth } from '@/lib/api/auth'
import { handleDomainError } from '@/lib/domain/errors'
import { UserService } from '@/lib/domain/user'
import { prismaUserRepository } from '@/lib/infrastructure'

const userService = new UserService(prismaUserRepository)

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { currentPassword, newPassword } = await request.json()

    await userService.changePassword(session.user.id, currentPassword, newPassword)

    return success({ message: 'Senha alterada com sucesso' })
  } catch (error) {
    return handleDomainError(error)
  }
}
