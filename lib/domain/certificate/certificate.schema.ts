import { z } from 'zod'

/**
 * Schema for certificate metadata
 */
export const certificateMetadataSchema = z.object({
  completionDate: z.string({ required_error: 'Data de conclusão é obrigatória' }),
  formTitle: z.string({ required_error: 'Título do formulário é obrigatório' }),
  formDescription: z.string().optional(),
  userName: z.string({ required_error: 'Nome do usuário é obrigatório' }),
  userEmail: z.string().email('Email inválido'),
  workload: z.string().optional(),
})

/**
 * Schema for creating a new certificate
 */
export const createCertificateSchema = z.object({
  userId: z
    .string({ required_error: 'ID do usuário é obrigatório' })
    .min(1, 'ID do usuário é obrigatório'),
  formId: z
    .string({ required_error: 'ID do formulário é obrigatório' })
    .min(1, 'ID do formulário é obrigatório'),
  validationCode: z
    .string({ required_error: 'Código de validação é obrigatório' })
    .min(1, 'Código de validação é obrigatório'),
  hash: z
    .string({ required_error: 'Hash é obrigatório' })
    .min(1, 'Hash é obrigatório'),
  metadata: certificateMetadataSchema.optional(),
})

/**
 * Schema for validating a certificate by code
 */
export const validateCertificateSchema = z.object({
  validationCode: z
    .string({ required_error: 'Código de validação é obrigatório' })
    .min(1, 'Código de validação é obrigatório')
    .toUpperCase()
    .trim(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

/**
 * Schema for certificate filters in queries
 */
export const certificateFiltersSchema = z.object({
  userId: z.string().optional(),
  formId: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
})

// Type exports inferred from schemas
export type CertificateMetadataDTO = z.infer<typeof certificateMetadataSchema>
export type CreateCertificateDTO = z.infer<typeof createCertificateSchema>
export type ValidateCertificateDTO = z.infer<typeof validateCertificateSchema>
export type CertificateFiltersDTO = z.infer<typeof certificateFiltersSchema>
