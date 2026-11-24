import { NextRequest } from 'next/server'
import { success } from '@/lib/api/server-helpers'
import { handleDomainError, ValidationError } from '@/lib/domain/errors'
import { UserService } from '@/lib/domain/user'
import { prismaUserRepository } from '@/lib/infrastructure'

const userService = new UserService(prismaUserRepository)

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new ValidationError('Token é obrigatório')
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      throw new ValidationError('Senha é obrigatória')
    }

    await userService.resetPasswordWithToken(token.trim(), password)

    return success({ message: 'Senha redefinida com sucesso' })
  } catch (error) {
    return handleDomainError(error)
  }
}
