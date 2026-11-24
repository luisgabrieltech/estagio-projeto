/**
 * User Generators
 * 
 * Fast-check generators for user-related data
 * 
 * @module __tests__/utils/generators/user.generator
 * Requirements: 4.2, 4.3
 */
import * as fc from 'fast-check'
import { Role, FunctionalRole } from '@prisma/client'
import type { User, UserCreateData, UserFilters } from '@/types/entities/user'
import { emailArb, nameArb, passwordArb, cuidArb, dateArb, booleanArb } from './common.generator'

/**
 * Generates valid Role values
 */
export const roleArb = fc.constantFrom<Role>('ADMIN', 'CSA', 'USER')

/**
 * Generates valid FunctionalRole values
 */
export const functionalRoleArb = fc.constantFrom<FunctionalRole>(
  'DOCENTE',
  'DISCENTE',
  'EGRESSO',
  'TECNICO_UNIDADES_ENSINO',
  'TECNICO_COMPLEXO_HOSPITALAR'
)

/**
 * Generates arrays of FunctionalRole values
 */
export const functionalRolesArb = fc.array(functionalRoleArb, { maxLength: 3 })

/**
 * Generates unique arrays of FunctionalRole values (no duplicates)
 */
export const uniqueFunctionalRolesArb = fc
  .array(functionalRoleArb, { maxLength: 5 })
  .map((roles) => [...new Set(roles)])

/**
 * Generates UserCreateData for creating new users
 */
export const userCreateDataArb: fc.Arbitrary<UserCreateData> = fc.record({
  name: nameArb,
  email: emailArb,
  password: passwordArb,
  role: fc.option(roleArb, { nil: undefined }),
  functionalRoles: fc.option(uniqueFunctionalRolesArb, { nil: undefined }),
})

/**
 * Generates complete User objects
 */
export const userArb: fc.Arbitrary<User> = fc.record({
  id: cuidArb,
  name: nameArb,
  email: emailArb,
  role: roleArb,
  functionalRoles: uniqueFunctionalRolesArb,
  active: booleanArb,
  createdAt: dateArb,
  updatedAt: dateArb,
})

/**
 * Generates User objects with consistent dates (updatedAt >= createdAt)
 */
export const userWithConsistentDatesArb: fc.Arbitrary<User> = fc
  .record({
    id: cuidArb,
    name: nameArb,
    email: emailArb,
    role: roleArb,
    functionalRoles: uniqueFunctionalRolesArb,
    active: booleanArb,
    createdAt: dateArb,
  })
  .chain((user) =>
    fc.date({ min: user.createdAt, max: new Date('2030-12-31') }).map((updatedAt) => ({
      ...user,
      updatedAt,
    }))
  )

/**
 * Generates UserFilters for querying users
 */
export const userFiltersArb: fc.Arbitrary<UserFilters> = fc.record({
  search: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  role: fc.option(roleArb, { nil: undefined }),
  functionalRole: fc.option(functionalRoleArb, { nil: undefined }),
  active: fc.option(booleanArb, { nil: undefined }),
  page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
})

/**
 * Generates admin users
 */
export const adminUserArb: fc.Arbitrary<User> = userArb.map((user) => ({
  ...user,
  role: 'ADMIN' as Role,
}))

/**
 * Generates active users
 */
export const activeUserArb: fc.Arbitrary<User> = userArb.map((user) => ({
  ...user,
  active: true,
}))

/**
 * Generates inactive users
 */
export const inactiveUserArb: fc.Arbitrary<User> = userArb.map((user) => ({
  ...user,
  active: false,
}))
