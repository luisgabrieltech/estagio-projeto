import { z } from 'zod'
import { Category, FormStatus, ExternalStatus } from '@prisma/client'
import { questionDataSchema } from './question.schema'

/**
 * Base schema for form data validation
 * Contains common fields used across create and update operations
 */
const formBaseSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .trim(),
  description: z
    .string({ required_error: 'Descrição é obrigatória' })
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .trim(),
  category: z.nativeEnum(Category, {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }),
  deadline: z.coerce.date().optional().nullable(),
  estimatedTime: z.string().optional().nullable(),
  generatesCertificate: z.boolean().default(false),
  certificateHours: z.string().optional().nullable(),
  visibleToRoles: z.array(z.string()).default([]),
  visibleToUserIds: z.array(z.string()).default([]),
})

/**
 * Schema for creating a new form
 * Requires createdById and optionally includes questions
 */
export const createFormSchema = formBaseSchema.extend({
  createdById: z.string({ required_error: 'ID do criador é obrigatório' }),
  questions: z.array(questionDataSchema).optional().default([]),
})

/**
 * Schema for updating an existing form
 * All fields are optional
 */
export const updateFormSchema = formBaseSchema.partial().extend({
  status: z.nativeEnum(FormStatus, {
    errorMap: () => ({ message: 'Status inválido' }),
  }).optional(),
  externalStatus: z.nativeEnum(ExternalStatus, {
    errorMap: () => ({ message: 'Status externo inválido' }),
  }).optional(),
  questions: z.array(questionDataSchema.extend({
    id: z.string().optional(),
  })).optional(),
})

/**
 * Schema for form filters in queries
 */
export const formFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(FormStatus).optional(),
  externalStatus: z.nativeEnum(ExternalStatus).optional(),
  category: z.nativeEnum(Category).optional(),
  generatesCertificate: z.coerce.boolean().optional(),
  createdById: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
})

/**
 * Refinement to validate certificate hours when certificate is enabled
 */
export const createFormSchemaWithValidation = createFormSchema.refine(
  (data) => {
    if (data.generatesCertificate && !data.certificateHours) {
      return false
    }
    return true
  },
  {
    message: 'Carga horária do certificado é obrigatória quando o formulário gera certificado',
    path: ['certificateHours'],
  }
)

// Type exports inferred from schemas
export type CreateFormDTO = z.infer<typeof createFormSchema>
export type UpdateFormDTO = z.infer<typeof updateFormSchema>
export type FormFiltersDTO = z.infer<typeof formFiltersSchema>
