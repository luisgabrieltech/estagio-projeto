import { NextRequest } from 'next/server'
import { created } from '@/lib/api/server-helpers'
import { handleDomainError, ValidationError } from '@/lib/domain/errors'
import { UserService } from '@/lib/domain/user'
import { prismaUserRepository } from '@/lib/infrastructure'

const userService = new UserService(prismaUserRepository)

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, userType } = await request.json()

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('Nome é obrigatório')
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new ValidationError('E-mail é obrigatório')
    }

    if (!password || typeof password !== 'string') {
      throw new ValidationError('Senha é obrigatória')
    }

    const functionalRoles = userType?.split(',').filter(Boolean) || []

    const user = await userService.registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      functionalRoles,
    })

    return created({ message: 'Usuário criado com sucesso', user })
  } catch (error) {
    return handleDomainError(error)
  }
}
