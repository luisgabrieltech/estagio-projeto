import { z } from 'zod'

/**
 * Schema de validação para variáveis de ambiente
 * Todas as mensagens de erro estão em português
 */
export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL é obrigatória',
  }).url('DATABASE_URL deve ser uma URL válida'),

  // NextAuth
  NEXTAUTH_SECRET: z.string({
    required_error: 'NEXTAUTH_SECRET é obrigatória',
  }).min(32, 'NEXTAUTH_SECRET deve ter pelo menos 32 caracteres'),
  
  NEXTAUTH_URL: z.string({
    required_error: 'NEXTAUTH_URL é obrigatória',
  }).url('NEXTAUTH_URL deve ser uma URL válida'),

  // Email (SMTP) - opcional
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number({
    invalid_type_error: 'SMTP_PORT deve ser um número',
  }).optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email('SMTP_FROM deve ser um email válido').optional(),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    errorMap: () => ({ message: 'NODE_ENV deve ser development, production ou test' }),
  }).default('development'),
  
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error'], {
    errorMap: () => ({ message: 'LOG_LEVEL deve ser debug, info, warn ou error' }),
  }).default('info'),
  
  NEXT_PUBLIC_BASE_PATH: z.string().optional().default(''),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL deve ser uma URL válida').optional(),

  // Rate Limiting
  RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),
})

export type Env = z.infer<typeof envSchema>
