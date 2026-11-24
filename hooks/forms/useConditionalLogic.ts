import { useCallback, useMemo } from 'react'
import type { Question } from '@/types/entities/form'

/**
 * Conditional rule interface
 */
interface ConditionalRule {
  dependsOn: string
  operator: 'AND' | 'OR'
  conditions: Condition[]
}

/**
 * Condition interface
 */
interface Condition {
  type: 'equals' | 'contains'
  value: string
}

/**
 * Response values map (questionId -> response value)
 */
export type ResponseValues = Record<string, any>

/**
 * Options for useConditionalLogic hook
 */
export interface UseConditionalLogicOptions {
  /** All questions in the form */
  questions: Question[]
  /** Current response values */
  responses?: ResponseValues
}

/**
 * Return type for useConditionalLogic hook
 */
export interface UseConditionalLogicReturn {
  /** Check if a question should be shown based on conditional logic */
  shouldShowQuestion: (questionId: string) => boolean
  /** Get all questions that depend on a specific question */
  getDependentQuestions: (questionId: string) => Question[]
  /** Check if a question has dependencies */
  hasDependencies: (questionId: string) => boolean
  /** Get the question that a conditional question depends on */
  getDependsOnQuestion: (questionId: string) => Question | null
  /** Evaluate a conditional rule */
  evaluateRule: (rule: ConditionalRule) => boolean
  /** Get all visible questions (respecting conditional logic) */
  getVisibleQuestions: () => Question[]
}

/**
 * Custom hook for managing conditional logic in forms
 * 
 * This hook provides:
 * - Conditional question visibility evaluation
 * - Dependency tracking between questions
 * - Rule evaluation (AND/OR operators)
 * - Condition evaluation (equals, contains)
 * 
 * @param options - Configuration options
 * @returns Conditional logic functions
 * 
 * @example
 * ```tsx
 * function FormRenderer() {
 *   const [responses, setResponses] = useState({})
 *   const {
 *     shouldShowQuestion,
 *     getVisibleQuestions
 *   } = useConditionalLogic({
 *     questions: formQuestions,
 *     responses
 *   })
 * 
 *   const visibleQuestions = getVisibleQuestions()
 * 
 *   return (
 *     <div>
 *       {visibleQuestions.map(question => (
 *         <QuestionRenderer
 *           key={question.id}
 *           question={question}
 *           value={responses[question.id]}
 *           onChange={(value) => setResponses({ ...responses, [question.id]: value })}
 *         />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useConditionalLogic(options: UseConditionalLogicOptions): UseConditionalLogicReturn {
  const { questions, responses = {} } = options

  /**
   * Create a map of questions by ID for quick lookup
   */
  const questionsById = useMemo(() => {
    const map = new Map<string, Question>()
    questions.forEach(q => map.set(q.id, q))
    return map
  }, [questions])

  /**
   * Evaluate a single condition
   */
  const evaluateCondition = useCallback((
    condition: Condition,
    responseValue: any
  ): boolean => {
    if (responseValue === null || responseValue === undefined) {
      return false
    }

    const value = String(responseValue).toLowerCase()
    const conditionValue = String(condition.value).toLowerCase()

    switch (condition.type) {
      case 'equals':
        return value === conditionValue

      case 'contains':
        // For array responses (checkbox)
        if (Array.isArray(responseValue)) {
          return responseValue.some(v => 
            String(v).toLowerCase().includes(conditionValue)
          )
        }
        // For string responses
        return value.includes(conditionValue)

      default:
        return false
    }
  }, [])

  /**
   * Evaluate a conditional rule
   */
  const evaluateRule = useCallback((rule: ConditionalRule): boolean => {
    const responseValue = responses[rule.dependsOn]

    if (responseValue === null || responseValue === undefined || responseValue === '') {
      return false
    }

    // Evaluate all conditions
    const conditionResults = rule.conditions.map(condition =>
      evaluateCondition(condition, responseValue)
    )

    // Apply operator (AND/OR)
    if (rule.operator === 'AND') {
      return conditionResults.every(result => result)
    } else {
      // OR
      return conditionResults.some(result => result)
    }
  }, [responses, evaluateCondition])

  /**
   * Check if a question should be shown
   */
  const shouldShowQuestion = useCallback((questionId: string): boolean => {
    const question = questionsById.get(questionId)
    
    if (!question) {
      return false
    }

    if (!question.conditional) {
      return true
    }

    // Evaluate the conditional rule
    return evaluateRule(question.conditional)
  }, [questionsById, evaluateRule])

  /**
   * Get all questions that depend on a specific question
   */
  const getDependentQuestions = useCallback((questionId: string): Question[] => {
    return questions.filter(q => 
      q.conditional && q.conditional.dependsOn === questionId
    )
  }, [questions])

  /**
   * Check if a question has dependencies (other questions depend on it)
   */
  const hasDependencies = useCallback((questionId: string): boolean => {
    return questions.some(q => 
      q.conditional && q.conditional.dependsOn === questionId
    )
  }, [questions])

  /**
   * Get the question that a conditional question depends on
   */
  const getDependsOnQuestion = useCallback((questionId: string): Question | null => {
    const question = questionsById.get(questionId)
    
    if (!question || !question.conditional) {
      return null
    }

    return questionsById.get(question.conditional.dependsOn) || null
  }, [questionsById])

  /**
   * Get all visible questions (respecting conditional logic)
   */
  const getVisibleQuestions = useCallback((): Question[] => {
    return questions.filter(question => shouldShowQuestion(question.id))
  }, [questions, shouldShowQuestion])

  return {
    shouldShowQuestion,
    getDependentQuestions,
    hasDependencies,
    getDependsOnQuestion,
    evaluateRule,
    getVisibleQuestions
  }
}

/**
 * Helper function to check if a question has conditional logic
 */
export function hasConditionalLogic(question: Question): boolean {
  return !!question.conditional
}

/**
 * Helper function to get all questions that can be used as dependencies
 * (questions that come before the current question and have options)
 */
export function getAvailableDependencies(
  questions: Question[],
  currentQuestionIndex: number
): Question[] {
  return questions
    .slice(0, currentQuestionIndex)
    .filter(q => {
      // Only questions with options can be dependencies
      const hasOptions = ['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN', 'SCALE'].includes(q.type)
      return hasOptions
    })
}
