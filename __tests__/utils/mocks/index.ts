/**
 * Mocks Barrel Export
 * 
 * Re-exports MSW server and handlers for convenient importing
 * 
 * @module __tests__/utils/mocks
 * Requirements: 3.2, 5.1, 5.2, 5.3
 */

// Server
export { server } from './server'

// Handlers
export {
  handlers,
  userHandlers,
  formHandlers,
  responseHandlers,
  certificateHandlers,
  createErrorHandler,
  createNotFoundHandler,
  createUnauthorizedHandler,
  createForbiddenHandler,
} from './handlers'
