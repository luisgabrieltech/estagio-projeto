import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/services/prisma"
import { compare } from "bcryptjs"
import { routes, config } from "@/lib/config"
import { createLogger } from "@/lib/core"

const authLogger = createLogger({ module: 'auth' })

export const authOptions: NextAuthOptions = {
  debug: config.isDev,
  secret: config.auth.secret,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        try {
          authLogger.info("Tentativa de login", { email: credentials?.email })
          
          if (!credentials?.email || !credentials.password) {
            throw new Error("Credenciais inválidas")
          }
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
          
          if (!user) {
            authLogger.info("Usuário não encontrado", { email: credentials.email })
            throw new Error("EMAIL_NAO_CADASTRADO")
          }
          const isPasswordValid = await compare(credentials.password, user.password)
          if (!isPasswordValid) {
            authLogger.info("Senha incorreta", { email: credentials.email })
            throw new Error("SENHA_INCORRETA")
          }
          
          if (user.active === false) {
            authLogger.info("Conta inativada", { email: credentials.email })
            throw new Error("CONTA_INATIVADA")
          }
          
          authLogger.info("Login bem-sucedido", { email: user.email })
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          authLogger.error("Erro no authorize", error instanceof Error ? error : undefined, { email: credentials?.email })
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          authLogger.debug("JWT callback", { email: user.email })
          return { ...token, id: user.id, role: user.role }
        }
        return token
      } catch (error) {
        authLogger.error("Erro no callback JWT", error instanceof Error ? error : undefined)
        return token
      }
    },
    async session({ session, token }) {
      try {
        authLogger.debug("Session callback", { tokenSub: token.sub })
        return {
          ...session,
          user: { ...session.user, id: token.id as string, role: token.role as string }
        }
      } catch (error) {
        authLogger.error("Erro no callback session", error instanceof Error ? error : undefined)
        return session
      }
    }
  },
  pages: {
    signIn: routes.auth.login,
    error: routes.auth.login
  },
  events: {
    async signIn(message) {
      authLogger.debug("Event signIn", { email: message.user?.email })
    },
    async signOut(message) {
      authLogger.debug("Event signOut", { tokenSub: message.token?.sub })
    },
    async session(message) {
      authLogger.debug("Event session", { email: message.session?.user?.email })
    }
  }
}
