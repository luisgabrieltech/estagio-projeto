/**
 * MSW Server Setup
 * 
 * Configures the Mock Service Worker server for Node.js tests
 * 
 * @module __tests__/utils/mocks/server
 * Requirements: 3.2, 5.1, 5.4
 */
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW server instance configured with default handlers
 * 
 * Usage in tests:
 * - server.listen() - Start intercepting requests
 * - server.resetHandlers() - Reset to default handlers
 * - server.use(...handlers) - Add runtime handlers
 * - server.close() - Stop intercepting requests
 * 
 * @example
 * ```typescript
 * import { server } from '@/__tests__/utils/mocks/server'
 * 
 * beforeAll(() => server.listen())
 * afterEach(() => server.resetHandlers())
 * afterAll(() => server.close())
 * ```
 */
export const server = setupServer(...handlers)
