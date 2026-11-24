/**
 * Schema Generators
 * 
 * Fast-check generators for domain Zod schemas
 * These generators produce data that conforms to the Zod schema validation rules
 * 
 * Note: These generators produce INPUT data for Zod schemas (before parsing/defaults).
 * The Zod schemas may apply defaults and transformations during parsing.
 * 
 * @module __tests__/utils/generators/schema.generator
 * Requirements: 3.2.1
 */
import * as fc from 'fast-check'
import { Role, FunctionalRole, Category, FormStatus, ExternalStatus, QuestionType } from '@prisma/client'

// ============================================================================
// Common Schema Generators
// ============================================================================

/**
 * Generates valid names (2-100 characters, trimmed, no leading/trailing whitespace)
 */
export const schemaNameArb = fc
  .string({ minLength: 2, maxLength: 100 })
  .filter((s) => s.trim().length >= 2)
  .map((s) => s.trim())

/**
 * Generates valid email addresses (lowercase, trimmed)
 */
export const schemaEmailArb = fc.emailAddress().map((e) => e.toLowerCase().trim())

/**
 * Generates valid passwords (6+ characters)
 */
export const schemaPasswordArb = fc.string({ minLength: 6, maxLength: 100 })

/**
 * Generates valid CUID-like IDs (non-empty strings)
 */
export const schemaIdArb = fc.uuid()

// ============================================================================
// User Schema Generators
// ============================================================================

/**
 * Generates valid Role enum values
 */
export const schemaRoleArb = fc.constantFrom<Role>('ADMIN', 'CSA', 'USER')

/**
 * Generates valid FunctionalRole enum values
 */
export const schemaFunctionalRoleArb = fc.constantFrom<FunctionalRole>(
  'DOCENTE',
  'DISCENTE',
  'EGRESSO',
  'TECNICO_UNIDADES_ENSINO',
  'TECNICO_COMPLEXO_HOSPITALAR'
)

/**
 * Generates unique arrays of FunctionalRole values
 */
export const schemaFunctionalRolesArb = fc
  .array(schemaFunctionalRoleArb, { maxLength: 5 })
  .map((roles) => [...new Set(roles)])

/**
 * Generates input data for createUserSchema validation
 * Note: role and functionalRoles have defaults in the schema
 */
export const createUserDTOArb = fc.record({
  name: schemaNameArb,
  email: schemaEmailArb,
  password: schemaPasswordArb,
  role: fc.option(schemaRoleArb, { nil: undefined }),
  functionalRoles: fc.option(schemaFunctionalRolesArb, { nil: undefined }),
  extraData: fc.option(fc.constant({}), { nil: undefined }),
})

/**
 * Generates input data for updateUserSchema validation
 */
export const updateUserDTOArb = fc.record({
  name: fc.option(schemaNameArb, { nil: undefined }),
  email: fc.option(schemaEmailArb, { nil: undefined }),
  role: fc.option(schemaRoleArb, { nil: undefined }),
  functionalRoles: fc.option(schemaFunctionalRolesArb, { nil: undefined }),
  active: fc.option(fc.boolean(), { nil: undefined }),
  extraData: fc.option(fc.constant({}), { nil: undefined }),
})

/**
 * Generates input data for userFiltersSchema validation
 * Note: page and pageSize have defaults in the schema
 */
export const userFiltersDTOArb = fc.record({
  search: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  role: fc.option(schemaRoleArb, { nil: undefined }),
  functionalRole: fc.option(schemaFunctionalRoleArb, { nil: undefined }),
  active: fc.option(fc.boolean(), { nil: undefined }),
  page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
})

// ============================================================================
// Form Schema Generators
// ============================================================================

/**
 * Generates valid Category enum values
 */
export const schemaCategoryArb = fc.constantFrom<Category>(
  'DOCENTES',
  'DISCENTES',
  'EGRESSOS',
  'TECNICOS_UNIDADES',
  'TECNICOS_COMPLEXO'
)

/**
 * Generates valid FormStatus enum values
 */
export const schemaFormStatusArb = fc.constantFrom<FormStatus>('DRAFT', 'ACTIVE', 'CLOSED', 'FROZEN')

/**
 * Generates valid ExternalStatus enum values
 */
export const schemaExternalStatusArb = fc.constantFrom<ExternalStatus>('HIDDEN', 'AVAILABLE', 'FROZEN', 'SCHEDULED')

/**
 * Generates valid QuestionType enum values
 */
export const schemaQuestionTypeArb = fc.constantFrom<QuestionType>(
  'MULTIPLE_CHOICE',
  'CHECKBOX',
  'TEXT',
  'SCALE',
  'GRID',
  'DROPDOWN',
  'SECTION'
)

/**
 * Generates valid form titles (3-200 characters)
 */
export const schemaFormTitleArb = fc
  .string({ minLength: 3, maxLength: 200 })
  .filter((s) => s.trim().length >= 3)
  .map((s) => s.trim())

/**
 * Generates valid form descriptions (10-2000 characters)
 */
export const schemaFormDescriptionArb = fc
  .string({ minLength: 10, maxLength: 200 })
  .filter((s) => s.trim().length >= 10)
  .map((s) => s.trim())

/**
 * Generates valid question text (1-1000 characters)
 */
export const schemaQuestionTextArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length >= 1)
  .map((s) => s.trim())

/**
 * Generates conditional rule for questions
 */
export const schemaConditionalRuleArb = fc.record({
  dependsOn: schemaIdArb,
  operator: fc.constantFrom('AND', 'OR') as fc.Arbitrary<'AND' | 'OR'>,
  conditions: fc.array(
    fc.record({
      type: fc.constantFrom('equals', 'contains', 'not_equals', 'greater_than', 'less_than') as fc.Arbitrary<'equals' | 'contains' | 'not_equals' | 'greater_than' | 'less_than'>,
      value: fc.string({ minLength: 1, maxLength: 50 }),
    }),
    { minLength: 1, maxLength: 3 }
  ),
})

/**
 * Generates QuestionDataDTO that passes questionDataSchema validation
 * Ensures options/rows/columns are valid based on question type
 */
export const questionDataDTOArb = fc
  .record({
    customId: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
    text: schemaQuestionTextArb,
    type: schemaQuestionTypeArb,
    required: fc.boolean(),
    order: fc.integer({ min: 0, max: 1000 }),
    options: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 10 }),
    rows: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 10 }),
    columns: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 10 }),
    conditional: fc.option(schemaConditionalRuleArb, { nil: null }),
  })
  .map((q) => {
    // Ensure options are valid for types that require them
    const typesRequiringOptions: QuestionType[] = ['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN']
    if (typesRequiringOptions.includes(q.type) && q.options.length < 2) {
      return { ...q, options: ['Option A', 'Option B'] }
    }
    // Ensure rows/columns are valid for GRID type
    if (q.type === 'GRID') {
      return {
        ...q,
        rows: q.rows.length >= 1 ? q.rows : ['Row 1'],
        columns: q.columns.length >= 1 ? q.columns : ['Column 1'],
      }
    }
    return q
  })

/**
 * Generates CreateQuestionDTO that passes createQuestionSchema validation
 */
export const createQuestionDTOArb = fc
  .tuple(questionDataDTOArb, schemaIdArb)
  .map(([question, formId]) => ({
    ...question,
    formId,
  }))

/**
 * Generates input data for createFormSchema validation
 * Note: generatesCertificate defaults to false, visibleToRoles/visibleToUserIds default to []
 */
export const createFormDTOArb = fc.record({
  title: schemaFormTitleArb,
  description: schemaFormDescriptionArb,
  category: schemaCategoryArb,
  deadline: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), { nil: undefined }),
  estimatedTime: fc.option(fc.constantFrom('5 minutos', '10 minutos', '15 minutos', '30 minutos', '1 hora'), { nil: undefined }),
  generatesCertificate: fc.option(fc.boolean(), { nil: undefined }),
  certificateHours: fc.option(fc.constantFrom('1 hora', '2 horas', '4 horas', '8 horas'), { nil: undefined }),
  visibleToRoles: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }), { nil: undefined }),
  visibleToUserIds: fc.option(fc.array(schemaIdArb, { maxLength: 5 }), { nil: undefined }),
  createdById: schemaIdArb,
  questions: fc.option(fc.array(questionDataDTOArb, { maxLength: 5 }), { nil: undefined }),
})

/**
 * Generates input data for updateFormSchema validation
 */
export const updateFormDTOArb = fc.record({
  title: fc.option(schemaFormTitleArb, { nil: undefined }),
  description: fc.option(schemaFormDescriptionArb, { nil: undefined }),
  category: fc.option(schemaCategoryArb, { nil: undefined }),
  status: fc.option(schemaFormStatusArb, { nil: undefined }),
  externalStatus: fc.option(schemaExternalStatusArb, { nil: undefined }),
  deadline: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), { nil: undefined }),
  estimatedTime: fc.option(fc.constantFrom('5 minutos', '10 minutos', '15 minutos', '30 minutos', '1 hora'), { nil: undefined }),
  generatesCertificate: fc.option(fc.boolean(), { nil: undefined }),
  certificateHours: fc.option(fc.constantFrom('1 hora', '2 horas', '4 horas', '8 horas'), { nil: undefined }),
  visibleToRoles: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }), { nil: undefined }),
  visibleToUserIds: fc.option(fc.array(schemaIdArb, { maxLength: 5 }), { nil: undefined }),
  questions: fc.option(
    fc.array(
      questionDataDTOArb.map((q) => ({ ...q, id: undefined })),
      { maxLength: 5 }
    ),
    { nil: undefined }
  ),
})

/**
 * Generates input data for formFiltersSchema validation
 * Note: page and pageSize have defaults in the schema
 */
export const formFiltersDTOArb = fc.record({
  search: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  status: fc.option(schemaFormStatusArb, { nil: undefined }),
  externalStatus: fc.option(schemaExternalStatusArb, { nil: undefined }),
  category: fc.option(schemaCategoryArb, { nil: undefined }),
  generatesCertificate: fc.option(fc.boolean(), { nil: undefined }),
  createdById: fc.option(schemaIdArb, { nil: undefined }),
  dateFrom: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), { nil: undefined }),
  dateTo: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), { nil: undefined }),
  page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
})

// ============================================================================
// Response Schema Generators
// ============================================================================

/**
 * Generates ResponseItemDTO that passes responseItemSchema validation
 */
export const responseItemDTOArb = fc.record({
  formId: schemaIdArb,
  questionId: schemaIdArb,
  value: fc.string({ minLength: 0, maxLength: 500 }),
})

/**
 * Generates CreateResponsesDTO that passes createResponsesSchema validation
 */
export const createResponsesDTOArb = fc.record({
  responses: fc.array(responseItemDTOArb, { minLength: 1, maxLength: 20 }),
})

/**
 * Generates input data for responseFiltersSchema validation
 * Note: page and pageSize have defaults in the schema
 */
export const responseFiltersDTOArb = fc.record({
  formId: fc.option(schemaIdArb, { nil: undefined }),
  userId: fc.option(schemaIdArb, { nil: undefined }),
  questionId: fc.option(schemaIdArb, { nil: undefined }),
  campus: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }), { nil: undefined }),
  course: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }), { nil: undefined }),
  userRole: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }), { nil: undefined }),
  responseDate: fc.option(
    fc.record({
      from: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      to: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
    }),
    { nil: undefined }
  ),
  completionStatus: fc.option(fc.constantFrom('complete', 'partial', 'all') as fc.Arbitrary<'complete' | 'partial' | 'all'>, { nil: undefined }),
  searchTerm: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
})

// ============================================================================
// Certificate Schema Generators
// ============================================================================

/**
 * Generates CertificateMetadataDTO that passes certificateMetadataSchema validation
 */
export const certificateMetadataDTOArb = fc.record({
  completionDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map((d) => d.toISOString()),
  formTitle: fc.string({ minLength: 1, maxLength: 200 }),
  formDescription: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
  userName: fc.string({ minLength: 1, maxLength: 100 }),
  userEmail: schemaEmailArb,
  workload: fc.option(fc.constantFrom('1 hora', '2 horas', '4 horas', '8 horas'), { nil: undefined }),
})

/**
 * Generates CreateCertificateDTO that passes createCertificateSchema validation
 */
export const createCertificateDTOArb = fc.record({
  userId: schemaIdArb,
  formId: schemaIdArb,
  validationCode: fc.string({ minLength: 1, maxLength: 50 }),
  hash: fc.string({ minLength: 1, maxLength: 100 }),
  metadata: fc.option(certificateMetadataDTOArb, { nil: undefined }),
})

/**
 * Generates ValidateCertificateDTO that passes validateCertificateSchema validation
 */
export const validateCertificateDTOArb = fc.record({
  validationCode: fc.string({ minLength: 1, maxLength: 50 }).map((s) => s.toUpperCase().trim()),
  ipAddress: fc.option(fc.ipV4(), { nil: undefined }),
  userAgent: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
})

/**
 * Generates input data for certificateFiltersSchema validation
 * Note: page and pageSize have defaults in the schema
 */
export const certificateFiltersDTOArb = fc.record({
  userId: fc.option(schemaIdArb, { nil: undefined }),
  formId: fc.option(schemaIdArb, { nil: undefined }),
  page: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  pageSize: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
})

// ============================================================================
// Invalid Data Generators (for testing schema rejection)
// ============================================================================

/**
 * Generates invalid user data that should fail validation
 */
export const invalidCreateUserDTOArb = fc.oneof(
  // Name too short
  fc.record({
    name: fc.constant('A'),
    email: schemaEmailArb,
    password: schemaPasswordArb,
  }),
  // Invalid email
  fc.record({
    name: schemaNameArb,
    email: fc.constant('not-an-email'),
    password: schemaPasswordArb,
  }),
  // Password too short
  fc.record({
    name: schemaNameArb,
    email: schemaEmailArb,
    password: fc.constant('12345'),
  })
)

/**
 * Generates invalid form data that should fail validation
 */
export const invalidCreateFormDTOArb = fc.oneof(
  // Title too short
  fc.record({
    title: fc.constant('AB'),
    description: schemaFormDescriptionArb,
    category: schemaCategoryArb,
    createdById: schemaIdArb,
  }),
  // Description too short
  fc.record({
    title: schemaFormTitleArb,
    description: fc.constant('Too short'),
    category: schemaCategoryArb,
    createdById: schemaIdArb,
  })
)

/**
 * Generates invalid response data that should fail validation
 */
export const invalidCreateResponsesDTOArb = fc.oneof(
  // Empty responses array
  fc.record({
    responses: fc.constant([]),
  }),
  // Missing formId
  fc.record({
    responses: fc.array(
      fc.record({
        formId: fc.constant(''),
        questionId: schemaIdArb,
        value: fc.string(),
      }),
      { minLength: 1, maxLength: 3 }
    ),
  })
)

/**
 * Generates invalid certificate data that should fail validation
 */
export const invalidCreateCertificateDTOArb = fc.oneof(
  // Empty userId
  fc.record({
    userId: fc.constant(''),
    formId: schemaIdArb,
    validationCode: fc.string({ minLength: 1 }),
    hash: fc.string({ minLength: 1 }),
  }),
  // Empty validationCode
  fc.record({
    userId: schemaIdArb,
    formId: schemaIdArb,
    validationCode: fc.constant(''),
    hash: fc.string({ minLength: 1 }),
  })
)
