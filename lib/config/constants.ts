/**
 * Configurações e constantes centralizadas do sistema
 * 
 * Este arquivo contém todas as constantes compartilhadas do sistema,
 * incluindo roles, paginação, e outras configurações.
 */

// ============================================================================
// ROLES DO SISTEMA
// ============================================================================

/**
 * Roles de sistema (permissões administrativas)
 */
export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN',
  CSA: 'CSA',
  USER: 'USER',
} as const

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES]

/**
 * Roles administrativas (ADMIN e CSA)
 */
export const ADMIN_ROLES = [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.CSA] as const

/**
 * Lista de todas as roles de sistema
 */
export const SYSTEM_ROLES_LIST = Object.values(SYSTEM_ROLES)

// ============================================================================
// ROLES FUNCIONAIS
// ============================================================================

/**
 * Roles funcionais disponíveis no sistema
 */
export const FUNCTIONAL_ROLES = {
  DOCENTE: 'DOCENTE',
  DISCENTE: 'DISCENTE',
  EGRESSO: 'EGRESSO',
  TECNICO_UNIDADES_ENSINO: 'TECNICO_UNIDADES_ENSINO',
  TECNICO_COMPLEXO_HOSPITALAR: 'TECNICO_COMPLEXO_HOSPITALAR',
} as const

export type FunctionalRole = typeof FUNCTIONAL_ROLES[keyof typeof FUNCTIONAL_ROLES]

/**
 * Labels para exibição das roles funcionais
 */
export const FUNCTIONAL_ROLES_LABELS: Record<FunctionalRole, string> = {
  [FUNCTIONAL_ROLES.DOCENTE]: 'Docente',
  [FUNCTIONAL_ROLES.DISCENTE]: 'Discente',
  [FUNCTIONAL_ROLES.EGRESSO]: 'Egresso',
  [FUNCTIONAL_ROLES.TECNICO_UNIDADES_ENSINO]: 'Técnico Unidades Ensino',
  [FUNCTIONAL_ROLES.TECNICO_COMPLEXO_HOSPITALAR]: 'Técnico Complexo Hospitalar',
}

/**
 * Opções de roles funcionais para uso em selects/dropdowns
 */
export const FUNCTIONAL_ROLES_OPTIONS = Object.entries(FUNCTIONAL_ROLES_LABELS).map(
  ([value, label]) => ({ value, label })
)

// ============================================================================
// PAGINAÇÃO
// ============================================================================

/**
 * Configurações de paginação
 */
export const PAGINATION = {
  /** Tamanho padrão de página para listagens */
  DEFAULT_PAGE_SIZE: 50,
  
  /** Tamanho máximo permitido de página */
  MAX_PAGE_SIZE: 100,
  
  /** Tamanho de página para listagens de usuários */
  USERS_PAGE_SIZE: 20,
  
  /** Tamanho de página para listagens de formulários */
  FORMS_PAGE_SIZE: 50,
  
  /** Tamanho de página para listagens de respostas */
  RESPONSES_PAGE_SIZE: 50,
} as const

// ============================================================================
// STATUS DE FORMULÁRIOS
// ============================================================================

/**
 * Status interno de formulários
 */
export const FORM_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  FROZEN: 'FROZEN',
} as const

export type FormStatus = typeof FORM_STATUS[keyof typeof FORM_STATUS]

/**
 * Status externo de formulários (visibilidade para usuários)
 */
export const FORM_EXTERNAL_STATUS = {
  HIDDEN: 'HIDDEN',
  AVAILABLE: 'AVAILABLE',
  SCHEDULED: 'SCHEDULED',
  FROZEN: 'FROZEN',
} as const

export type FormExternalStatus = typeof FORM_EXTERNAL_STATUS[keyof typeof FORM_EXTERNAL_STATUS]

/**
 * Labels para status interno de formulários
 */
export const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  [FORM_STATUS.DRAFT]: 'Rascunho',
  [FORM_STATUS.ACTIVE]: 'Ativo',
  [FORM_STATUS.CLOSED]: 'Encerrado',
  [FORM_STATUS.FROZEN]: 'Congelado',
}

/**
 * Labels para status externo de formulários
 */
export const FORM_EXTERNAL_STATUS_LABELS: Record<FormExternalStatus, string> = {
  [FORM_EXTERNAL_STATUS.HIDDEN]: 'Oculto',
  [FORM_EXTERNAL_STATUS.AVAILABLE]: 'Disponível',
  [FORM_EXTERNAL_STATUS.SCHEDULED]: 'Agendado',
  [FORM_EXTERNAL_STATUS.FROZEN]: 'Congelado',
}

// ============================================================================
// CATEGORIAS DE FORMULÁRIOS
// ============================================================================

/**
 * Categorias de formulários
 */
export const FORM_CATEGORY = {
  AVALIACAO: 'AVALIACAO',
  VOTACAO: 'VOTACAO',
} as const

export type FormCategory = typeof FORM_CATEGORY[keyof typeof FORM_CATEGORY]

/**
 * Labels para categorias de formulários
 */
export const FORM_CATEGORY_LABELS: Record<FormCategory, string> = {
  [FORM_CATEGORY.AVALIACAO]: 'Avaliação',
  [FORM_CATEGORY.VOTACAO]: 'Votação',
}

// ============================================================================
// VALIDAÇÃO
// ============================================================================

/**
 * Limites de validação
 */
export const VALIDATION = {
  /** Tamanho mínimo de senha */
  MIN_PASSWORD_LENGTH: 6,
  
  /** Tamanho máximo de senha */
  MAX_PASSWORD_LENGTH: 100,
  
  /** Tamanho máximo de nome */
  MAX_NAME_LENGTH: 255,
  
  /** Tamanho máximo de email */
  MAX_EMAIL_LENGTH: 255,
  
  /** Tamanho máximo de título de formulário */
  MAX_FORM_TITLE_LENGTH: 255,
  
  /** Tamanho máximo de descrição de formulário */
  MAX_FORM_DESCRIPTION_LENGTH: 1000,
} as const

// ============================================================================
// CACHE
// ============================================================================

/**
 * Tempos de vida (TTL) para cache em milissegundos
 */
export const CACHE_TTL = {
  /** 1 minuto */
  ONE_MINUTE: 60 * 1000,
  
  /** 2 minutos */
  TWO_MINUTES: 2 * 60 * 1000,
  
  /** 3 minutos */
  THREE_MINUTES: 3 * 60 * 1000,
  
  /** 5 minutos */
  FIVE_MINUTES: 5 * 60 * 1000,
  
  /** 10 minutos */
  TEN_MINUTES: 10 * 60 * 1000,
  
  /** 30 minutos */
  THIRTY_MINUTES: 30 * 60 * 1000,
  
  /** 1 hora */
  ONE_HOUR: 60 * 60 * 1000,
} as const

// ============================================================================
// DEBOUNCE
// ============================================================================

/**
 * Tempos de debounce em milissegundos
 */
export const DEBOUNCE = {
  /** Debounce padrão para busca */
  SEARCH: 500,
  
  /** Debounce para inputs rápidos */
  FAST: 300,
  
  /** Debounce para inputs lentos */
  SLOW: 1000,
} as const

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verifica se uma role é administrativa (ADMIN ou CSA)
 */
export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as any)
}

/**
 * Verifica se uma role funcional é válida
 */
export function isValidFunctionalRole(role: string): boolean {
  return Object.values(FUNCTIONAL_ROLES).includes(role as any)
}

/**
 * Verifica se uma role de sistema é válida
 */
export function isValidSystemRole(role: string): boolean {
  return SYSTEM_ROLES_LIST.includes(role as any)
}
