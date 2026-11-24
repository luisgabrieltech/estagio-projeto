process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_SECRET = 'test-secret-key-that-is-at-least-32-characters-long'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

import { beforeAll, afterAll, afterEach } from 'vitest'
import { server } from './utils/mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
