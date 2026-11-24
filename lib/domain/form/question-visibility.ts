import { decodeCheckboxValues } from './checkbox-values'

interface VisibilityQuestion {
  id: string
  customId?: string | null
  type: string
  options?: readonly string[]
  conditional?: unknown
}

export function resolveQuestion(
  reference: string,
  questions: readonly VisibilityQuestion[],
): VisibilityQuestion | undefined {
  return questions.find(question => question.customId === reference)
    ?? questions.find(question => question.id === reference)
}

function answerParts(question: VisibilityQuestion, answer: unknown): string[] {
  if (Array.isArray(answer)) {
    return answer.filter((part): part is string => typeof part === 'string')
  }
  if (typeof answer !== 'string' || !answer.trim()) return []

  if (question.type.toUpperCase() === 'CHECKBOX') {
    return decodeCheckboxValues(answer, question.options)
  }
  return [answer]
}

export function hasQuestionAnswer(question: VisibilityQuestion, value: string | undefined): boolean {
  return answerParts(question, value).some(part => part.trim())
}

function matchesCondition(parts: string[], condition: unknown): boolean {
  if (!condition || typeof condition !== 'object' || !('type' in condition)
    || !('value' in condition) || typeof condition.value !== 'string') return false

  const value = condition.value
  switch (condition.type) {
    case 'equals': return parts.includes(value)
    case 'not_equals': return !parts.includes(value)
    case 'contains': return parts.some(part => part.includes(value))
    case 'greater_than':
    case 'less_than': {
      if (parts.length !== 1 || !parts[0].trim() || !value.trim()) return false
      const actual = Number(parts[0])
      const expected = Number(value)
      if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false
      return condition.type === 'greater_than' ? actual > expected : actual < expected
    }
    default: return false
  }
}

export function getVisibleQuestionIds(
  questions: readonly VisibilityQuestion[],
  responses: Readonly<Record<string, unknown>>,
): ReadonlySet<string> {
  const visibility = new Map<string, boolean>()
  const visiting = new Set<string>()

  function isVisible(question: VisibilityQuestion): boolean {
    const cached = visibility.get(question.id)
    if (cached !== undefined) return cached
    if (visiting.has(question.id)) return false

    visiting.add(question.id)
    const visible = !question.conditional || evaluateRule(question.conditional)
    visiting.delete(question.id)
    visibility.set(question.id, visible)
    return visible
  }

  function evaluateRule(rule: unknown): boolean {
    if (!rule || typeof rule !== 'object' || !('dependsOn' in rule)
      || typeof rule.dependsOn !== 'string' || !('conditions' in rule)
      || !Array.isArray(rule.conditions) || rule.conditions.length === 0) return false

    const dependency = resolveQuestion(rule.dependsOn, questions)
    if (!dependency || !isVisible(dependency)) return false

    const parts = answerParts(dependency, responses[dependency.id])
    if (parts.length === 0) return false

    const matches = (condition: unknown) => matchesCondition(parts, condition)
    const operator = 'operator' in rule ? rule.operator : undefined
    if (operator === 'OR') return rule.conditions.some(matches)
    return (operator === undefined || operator === 'AND') && rule.conditions.every(matches)
  }

  return new Set(questions.filter(isVisible).map(question => question.id))
}
