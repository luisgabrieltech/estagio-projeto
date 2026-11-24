type ZodError = { path: (string | number)[]; message: string }

export function formatZodErrors(
  errors: ZodError[]
): Record<string, string[]> {
  return errors.reduce((acc, err) => {
    const path = err.path.join('.') || 'root'
    acc[path] = acc[path] || []
    acc[path].push(err.message)
    return acc
  }, {} as Record<string, string[]>)
}
