import { NextRequest, NextResponse } from 'next/server'
import { requireActiveUser } from '@/lib/api/auth'
import { 
  CertificateService,
  CertificatePdfService,
  handleDomainError, 
  ForbiddenError,
  ValidationError
} from '@/lib/domain'
import { 
  prismaCertificateRepository, 
  prismaFormRepository, 
  prismaResponseRepository, 
  prismaUserRepository 
} from '@/lib/infrastructure'
import { isAdminRole } from '@/lib/config'

const certificateService = new CertificateService(
  prismaCertificateRepository,
  prismaFormRepository,
  prismaResponseRepository,
  prismaUserRepository
)
const pdfService = new CertificatePdfService()

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireActiveUser()
    const { id: certificateId } = await params

    if (!certificateId) {
      throw new ValidationError('ID do certificado não fornecido')
    }

    const certificate = await certificateService.getCertificateById(certificateId)

    if (!isAdminRole(user.role) && user.id !== certificate.userId) {
      throw new ForbiddenError('Não autorizado a baixar este certificado')
    }

    const metadata = await certificateService.getCertificateMetadata(certificate)
    const pdfBuffer = await pdfService.generatePdf(metadata, certificate.validationCode)
    const formTitle = metadata.formTitle.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .slice(0, 80)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado_${formTitle || 'avaliacao'}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    return handleDomainError(error)
  }
}
