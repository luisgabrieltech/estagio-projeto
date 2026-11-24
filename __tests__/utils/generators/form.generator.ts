/**
 * Form Generators
 * 
 * Fast-check generators for form and question data
 * 
 * @module __tests__/utils/generators/form.generator
 * Requirements: 4.2, 4.3
 */
import * as fc from 'fast-check'
import { Category, FormStatus, ExternalStatus, QuestionType } from '@prisma/client'
import type { Form, Question, FormCreateData, FormFilters } from '@/types/entities/form'
import { 
  cuidArb, 
  dateArb, 
  nonEmptyStringArb, 
  optionalStringArb,
  booleanArb,
  stringArrayArb,
  nonEmptyStringArrayArb,
  positiveIntArb,
} from './common.generator'

/**
 * Generates valid Category values
 * Based on Prisma schema: DOCENTES, DISCENTES, EGRESSOS, TECNICOS_UNIDADES, TECNICOS_COMPLEXO
 */
export const categoryArb = fc.constantFrom<Category>(
  'DOCENTES',
  'DISCENTES',
  'EGRESSOS',
  'TECNICOS_UNIDADES',
  'TECNICOS_COMPLEXO'
)

/**
 * Generates valid FormStatus values
 * Based on Prisma schema: DRAFT, ACTIVE, CLOSED, FROZEN
 */
export const formStatusArb = fc.constantFrom<FormStatus>('DRAFT', 'ACTIVE', 'CLOSED', 'FROZEN')

/**
 * Generates valid ExternalStatus values
 * Based on Prisma schema: HIDDEN, AVAILABLE, FROZEN, SCHEDULED
 */
export const externalStatusArb = fc.constantFrom<ExternalStatus>('HIDDEN', 'AVAILABLE', 'FROZEN', 'SCHEDULED')

/**
 * Generates valid QuestionType values
 * Based on Prisma schema: MULTIPLE_CHOICE, CHECKBOX, TEXT, SCALE, GRID, DROPDOWN, SECTION
 */
export const questionTypeArb = fc.constantFrom<QuestionType>(
  'MULTIPLE_CHOICE',
  'CHECKBOX',
  'TEXT',
  'SCALE',
  'GRID',
  'DROPDOWN',
  'SECTION'
)

/**
 * Generates estimated time strings
 */
export const estimatedTimeArb = fc.constantFrom(
  '5 minutos',
  '10 minutos',
  '15 minutos',
  '20 minutos',
  '30 minutos',
  '45 minutos',
  '1 hora'
)

/**
 * Generates certificate hours strings
 */
export const certificateHoursArb = fc.constantFrom(
  '1 hora',
  '2 horas',
  '4 horas',
  '8 horas',
  '10 horas',
  '20 horas'
)

/**
 * Generates Question objects
 */
export const questionArb: fc.Arbitrary<Question> = fc.record({
  id: cuidArb,
  customId: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
  type: questionTypeArb,
  text: nonEmptyStringArb,
  description: fc.option(nonEmptyStringArb, { nil: undefined }),
  required: booleanArb,
  order: positiveIntArb,
  options: stringArrayArb,
  rows: stringArrayArb,
  columns: stringArrayArb,
  conditional: fc.constant(null),
  formId: cuidArb,
  createdAt: dateArb,
  updatedAt: dateArb,
})

/**
 * Generates multiple choice questions with options
 */
export const multipleChoiceQuestionArb: fc.Arbitrary<Question> = questionArb.map((q) => ({
  ...q,
  type: 'MULTIPLE_CHOICE' as QuestionType,
  options: ['Option A', 'Option B', 'Option C'],
}))

/**
 * Generates scale questions
 */
export const scaleQuestionArb: fc.Arbitrary<Question> = questionArb.map((q) => ({
  ...q,
  type: 'SCALE' as QuestionType,
  options: [],
}))

/**
 * Generates grid questions with rows and columns
 */
export const gridQuestionArb: fc.Arbitrary<Question> = fc
  .tuple(questionArb, nonEmptyStringArrayArb, nonEmptyStringArrayArb)
  .map(([q, rows, columns]) => ({
    ...q,
    type: 'GRID' as QuestionType,
    rows,
    columns,
    options: [],
  }))

/**
 * Generates complete Form objects
 */
export const formArb: fc.Arbitrary<Form> = fc.record({
  id: cuidArb,
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  category: categoryArb,
  status: formStatusArb,
  externalStatus: externalStatusArb,
  deadline: fc.option(dateArb, { nil: null }),
  estimatedTime: fc.option(estimatedTimeArb, { nil: null }),
  generatesCertificate: booleanArb,
  certificateHours: fc.option(certificateHoursArb, { nil: null }),
  visibleToRoles: stringArrayArb,
  visibleToUserIds: fc.array(cuidArb, { maxLength: 5 }),
  createdAt: dateArb,
  updatedAt: dateArb,
  createdById: cuidArb,
  questions: fc.option(fc.array(questionArb, { maxLength: 10 }), { nil: undefined }),
})

/**
 * Generates active/published forms
 */
export const publishedFormArb: fc.Arbitrary<Form> = formArb.map((form) => ({
  ...form,
  status: 'ACTIVE' as FormStatus,
  externalStatus: 'AVAILABLE' as ExternalStatus,
}))

/**
 * Generates draft forms
 */
export const draftFormArb: fc.Arbitrary<Form> = formArb.map((form) => ({
  ...form,
  status: 'DRAFT' as FormStatus,
  externalStatus: 'HIDDEN' as ExternalStatus,
}))

/**
 * Generates FormCreateData for creating new forms
 */
export const formCreateDataArb: fc.Arbitrary<FormCreateData> = fc.record({
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  category: categoryArb,
  deadline: fc.option(dateArb, { nil: undefined }),
  estimatedTime: fc.option(estimatedTimeArb, { nil: undefined }),
  generatesCertificate: fc.option(booleanArb, { nil: undefined }),
  certificateHours: fc.option(certificateHoursArb, { nil: undefined }),
  visibleToRoles: fc.option(stringArrayArb, { nil: undefined }),
  visibleToUserIds: fc.option(fc.array(cuidArb, { maxLength: 5 }), { nil: undefined }),
  questions: fc.option(fc.constant([]), { nil: undefined }),
})

/**
 * Generates FormFilters for querying forms
 */
export const formFiltersArb: fc.Arbitrary<FormFilters> = fc.record({
  search: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  status: fc.option(formStatusArb, { nil: undefined }),
  externalStatus: fc.option(externalStatusArb, { nil: undefined }),
  category: fc.option(categoryArb, { nil: undefined }),
  generatesCertificate: fc.option(booleanArb, { nil: undefined }),
  page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
})
