import { afterEach, describe, expect, it, vi } from 'vitest'
import { getDemoSeedPassword } from '../../../prisma/seed-config'

const sentry = vi.hoisted(() => ({ init: vi.fn() }))
vi.mock('@sentry/nextjs', () => sentry)

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
  sentry.init.mockClear()
})

describe('configuração independente', () => {
  it('serve assets a partir da raiz em produção por padrão', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '')
    const { default: config } = await import('../../../next.config.mjs')
    expect(config.assetPrefix).toBe('')
  })

  it('usa o prefixo configurado para instalações com proxy', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/avaliacoes')
    const { default: config } = await import('../../../next.config.mjs')
    expect(config.assetPrefix).toBe('/avaliacoes')
  })

  it('não inicia telemetria sem configurar um DSN', async () => {
    vi.stubEnv('SENTRY_DSN', '')
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '')
    await import('../../../sentry.server.config')
    await import('../../../sentry.edge.config')
    expect(sentry.init).not.toHaveBeenCalled()
  })

  it('usa o DSN próprio sem coleta padrão de dados pessoais', async () => {
    const dsn = 'https://public@example.invalid/1'
    vi.stubEnv('SENTRY_DSN', dsn)
    await import('../../../sentry.server.config')
    expect(sentry.init).toHaveBeenCalledWith(expect.objectContaining({
      dsn,
      sendDefaultPii: false,
    }))
  })

  it('exige uma senha explícita antes de gravar o seed', () => {
    expect(() => getDemoSeedPassword({})).toThrow('DEMO_SEED_PASSWORD')
    expect(() => getDemoSeedPassword({ DEMO_SEED_PASSWORD: 'curta' })).toThrow('DEMO_SEED_PASSWORD')
    expect(() => getDemoSeedPassword({ DEMO_SEED_PASSWORD: 'é'.repeat(37) })).toThrow('DEMO_SEED_PASSWORD')
  })

  it('bloqueia seed em produção mesmo com uma senha válida', () => {
    const password = 'senha-ficticia-valida'
    expect(getDemoSeedPassword({ DEMO_SEED_PASSWORD: password })).toBe(password)
    expect(() => getDemoSeedPassword({
      NODE_ENV: 'production',
      DEMO_SEED_PASSWORD: password,
    })).toThrow('fora de produção')
  })
})
