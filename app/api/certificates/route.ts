import { NextRequest } from 'next/server'
import { success } from '@/lib/api/server-helpers'
import { requireAuth } from '@/lib/api/auth'
import { CertificateService, handleDomainError } from '@/lib/domain'
import { 
  prismaCertificateRepository, 
  prismaFormRepository, 
  prismaResponseRepository, 
  prismaUserRepository 
} from '@/lib/infrastructure'

const certificateService = new CertificateService(
  prismaCertificateRepository,
  prismaFormRepository,
  prismaResponseRepository,
  prismaUserRepository
)

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const result = await certificateService.getCertificatesByUser(session.user.id, {
      page: 1,
      pageSize: 100,
    })

    const formattedCertificates = result.data.map((cert) => ({
      id: cert.id,
      formTitle: cert.form.title,
      completedAt: cert.createdAt,
    }))

    return success(formattedCertificates)
  } catch (error) {
    return handleDomainError(error)
  }
}
