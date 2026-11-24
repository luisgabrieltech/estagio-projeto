import { resolveUserFunctionalRoles } from './user-utils'

export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }
  
  return dateObj.toLocaleDateString('pt-BR', options)
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatShortDate(date: Date | string): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
}

export function formatCPF(cpf: string): string {
  if (!cpf) return ''
  
  const cleaned = cpf.replace(/\D/g, '')
  
  if (cleaned.length !== 11) {
    return cpf
  }
  
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatPhone(phone: string): string {
  if (!phone) return ''
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

export function formatCurrency(value: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
  
  return showSymbol ? formatted : formatted.replace('R$ ', '').trim()
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export function formatPercentage(
  value: number,
  asDecimal: boolean = true,
  decimals: number = 1
): string {
  const percentage = asDecimal ? value * 100 : value
  return `${formatNumber(percentage, decimals)}%`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${formatNumber(bytes / Math.pow(k, i), 2)} ${sizes[i]}`
}

export function truncateText(
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

export function formatName(name: string): string {
  if (!name) return ''
  
  const exceptions = ['de', 'da', 'do', 'das', 'dos', 'e']
  
  return name
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      
      if (exceptions.includes(word)) {
        return word
      }
      
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

interface UserExtraData {
  functionalRoles?: string[]
  [key: string]: unknown
}

function isUserExtraData(value: unknown): value is UserExtraData {
  return value !== null && typeof value === 'object'
}

export function extractFunctionalRoles(extraData: unknown): string[] {
  if (!isUserExtraData(extraData)) {
    return []
  }
  
  const roles = extraData.functionalRoles
  if (!Array.isArray(roles)) {
    return []
  }
  
  return roles.filter((role): role is string => typeof role === 'string')
}

export function transformUserWithFunctionalRoles<T extends { functionalRoles?: readonly string[]; extraData?: unknown }>(user: T): T & { functionalRoles: string[] } {
  return {
    ...user,
    functionalRoles: [...resolveUserFunctionalRoles(user)]
  }
}
