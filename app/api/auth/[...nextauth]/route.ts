import NextAuth from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"

// Re-export for use in API routes (server-side only)
export { authOptions }

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 