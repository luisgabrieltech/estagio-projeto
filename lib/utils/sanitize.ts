/**
 * Sanitization utilities for user input
 * 
 * Provides functions to sanitize user input and prevent XSS attacks.
 * 
 * @module lib/utils/sanitize
 */

/**
 * HTML entities map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
}

/**
 * Escapes HTML special characters to prevent XSS
 * 
 * @param input - String to sanitize
 * @returns Sanitized string with HTML entities escaped
 * 
 * @example
 * ```ts
 * sanitizeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 * ```
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Sanitizes text input by trimming and removing control characters
 * 
 * @param input - String to sanitize
 * @param maxLength - Optional maximum length
 * @returns Sanitized string
 * 
 * @example
 * ```ts
 * sanitizeTextInput('  Hello World  ', 50)
 * // Returns: 'Hello World'
 * ```
 */
export function sanitizeTextInput(input: string, maxLength?: number): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove control characters except newlines and tabs
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  // Apply max length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }
  
  return sanitized
}

/**
 * Sanitizes a URL to prevent javascript: and data: protocols
 * 
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 * 
 * @example
 * ```ts
 * sanitizeUrl('javascript:alert(1)')
 * // Returns: ''
 * 
 * sanitizeUrl('https://example.com')
 * // Returns: 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return ''
  }
  
  const trimmed = url.trim().toLowerCase()
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:']
  if (dangerousProtocols.some(protocol => trimmed.startsWith(protocol))) {
    return ''
  }
  
  return url.trim()
}

/**
 * Sanitizes an object by applying sanitization to all string values
 * 
 * @param obj - Object to sanitize
 * @returns New object with sanitized string values
 * 
 * @example
 * ```ts
 * sanitizeObject({ name: '<script>xss</script>', age: 25 })
 * // Returns: { name: '&lt;script&gt;xss&lt;/script&gt;', age: 25 }
 * ```
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj }
  
  for (const key in result) {
    if (typeof result[key] === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeHtml(result[key] as string)
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        result[key] as Record<string, unknown>
      )
    }
  }
  
  return result
}
