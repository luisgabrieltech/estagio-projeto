import { z } from 'zod'

/**
 * Schema for a single response item
 */
export const responseItemSchema = z.object({
  formId: z
    .string({ required_error: 'ID do formulário é obrigatório' })
    .min(1, 'ID do formulário é obrigatório'),
  questionId: z
    .string({ required_error: 'ID da questão é obrigatório' })
    .min(1, 'ID da questão é obrigatório'),
  value: z
    .string({ required_error: 'Valor da resposta é obrigatório' }),
})

/**
 * Schema for creating responses (batch submission)
 */
export const createResponsesSchema = z.object({
  responses: z
    .array(responseItemSchema, {
      required_error: 'Respostas são obrigatórias',
    })
    .min(1, 'Pelo menos uma resposta é obrigatória'),
})

/**
 * Schema for response filters in queries
 */
export const responseFiltersSchema = z.object({
  formId: z.string().optional(),
  userId: z.string().optional(),
  questionId: z.string().optional(),
  campus: z.array(z.string()).optional(),
  course: z.array(z.string()).optional(),
  userRole: z.array(z.string()).optional(),
  responseDate: z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  }).optional(),
  completionStatus: z.enum(['complete', 'partial', 'all']).optional(),
  searchTerm: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
})

// Type exports inferred from schemas
export type ResponseItemDTO = z.infer<typeof responseItemSchema>
export type CreateResponsesDTO = z.infer<typeof createResponsesSchema>
export type ResponseFiltersDTO = z.infer<typeof responseFiltersSchema>
