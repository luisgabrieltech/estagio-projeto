import { success } from '@/lib/api/server-helpers'
import { requireAuth } from '@/lib/api/auth'
import { handleDomainError, ForbiddenError } from '@/lib/domain/errors'
import { ResponseService } from '@/lib/domain/response'
import { prismaResponseRepository, prismaFormRepository } from '@/lib/infrastructure'
import { isAdminRole } from '@/lib/config'

const responseService = new ResponseService(prismaResponseRepository, prismaFormRepository)

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    
    const isAdmin = isAdminRole(session.user.role)
    const isOwnProfile = session.user.id === id
    
    if (!isAdmin && !isOwnProfile) {
      throw new ForbiddenError('Sem permissão para acessar estas respostas')
    }
    
    const responses = await responseService.getResponsesByUser(id)
    
    return success(responses)
  } catch (error) {
    return handleDomainError(error)
  }
}
