import { z } from 'zod'
import { QuestionType } from '@prisma/client'

/**
 * Condition type enum for conditional logic
 */
export const conditionTypeSchema = z.enum([
  'equals',
  'contains',
  'not_equals',
  'greater_than',
  'less_than',
])

/**
 * Conditional operator enum
 */
export const conditionalOperatorSchema = z.enum(['AND', 'OR'])

/**
 * Single condition schema
 */
export const conditionSchema = z.object({
  type: conditionTypeSchema,
  value: z.string(),
})

/**
 * Conditional rule schema
 * Defines when a question should be shown based on other questions
 */
export const conditionalRuleSchema = z.object({
  dependsOn: z.string({ required_error: 'Questão de dependência é obrigatória' }),
  operator: conditionalOperatorSchema.default('AND'),
  conditions: z.array(conditionSchema).min(1, 'Pelo menos uma condição é obrigatória'),
})

/**
 * Base question schema with common fields
 */
const questionBaseSchema = z.object({
  customId: z.string().optional().nullable(),
  text: z
    .string({ required_error: 'Texto da questão é obrigatório' })
    .min(1, 'Texto da questão não pode estar vazio')
    .max(1000, 'Texto da questão deve ter no máximo 1000 caracteres'),
  type: z.nativeEnum(QuestionType, {
    errorMap: () => ({ message: 'Tipo de questão inválido' }),
  }),
  required: z.boolean().default(false),
  order: z.number().int().min(0, 'Ordem deve ser um número positivo'),
  options: z.array(z.string()).default([]),
  rows: z.array(z.string()).default([]),
  columns: z.array(z.string()).default([]),
  conditional: conditionalRuleSchema.optional().nullable(),
})

/**
 * Schema for creating a new question
 */
export const createQuestionSchema = questionBaseSchema.extend({
  formId: z.string({ required_error: 'ID do formulário é obrigatório' }),
})

/**
 * Schema for updating an existing question
 */
export const updateQuestionSchema = questionBaseSchema.partial()

/**
 * Schema for question data when creating/updating forms with questions
 * Does not require formId as it will be set by the form
 */
export const questionDataSchema = questionBaseSchema

/**
 * Refinement to validate question options based on type
 */
export const validateQuestionOptions = (question: z.infer<typeof questionBaseSchema>) => {
  const typesRequiringOptions: QuestionType[] = [
    'MULTIPLE_CHOICE',
    'CHECKBOX',
    'DROPDOWN',
  ]
  
  if (typesRequiringOptions.includes(question.type) && question.options.length < 2) {
    return false
  }
  
  if (question.type === 'GRID') {
    return question.rows.length >= 1 && question.columns.length >= 1
  }
  
  return true
}

/**
 * Schema with validation refinements
 */
export const createQuestionSchemaWithValidation = createQuestionSchema.refine(
  validateQuestionOptions,
  {
    message: 'Questões de múltipla escolha, checkbox ou dropdown precisam de pelo menos 2 opções. Questões de grade precisam de pelo menos 1 linha e 1 coluna.',
    path: ['options'],
  }
)

// Type exports
export type ConditionType = z.infer<typeof conditionTypeSchema>
export type ConditionalOperator = z.infer<typeof conditionalOperatorSchema>
export type Condition = z.infer<typeof conditionSchema>
export type ConditionalRule = z.infer<typeof conditionalRuleSchema>
export type CreateQuestionDTO = z.infer<typeof createQuestionSchema>
export type UpdateQuestionDTO = z.infer<typeof updateQuestionSchema>
export type QuestionDataDTO = z.infer<typeof questionDataSchema>
