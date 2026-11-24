import { NextRequest } from 'next/server'
import { expect, it, vi } from 'vitest'
import { GET } from '@/app/api/certificates/validate/[code]/route'

const { findByCode, logValidation } = vi.hoisted(() => ({
  findByCode: vi.fn(),
  logValidation: vi.fn(),
}))

vi.mock('@/lib/infrastructure', () => ({
  prismaCertificateRepository: { findByCode, logValidation },
  prismaFormRepository: {},
  prismaResponseRepository: {},
  prismaUserRepository: {},
}))

it('confirma emissão sem publicar nome, e-mail ou metadados privados', async () => {
  const code = 'AVALIA-ABC12-1234'
  const issuedAt = new Date('2026-01-01T12:00:00Z')
  findByCode.mockResolvedValue({
    id: 'certificate', validationCode: code, issuedAt,
    metadata: {
      formTitle: 'Avaliação de exemplo', userName: 'Pessoa de exemplo',
      userEmail: 'pessoa@example.test', formDescription: 'Descrição interna',
      completionDate: issuedAt.toISOString(), workload: '2',
    },
    form: { title: 'Avaliação de exemplo' },
  })

  const response = await GET(new NextRequest(`http://localhost/api/certificates/validate/${code}`, {
    headers: { 'user-agent': 'fixture', 'x-forwarded-for': '192.0.2.10' },
  }), { params: Promise.resolve({ code }) })
  expect(response.status).toBe(200)
  expect((await response.json()).data).toEqual({
    isValid: true,
    certificate: { validationCode: code, issuedAt: issuedAt.toISOString(), formTitle: 'Avaliação de exemplo' },
  })
  expect(logValidation).toHaveBeenCalledWith({
    certificateId: 'certificate', ipAddress: undefined, userAgent: undefined,
  })
})
