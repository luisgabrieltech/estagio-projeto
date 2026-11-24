/**
 * Generators Barrel Export
 * 
 * Re-exports all fast-check generators for convenient importing
 * 
 * @module __tests__/utils/generators
 * Requirements: 3.2.1, 4.2, 4.3
 */

// Common generators
export {
  emailArb,
  nameArb,
  passwordArb,
  cuidArb,
  dateArb,
  pastDateArb,
  futureDateArb,
  nonEmptyStringArb,
  optionalStringArb,
  positiveIntArb,
  nonNegativeIntArb,
  percentageArb,
  paginationArb,
  booleanArb,
  stringArrayArb,
  nonEmptyStringArrayArb,
} from './common.generator'

// User generators
export {
  roleArb,
  functionalRoleArb,
  functionalRolesArb,
  uniqueFunctionalRolesArb,
  userCreateDataArb,
  userArb,
  userWithConsistentDatesArb,
  userFiltersArb,
  adminUserArb,
  activeUserArb,
  inactiveUserArb,
} from './user.generator'

// Form generators
export {
  categoryArb,
  formStatusArb,
  externalStatusArb,
  questionTypeArb,
  estimatedTimeArb,
  certificateHoursArb,
  questionArb,
  multipleChoiceQuestionArb,
  scaleQuestionArb,
  gridQuestionArb,
  formArb,
  publishedFormArb,
  draftFormArb,
  formCreateDataArb,
  formFiltersArb,
} from './form.generator'

// Schema generators (for Zod schema validation testing)
export {
  // Common schema generators
  schemaNameArb,
  schemaEmailArb,
  schemaPasswordArb,
  schemaIdArb,
  // User schema generators
  schemaRoleArb,
  schemaFunctionalRoleArb,
  schemaFunctionalRolesArb,
  createUserDTOArb,
  updateUserDTOArb,
  userFiltersDTOArb,
  // Form schema generators
  schemaCategoryArb,
  schemaFormStatusArb,
  schemaExternalStatusArb,
  schemaQuestionTypeArb,
  schemaFormTitleArb,
  schemaFormDescriptionArb,
  schemaQuestionTextArb,
  schemaConditionalRuleArb,
  questionDataDTOArb,
  createQuestionDTOArb,
  createFormDTOArb,
  updateFormDTOArb,
  formFiltersDTOArb,
  // Response schema generators
  responseItemDTOArb,
  createResponsesDTOArb,
  responseFiltersDTOArb,
  // Certificate schema generators
  certificateMetadataDTOArb,
  createCertificateDTOArb,
  validateCertificateDTOArb,
  certificateFiltersDTOArb,
  // Invalid data generators (for testing schema rejection)
  invalidCreateUserDTOArb,
  invalidCreateFormDTOArb,
  invalidCreateResponsesDTOArb,
  invalidCreateCertificateDTOArb,
} from './schema.generator'
