/**
 * NextAuth type extensions
 * 
 * This file extends the default NextAuth types to include custom user properties
 * specific to our application (role and functionalRoles).
 * 
 * These type declarations are automatically loaded by TypeScript and don't need
 * to be imported explicitly.
 * 
 * @see https://next-auth.js.org/getting-started/typescript
 */

import { Role, FunctionalRole } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Extended User interface with custom properties
   */
  interface User {
    /** System role (ADMIN, CSA, or USER) */
    role: Role
    /** Functional roles within the institution */
    functionalRoles?: FunctionalRole[]
  }

  /**
   * Extended Session interface with custom user properties
   */
  interface Session {
    user: User & {
      /** System role (ADMIN, CSA, or USER) */
      role: Role
      /** Functional roles within the institution */
      functionalRoles?: FunctionalRole[]
    }
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT interface with custom properties
   */
  interface JWT {
    /** System role (ADMIN, CSA, or USER) */
    role: Role
    /** Functional roles within the institution */
    functionalRoles?: FunctionalRole[]
  }
} 