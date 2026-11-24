import { z } from 'zod'
import { Role, FunctionalRole } from '@prisma/client'

/**
 * Base schema for user data validation
 * Contains common fields used across create and update operations
 */
const userBaseSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Papel inválido' }),
  }).optional().default('USER'),
  functionalRoles: z.array(
    z.nativeEnum(FunctionalRole, {
      errorMap: () => ({ message: 'Cargo funcional inválido' }),
    })
  ).optional().default([]),
  extraData: z.record(z.any()).optional(),
})

/**
 * Schema for creating a new user
 * Requires password field in addition to base fields
 */
export const createUserSchema = userBaseSchema.extend({
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

/**
 * Schema for updating an existing user
 * All fields are optional, password is excluded
 */
export const updateUserSchema = userBaseSchema.partial().extend({
  active: z.boolean().optional(),
})

/**
 * Schema for user filters in queries
 */
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  functionalRole: z.nativeEnum(FunctionalRole).optional(),
  active: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
})

// Type exports inferred from schemas
export type CreateUserDTO = z.infer<typeof createUserSchema>
export type UpdateUserDTO = z.infer<typeof updateUserSchema>
export type UserFiltersDTO = z.infer<typeof userFiltersSchema>
