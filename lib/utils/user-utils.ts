/**
 * User-related utility functions
 * Provides helpers for user role management and permissions
 */

import { 
  isAdminRole, 
  isValidFunctionalRole as isValidFunctionalRoleFromConfig,
  FUNCTIONAL_ROLES_OPTIONS,
  FUNCTIONAL_ROLES
} from "@/lib/config"
import { createLogger } from "@/lib/core"

const userUtilsLogger = createLogger({ module: 'user-utils' })

/**
 * Extrai as roles funcionais do extraData do usuário
 * @param extraData - Dados extras do usuário
 * @returns Array de roles funcionais
 * @example
 * getUserFunctionalRoles({ functionalRoles: ['DOCENTE'] }) // ['DOCENTE']
 */
export const getUserFunctionalRoles = (extraData: any): string[] => {
  return (extraData as any)?.functionalRoles || []
}

export function resolveUserFunctionalRoles(user: {
  functionalRoles?: readonly string[]
  extraData?: unknown
}): readonly string[] {
  const { extraData } = user
  const legacyRoles = extraData && typeof extraData === 'object' && 'functionalRoles' in extraData
    ? extraData.functionalRoles
    : undefined

  // A administração ainda grava a seleção no JSON. Um array vazio também é uma decisão.
  return Array.isArray(legacyRoles)
    ? legacyRoles.filter((role): role is string => typeof role === 'string')
    : user.functionalRoles ?? []
}

/**
 * Verifica se o usuário pode ver um formulário baseado nas roles funcionais
 * @param userFunctionalRoles - Roles funcionais do usuário
 * @param formVisibleToRoles - Roles que podem ver o formulário
 * @returns True se o usuário pode ver o formulário
 * @example
 * canUserViewForm(['DOCENTE'], ['DOCENTE', 'DISCENTE']) // true
 * canUserViewForm(['TECNICO'], ['DOCENTE']) // false
 * canUserViewForm(['DOCENTE'], []) // true (formulário público)
 */
export const canUserViewForm = (
  userFunctionalRoles: string[],
  formVisibleToRoles: string[]
): boolean => {
  // Se visibleToRoles estiver vazio, formulário é público
  if (!formVisibleToRoles || formVisibleToRoles.length === 0) {
    return true
  }
  
  // Verificar se usuário tem pelo menos uma role permitida
  return formVisibleToRoles.some(role => userFunctionalRoles.includes(role))
}

/**
 * Verifica se o usuário é admin ou CSA (acesso total)
 * @deprecated Use isAdminRole from @/lib/config instead
 * @param userRole - Role do usuário
 * @returns True se o usuário é admin ou CSA
 */
export const isAdminUser = (userRole: string): boolean => {
  return isAdminRole(userRole)
}

/**
 * Lista das roles funcionais disponíveis com labels
 * @deprecated Use FUNCTIONAL_ROLES_OPTIONS from @/lib/config instead
 */
export { FUNCTIONAL_ROLES_OPTIONS }

/**
 * Mapeia cargo selecionado para functional role
 * Usado no magic login para garantir consistência
 * @param cargo - Cargo selecionado pelo usuário
 * @returns Functional role correspondente
 * @example
 * mapCargoToFunctionalRole('DOCENTE') // 'DOCENTE'
 */
export const mapCargoToFunctionalRole = (cargo: string): string => {
  // Mapeamento direto - cargo já vem no formato correto do dropdown
  const validRoles = FUNCTIONAL_ROLES_OPTIONS.map(r => r.value)
  
  if (validRoles.includes(cargo)) {
    return cargo
  }
  
  // Fallback - se cargo não for reconhecido, retorna padrão
  userUtilsLogger.warn('Cargo não reconhecido, usando TECNICO_COMPLEXO_HOSPITALAR como padrão', { cargo })
  return FUNCTIONAL_ROLES.TECNICO_COMPLEXO_HOSPITALAR
}

/**
 * Valida se um cargo é válido
 * @deprecated Use isValidFunctionalRole from @/lib/config instead
 * @param cargo - Cargo a validar
 * @returns True se o cargo é válido
 */
export const isValidFunctionalRole = (cargo: string): boolean => {
  return isValidFunctionalRoleFromConfig(cargo)
}

/**
 * Obtém o label de exibição para uma functional role
 * @param role - Functional role
 * @returns Label de exibição ou a role original se não encontrada
 * @example
 * getFunctionalRoleLabel('DOCENTE') // 'Docente'
 */
export const getFunctionalRoleLabel = (role: string): string => {
  const option = FUNCTIONAL_ROLES_OPTIONS.find(opt => opt.value === role)
  return option?.label || role
}

/**
 * Verifica se o usuário tem pelo menos uma das roles especificadas
 * @param userRoles - Roles do usuário
 * @param requiredRoles - Roles requeridas (pelo menos uma)
 * @returns True se o usuário tem pelo menos uma das roles
 * @example
 * hasAnyRole(['DOCENTE'], ['DOCENTE', 'DISCENTE']) // true
 * hasAnyRole(['TECNICO'], ['DOCENTE', 'DISCENTE']) // false
 */
export const hasAnyRole = (
  userRoles: string[],
  requiredRoles: string[]
): boolean => {
  return requiredRoles.some(role => userRoles.includes(role))
}

/**
 * Verifica se o usuário tem todas as roles especificadas
 * @param userRoles - Roles do usuário
 * @param requiredRoles - Roles requeridas (todas)
 * @returns True se o usuário tem todas as roles
 * @example
 * hasAllRoles(['DOCENTE', 'GESTOR'], ['DOCENTE', 'GESTOR']) // true
 * hasAllRoles(['DOCENTE'], ['DOCENTE', 'GESTOR']) // false
 */
export const hasAllRoles = (
  userRoles: string[],
  requiredRoles: string[]
): boolean => {
  return requiredRoles.every(role => userRoles.includes(role))
}
