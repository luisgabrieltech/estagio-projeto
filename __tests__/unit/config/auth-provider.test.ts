import { hashSync } from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authOptions } from '@/lib/auth/auth-options'
import { GET, POST } from '@/app/api/magic-link/route'

const findUnique = vi.hoisted(() => vi.fn())
vi.mock('@/lib/services/prisma', () => ({ prisma: { user: { findUnique } } }))

function getProvider() {
  const provider = authOptions.providers[0]
  if (provider.type !== 'credentials') throw new Error('Provedor de credenciais ausente')
  return provider
}

function authorize(credentials: { email: string; password: string }) {
  const callback = getProvider().options?.authorize
  if (!callback) throw new Error('Callback de autenticação ausente')
  return callback(credentials, { method: 'POST' })
}

beforeEach(() => findUnique.mockReset())

describe('provedor de credenciais', () => {
  it('expõe apenas e-mail e senha para autenticação', () => {
    expect(getProvider().options?.credentials).toEqual({
      email: { label: 'Email', type: 'email' },
      password: { label: 'Senha', type: 'password' },
    })
  })

  it('rejeita credenciais incompletas antes de consultar a conta', async () => {
    await expect(authorize({ email: 'pessoa@example.test', password: '' }))
      .rejects.toThrow('Credenciais inválidas')
    expect(findUnique).not.toHaveBeenCalled()
  })

  it('mantém login por senha para conta ativa', async () => {
    const email = 'pessoa@example.test'
    const password = 'apenas-uma-fixture'
    findUnique.mockResolvedValue({
      id: 'user-1',
      email,
      name: 'Pessoa Exemplo',
      role: 'USER',
      active: true,
      password: hashSync(password, 4),
    })

    await expect(authorize({ email, password }))
      .resolves.toMatchObject({ id: 'user-1', email, role: 'USER' })
  })

  it('desativa emissão e consumo do acesso legado', async () => {
    for (const handler of [GET, POST]) {
      const response = handler()
      expect(response.status).toBe(410)
      await expect(response.json()).resolves.toMatchObject({ success: false })
    }
  })
})
