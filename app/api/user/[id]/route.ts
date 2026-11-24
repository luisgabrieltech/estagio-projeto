import { NextRequest } from 'next/server'
import { success } from '@/lib/api/server-helpers'
import { requireAdmin } from '@/lib/api/auth'
import { handleDomainError, ValidationError } from '@/lib/domain/errors'
import { UserService } from '@/lib/domain/user'
import { prismaUserRepository } from '@/lib/infrastructure'
import { SYSTEM_ROLES_LIST } from '@/lib/config'

const userService = new UserService(prismaUserRepository)

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    
    const { id } = await params
    if (!id) {
      throw new ValidationError('ID do usuário é obrigatório')
    }

    const { active, role, extraData } = await req.json()
    
    const dataToUpdate: Record<string, unknown> = {}
    if (typeof active === 'boolean') dataToUpdate.active = active
    if (role && SYSTEM_ROLES_LIST.includes(role)) dataToUpdate.role = role
    if (extraData !== undefined) dataToUpdate.extraData = extraData
    
    if (Object.keys(dataToUpdate).length === 0) {
      throw new ValidationError('Nenhum dado para atualizar')
    }

    const user = await userService.updateUser(id, dataToUpdate)
    
    return success(user)
  } catch (error) {
    return handleDomainError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    
    const { id } = await params
    if (!id) {
      throw new ValidationError('ID do usuário é obrigatório')
    }

    await userService.deleteUser(id)
    
    return success({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    return handleDomainError(error)
  }
}
