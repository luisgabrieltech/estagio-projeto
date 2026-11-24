import { success } from '@/lib/api/server-helpers'
import { requireAdminOrCSA } from '@/lib/api/auth'
import { FormService, handleDomainError } from '@/lib/domain'
import { prismaFormRepository } from '@/lib/infrastructure'

const formService = new FormService(prismaFormRepository)

export async function GET() {
  try {
    await requireAdminOrCSA()

    const formsWithStats = await formService.getFormsWithStats()

    return success(formsWithStats)
  } catch (error) {
    return handleDomainError(error)
  }
}
