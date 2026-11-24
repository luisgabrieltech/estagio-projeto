import { NextRequest } from 'next/server'
import { success } from '@/lib/api/server-helpers'
import { rateLimitExceededResponse } from '@/lib/api/rate-limit'
import { RateLimiter, getRateLimitStore, getIdentifier, addRateLimitHeaders, rateLimitPresets } from '@/lib/core/rate-limit'
import { 
  CertificateService, 
  handleDomainError, 
  ValidationError 
} from '@/lib/domain'
import { 
  prismaCertificateRepository, 
  prismaFormRepository, 
  prismaResponseRepository, 
  prismaUserRepository 
} from '@/lib/infrastructure'
import { isValidValidationCode } from '@/lib/utils/validation-utils'
import type { PublicCertificateVerification } from '@/types/entities/certificate'

const certificateService = new CertificateService(
  prismaCertificateRepository,
  prismaFormRepository,
  prismaResponseRepository,
  prismaUserRepository
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const limit = process.env.RATE_LIMIT_ENABLED === 'false'
      ? undefined
      : await new RateLimiter(getRateLimitStore(), rateLimitPresets.certificateVerification)
        .check(`certificate-verification:${getIdentifier(request)}`)

    if (limit && !limit.allowed) return rateLimitExceededResponse(limit)

    const code = (await params).code.trim().toUpperCase()

    if (!isValidValidationCode(code)) {
      throw new ValidationError('Código de validação inválido')
    }

    const certificate = await certificateService.validateCertificate({ validationCode: code })

    const response = success<PublicCertificateVerification>({
      isValid: true,
      certificate: {
        validationCode: certificate.validationCode,
        issuedAt: certificate.issuedAt.toISOString(),
        formTitle: certificate.metadata?.formTitle ?? certificate.form.title,
      },
    })
    response.headers.set('Cache-Control', 'no-store')
    return limit ? addRateLimitHeaders(response, limit) : response
  } catch (error) {
    return handleDomainError(error)
  }
}
