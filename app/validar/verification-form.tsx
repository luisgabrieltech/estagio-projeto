'use client'

import { useState, type FormEvent } from 'react'
import { Search, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { isValidValidationCode } from '@/lib/utils/validation-utils'
import { validateCertificate } from '@/lib/api/certificate.api'
import type { PublicCertificateVerification } from '@/types/entities/certificate'

export function VerificationForm({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PublicCertificateVerification | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setResult(null)

    const validationCode = code.trim().toUpperCase()
    if (!isValidValidationCode(validationCode)) {
      setError('Código inválido. Confira o código exibido no certificado.')
      return
    }

    setIsLoading(true)
    try {
      setResult(await validateCertificate(validationCode))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao validar certificado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-upe-blue">Validação de certificados</h1>
        <Card>
          <CardHeader>
            <CardTitle>Verificar certificado</CardTitle>
            <CardDescription>Confirme a emissão pelo código exibido no documento.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Label htmlFor="certificate-code">Código de validação</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search aria-hidden="true" className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="certificate-code"
                    placeholder="AVALIA-ABCDE-1234"
                    value={code}
                    onChange={event => setCode(event.target.value.toUpperCase())}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !code.trim()}>
                  {isLoading ? 'Validando...' : 'Validar'}
                </Button>
              </div>
              {error && (
                <div role="alert" className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
                  <XCircle aria-hidden="true" className="size-5" />
                  <p>{error}</p>
                </div>
              )}
            </form>
            {result && (
              <div role="status" className="mt-6 space-y-4">
                <div className="flex items-center gap-2 rounded-md bg-green-50 p-4 text-green-700">
                  <CheckCircle2 aria-hidden="true" className="size-5" />
                  <p>Emissão confirmada</p>
                </div>
                <dl className="space-y-3">
                  <div><dt className="font-medium">Avaliação</dt><dd>{result.certificate.formTitle}</dd></div>
                  <div><dt className="font-medium">Data de emissão</dt><dd>{new Date(result.certificate.issuedAt).toLocaleDateString('pt-BR')}</dd></div>
                  <div><dt className="font-medium">Código de validação</dt><dd className="font-mono">{result.certificate.validationCode}</dd></div>
                </dl>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
