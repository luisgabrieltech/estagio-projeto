/**
 * Infrastructure Repositories Barrel Export
 *
 * This module exports all Prisma repository implementations
 * that implement the domain repository interfaces.
 */

// User Repository
export {
  PrismaUserRepository,
  prismaUserRepository,
} from './prisma-user.repository'

// Form Repository
export {
  PrismaFormRepository,
  prismaFormRepository,
} from './prisma-form.repository'

// Response Repository
export {
  PrismaResponseRepository,
  prismaResponseRepository,
} from './prisma-response.repository'

// Certificate Repository
export {
  PrismaCertificateRepository,
  prismaCertificateRepository,
} from './prisma-certificate.repository'
