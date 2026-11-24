import { isAdminRole } from '@/lib/config/constants'
import { resolveUserFunctionalRoles } from '@/lib/utils/user-utils'

export interface EvaluationUser {
  id: string
  role: string
  active: boolean
  functionalRoles: readonly string[]
  extraData?: unknown
}

export function canAccessEvaluation(
  user: EvaluationUser,
  form: { visibleToRoles: readonly string[]; visibleToUserIds: readonly string[] },
): boolean {
  if (!user.active) return false
  if (isAdminRole(user.role)) return true

  const { visibleToRoles, visibleToUserIds } = form
  if (visibleToRoles.length === 0 && visibleToUserIds.length === 0) return true

  const roles = resolveUserFunctionalRoles(user)
  return visibleToUserIds.includes(user.id) || visibleToRoles.some(role => roles.includes(role))
}
