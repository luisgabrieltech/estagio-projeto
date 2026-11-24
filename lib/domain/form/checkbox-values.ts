export function decodeCheckboxValues(value: string, options: readonly string[] = []): string[] {
  if (!value.trim()) return []

  if (value.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(value)
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return parsed
      }
    } catch {
      // Respostas antigas podem conter o rótulo ou uma lista separada por vírgulas.
    }
  }

  if (options.includes(value)) return [value]
  return value.split(',').map(part => part.trim()).filter(Boolean)
}
