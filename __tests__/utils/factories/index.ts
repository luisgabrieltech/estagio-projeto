/**
 * Factories Barrel Export
 * 
 * Re-exports all factory functions for convenient importing
 * 
 * @module __tests__/utils/factories
 * Requirements: 3.3
 */

// User factories
export {
  createUser,
  createAdmin,
  createCSA,
  createUsers,
  createUserCreateData,
  createUserWithCounts,
  resetUserFactory,
} from './user.factory'

// Form factories
export {
  createForm,
  createPublishedForm,
  createForms,
  createQuestion,
  createMultipleChoiceQuestion,
  createScaleQuestion,
  createFormCreateData,
  createFormWithStats,
  resetFormFactory,
} from './form.factory'

// Response factories
export {
  createResponse,
  createResponses,
  createResponseWithDetails,
  createDetailedResponse,
  createQuestionStats,
  createFormMetrics,
  resetResponseFactory,
} from './response.factory'

// Certificate factories
export {
  createCertificate,
  createCertificates,
  createCertificateWithDetails,
  createCertificateMetadata,
  createValidCertificateValidation,
  createInvalidCertificateValidation,
  resetCertificateFactory,
} from './certificate.factory'

/**
 * Resets all factory counters
 * Call this in beforeEach to ensure test isolation
 */
export function resetAllFactories(): void {
  // Import and call reset functions
  const { resetUserFactory } = require('./user.factory')
  const { resetFormFactory } = require('./form.factory')
  const { resetResponseFactory } = require('./response.factory')
  const { resetCertificateFactory } = require('./certificate.factory')
  
  resetUserFactory()
  resetFormFactory()
  resetResponseFactory()
  resetCertificateFactory()
}
