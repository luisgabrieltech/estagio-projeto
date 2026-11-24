import 'server-only'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/services/prisma'
import { authOptions } from '@/lib/auth/auth-options'
import { ForbiddenError } from '@/lib/domain/errors'
import { ADMIN_ROLES, SYSTEM_ROLES } from '@/lib/config'
import type { Session } from 'next-auth'

export interface AuthSession extends Session {
  user: Session['user'] & {
    id: string
    role: string
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }
  return session as AuthSession
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession()
  if (!session) {
    throw new ForbiddenError('Autenticação necessária')
  }
  return session
}

export async function requireActiveUser() {
  const session = await requireAuth()
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, active: true, functionalRoles: true, extraData: true },
  })

  if (!user?.active) {
    throw new ForbiddenError('Conta indisponível')
  }

  return user
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth()
  if (session.user.role !== SYSTEM_ROLES.ADMIN) {
    throw new ForbiddenError('Acesso restrito a administradores')
  }
  return session
}

export async function requireAdminOrCSA(): Promise<AuthSession> {
  const session = await requireAuth()
  if (!ADMIN_ROLES.includes(session.user.role as typeof ADMIN_ROLES[number])) {
    throw new ForbiddenError('Acesso restrito a administradores e CSA')
  }
  return session
}
