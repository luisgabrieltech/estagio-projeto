import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/certificates/[id]/download/route'

const { findById, currentUser } = vi.hoisted(() => ({
  findById: vi.fn(),
  currentUser: vi.fn(),
}))

vi.mock('@/lib/api/auth', () => ({
  requireAuth: async () => ({ user: await currentUser() }),
  requireActiveUser: currentUser,
}))

vi.mock('@/lib/infrastructure', () => ({
  prismaCertificateRepository: { findById },
  prismaFormRepository: {},
  prismaResponseRepository: {},
  prismaUserRepository: {},
}))

const id = 'certificate-fixture-no-file'
const download = () => GET(new NextRequest(`http://localhost/api/certificates/${id}/download`), {
  params: Promise.resolve({ id }),
})

beforeEach(() => {
  currentUser.mockResolvedValue({ id: 'owner', role: 'USER' })
  findById.mockResolvedValue({
    id,
    userId: 'owner',
    validationCode: 'AVALIA-ABC12-1234',
    metadata: {
      formTitle: 'Avaliação fictícia',
      userName: 'Pessoa de Exemplo',
      userEmail: 'pessoa@example.test',
      completionDate: '2026-01-01T12:00:00Z',
    },
  })
})

describe('download de certificado', () => {
  it('entrega um PDF a partir do registro, mesmo sem arquivo pré-gerado', async () => {
    const response = await download()
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/pdf')
    expect(Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString()).toBe('%PDF-')
  })

  it('rejeita download por outra conta sem acesso administrativo', async () => {
    currentUser.mockResolvedValue({ id: 'other', role: 'USER' })
    expect((await download()).status).toBe(403)
  })
})
