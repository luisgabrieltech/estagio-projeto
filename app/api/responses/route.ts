import { NextRequest } from 'next/server'
import { success } from '@/lib/api/server-helpers'
import { requireActiveUser, getSession } from '@/lib/api/auth'
import { 
  ResponseService, 
  CertificateService,
  handleDomainError
} from '@/lib/domain'
import { 
  prismaResponseRepository, 
  prismaFormRepository,
  prismaCertificateRepository,
  prismaUserRepository
} from '@/lib/infrastructure'

const responseService = new ResponseService(prismaResponseRepository, prismaFormRepository)
const certificateService = new CertificateService(
  prismaCertificateRepository,
  prismaFormRepository,
  prismaResponseRepository,
  prismaUserRepository
)

export async function POST(request: NextRequest) {
  try {
    const user = await requireActiveUser()
    const data: unknown = await request.json()
    const [firstResponse] = await responseService.saveResponses(user, data)

    if (firstResponse) {
      await generateCertificateIfNeeded(user.id, firstResponse.formId)
    }

    return success({ message: 'Respostas salvas com sucesso!' })
  } catch (error) {
    return handleDomainError(error)
  }
}

async function generateCertificateIfNeeded(userId: string, formId: string) {
  try {
    await certificateService.generateCertificate(userId, formId)
  } catch {
    // Certificate generation is optional
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userParam = searchParams.get('user')
    
    if (userParam !== 'me') {
      return success([])
    }
    
    const session = await getSession()
    if (!session?.user?.id) {
      return success([])
    }
    
    const responses = await responseService.getResponsesByUser(session.user.id)
    
    return success(responses)
  } catch (error) {
    return handleDomainError(error)
  }
}
