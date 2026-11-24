import { env } from '@/lib/core/env'

/**
 * Configurações centralizadas e tipadas da aplicação
 * Derivadas das variáveis de ambiente validadas
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export const config = {
  /** Indica se está em ambiente de desenvolvimento */
  isDev: env.NODE_ENV === 'development',
  /** Indica se está em ambiente de produção */
  isProd: env.NODE_ENV === 'production',
  /** Indica se está em ambiente de teste */
  isTest: env.NODE_ENV === 'test',

  /** Configurações de banco de dados (Requirement 5.2) */
  database: {
    url: env.DATABASE_URL,
  },

  /** Configurações de autenticação (Requirement 5.3) */
  auth: {
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL,
  },

  /** Configurações de email (Requirement 5.4) */
  email: {
    /** Email está habilitado se SMTP_HOST e SMTP_USER estiverem configurados */
    enabled: Boolean(env.SMTP_HOST && env.SMTP_USER),
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.SMTP_FROM,
  },

  /** Configurações da aplicação (Requirement 5.5) */
  app: {
    basePath: env.NEXT_PUBLIC_BASE_PATH,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    logLevel: env.LOG_LEVEL,
    nodeEnv: env.NODE_ENV,
  },
} as const

export type Config = typeof config
