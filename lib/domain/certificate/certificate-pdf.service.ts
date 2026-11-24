import { generateCertificatePDF } from '@/lib/templates/certificate-template'
import type { CertificateMetadata } from '@/types/entities/certificate'

export class CertificatePdfService {
  generatePdf(metadata: CertificateMetadata, validationCode: string): Promise<Buffer> {
    const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000')
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || appUrl.pathname
    appUrl.pathname = `${basePath.replace(/\/$/, '')}/validar`
    appUrl.search = ''
    appUrl.hash = ''
    appUrl.searchParams.set('code', validationCode)

    return generateCertificatePDF({
      metadata,
      validationCode,
      validationUrl: appUrl.toString(),
    })
  }
}
