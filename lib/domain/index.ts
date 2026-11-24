export {
  DomainError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  handleDomainError,
} from './errors'

export {
  createUserSchema,
  updateUserSchema,
  userFiltersSchema,
  type CreateUserDTO,
  type UpdateUserDTO,
  type UserFiltersDTO,
  // Repository interface and types
  type IUserRepository,
  type UserEntity,
  type CreateUserData,
  // Service
  UserService,
} from './user'

export {
  conditionTypeSchema,
  conditionalOperatorSchema,
  conditionSchema,
  conditionalRuleSchema,
  createQuestionSchema,
  updateQuestionSchema,
  questionDataSchema,
  createQuestionSchemaWithValidation,
  validateQuestionOptions,
  type ConditionType,
  type ConditionalOperator,
  type Condition,
  type ConditionalRule,
  type CreateQuestionDTO,
  type UpdateQuestionDTO,
  type QuestionDataDTO,
  // Form schemas and types
  createFormSchema,
  updateFormSchema,
  formFiltersSchema,
  createFormSchemaWithValidation,
  type CreateFormDTO,
  type UpdateFormDTO,
  type FormFiltersDTO,
  // Repository interface and types
  type IFormRepository,
  type FormEntity,
  type FormWithQuestionResponses,
  type QuestionWithResponseCount,
  type CreateFormData,
  type UpdateFormData,
  type UpdateQuestionData,
  // Service
  FormService,
} from './form'

export {
  responseItemSchema,
  createResponsesSchema,
  responseFiltersSchema,
  type ResponseItemDTO,
  type CreateResponsesDTO,
  type ResponseFiltersDTO,
  // Repository interface and types
  type IResponseRepository,
  type ResponseEntity,
  type CreateResponseData,
  type UserFormResponses,
  // Service
  ResponseService,
} from './response'

export {
  certificateMetadataSchema,
  createCertificateSchema,
  validateCertificateSchema,
  certificateFiltersSchema,
  type CertificateMetadataDTO,
  type CreateCertificateDTO,
  type ValidateCertificateDTO,
  type CertificateFiltersDTO,
  // Repository interface and types
  type ICertificateRepository,
  type ValidationLogData,
  // Service and utilities
  CertificateService,
  CertificatePdfService,
  generateValidationCode,
  generateCertificateHash,
} from './certificate'
