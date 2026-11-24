import { isValidValidationCode } from '@/lib/utils/validation-utils'
import { VerificationForm } from './verification-form'

export default async function ValidarPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>
}) {
  const { code } = await searchParams
  const normalized = typeof code === 'string' ? code.trim().toUpperCase() : ''
  const initialCode = isValidValidationCode(normalized) ? normalized : ''

  return <VerificationForm key={initialCode} initialCode={initialCode} />
}
