import { envSchema, type Env } from './env.schema'

let cachedEnv: Env | null = null

/**
 * Valida todas as variáveis de ambiente
 * Lança erro descritivo se alguma variável obrigatória estiver ausente ou inválida
 * Só executa no servidor (não no browser)
 */
export function validateEnv(): Env {
  // Não validar no cliente - variáveis de servidor não existem lá
  if (typeof window !== 'undefined') {
    // Retorna objeto vazio tipado para evitar erros no cliente
    // As variáveis NEXT_PUBLIC_* estarão disponíveis via process.env diretamente
    return {
      DATABASE_URL: '',
      NEXTAUTH_SECRET: '',
      NEXTAUTH_URL: '',
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || '',
    } as Env
  }

  // Cache para evitar validação múltipla
  if (cachedEnv) {
    return cachedEnv
  }

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n')

    throw new Error(`❌ Variáveis de ambiente inválidas:\n${errors}`)
  }

  cachedEnv = result.data
  return result.data
}

/**
 * Getter para variáveis de ambiente validadas
 * Usa lazy loading para evitar execução no momento da importação
 */
export function getEnv(): Env {
  return validateEnv()
}

/**
 * Objeto tipado com todas as variáveis de ambiente validadas
 * ATENÇÃO: Usar preferencialmente getEnv() para garantir lazy loading
 */
export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    return validateEnv()[prop as keyof Env]
  },
})

export type { Env }
