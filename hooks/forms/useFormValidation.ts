import { useState, useCallback, useMemo } from 'react'
import type { Question } from '@/types/entities/form'
import type { FormBuilderData } from './useFormBuilder'

/**
 * Conditional rule interface (from Question type)
 */
interface ConditionalRule {
  dependsOn: string
  operator: 'AND' | 'OR'
  conditions: Array<{
    type: 'equals' | 'contains'
    value: string
  }>
}

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Options for useFormValidation hook
 */
export interface UseFormValidationOptions {
  /** Form data to validate */
  formData: FormBuilderData
  /** Custom validation rules */
  customRules?: ValidationRule[]
}

/**
 * Custom validation rule
 */
export interface ValidationRule {
  field: string
  validate: (value: any, formData: FormBuilderData) => string | null
}

/**
 * Return type for useFormValidation hook
 */
export interface UseFormValidationReturn {
  /** Validation errors by field */
  errors: Record<string, string>
  /** Whether form is valid */
  isValid: boolean
  /** Validate entire form */
  validate: () => boolean
  /** Validate a single field */
  validateField: (field: string) => boolean
  /** Clear all errors */
  clearErrors: () => void
  /** Clear error for specific field */
  clearFieldError: (field: string) => void
  /** Set custom error */
  setError: (field: string, message: string) => void
}

/**
 * Custom hook for form validation
 * 
 * This hook provides:
 * - Required field validation
 * - Conditional question validation
 * - Custom validation rules
 * - Field-level and form-level validation
 * - Error management
 * 
 * @param options - Configuration options
 * @returns Validation state and functions
 * 
 * @example
 * ```tsx
 * function FormBuilder() {
 *   const [formData, setFormData] = useState(...)
 *   const {
 *     errors,
 *     isValid,
 *     validate,
 *     validateField
 *   } = useFormValidation({ formData })
 * 
 *   const handleSubmit = () => {
 *     if (validate()) {
 *       saveForm()
 *     }
 *   }
 * 
 *   return (
 *     <div>
 *       <input
 *         value={formData.title}
 *         onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 *         onBlur={() => validateField('title')}
 *       />
 *       {errors.title && <span>{errors.title}</span>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFormValidation(options: UseFormValidationOptions): UseFormValidationReturn {
  const { formData, customRules = [] } = options

  const [errors, setErrors] = useState<Record<string, string>>({})

  /**
   * Validate required fields
   */
  const validateRequiredFields = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = []

    // Title is required
    if (!formData.title || !formData.title.trim()) {
      errors.push({
        field: 'title',
        message: 'Título é obrigatório'
      })
    }

    // Description is required
    if (!formData.description || !formData.description.trim()) {
      errors.push({
        field: 'description',
        message: 'Descrição é obrigatória'
      })
    }

    // Category is required
    if (!formData.category) {
      errors.push({
        field: 'category',
        message: 'Categoria é obrigatória'
      })
    }

    // If generates certificate, hours are required
    if (formData.generatesCertificate && !formData.certificateHours) {
      errors.push({
        field: 'certificateHours',
        message: 'Horas do certificado são obrigatórias quando certificado está habilitado'
      })
    }

    // At least one question is required
    if (!formData.questions || formData.questions.length === 0) {
      errors.push({
        field: 'questions',
        message: 'Pelo menos uma questão é obrigatória'
      })
    }

    return errors
  }, [formData])

  /**
   * Validate questions
   */
  const validateQuestions = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = []

    formData.questions.forEach((question, index) => {
      // Question text is required
      if (!question.text || !question.text.trim()) {
        errors.push({
          field: `questions.${index}.text`,
          message: `Questão ${index + 1}: Texto é obrigatório`
        })
      }

      // Question type is required
      if (!question.type) {
        errors.push({
          field: `questions.${index}.type`,
          message: `Questão ${index + 1}: Tipo é obrigatório`
        })
      }

      // Validate options for choice-based questions
      const choiceTypes = ['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN']
      if (choiceTypes.includes(question.type)) {
        if (!question.options || question.options.length === 0) {
          errors.push({
            field: `questions.${index}.options`,
            message: `Questão ${index + 1}: Pelo menos uma opção é obrigatória`
          })
        }
      }

      // Validate grid questions
      if (question.type === 'GRID') {
        if (!question.rows || question.rows.length === 0) {
          errors.push({
            field: `questions.${index}.rows`,
            message: `Questão ${index + 1}: Pelo menos uma linha é obrigatória`
          })
        }
        if (!question.columns || question.columns.length === 0) {
          errors.push({
            field: `questions.${index}.columns`,
            message: `Questão ${index + 1}: Pelo menos uma coluna é obrigatória`
          })
        }
      }

      // Validate conditional logic
      if (question.conditional) {
        const conditionalErrors = validateConditionalRule(question.conditional, formData.questions, index)
        errors.push(...conditionalErrors)
      }
    })

    return errors
  }, [formData.questions])

  /**
   * Validate conditional rule
   */
  const validateConditionalRule = (
    rule: ConditionalRule,
    questions: Question[],
    currentIndex: number
  ): ValidationError[] => {
    const errors: ValidationError[] = []

    // Check if dependent question exists
    const dependentQuestion = questions.find(q => q.id === rule.dependsOn)
    if (!dependentQuestion) {
      errors.push({
        field: `questions.${currentIndex}.conditional`,
        message: `Questão ${currentIndex + 1}: Questão dependente não encontrada`
      })
      return errors
    }

    // Check if dependent question comes before current question
    const dependentIndex = questions.findIndex(q => q.id === rule.dependsOn)
    if (dependentIndex >= currentIndex) {
      errors.push({
        field: `questions.${currentIndex}.conditional`,
        message: `Questão ${currentIndex + 1}: Questão dependente deve vir antes desta questão`
      })
    }

    // Validate conditions
    if (!rule.conditions || rule.conditions.length === 0) {
      errors.push({
        field: `questions.${currentIndex}.conditional`,
        message: `Questão ${currentIndex + 1}: Pelo menos uma condição é obrigatória`
      })
    }

    return errors
  }

  /**
   * Apply custom validation rules
   */
  const applyCustomRules = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = []

    customRules.forEach(rule => {
      const fieldValue = getFieldValue(formData, rule.field)
      const errorMessage = rule.validate(fieldValue, formData)
      
      if (errorMessage) {
        errors.push({
          field: rule.field,
          message: errorMessage
        })
      }
    })

    return errors
  }, [formData, customRules])

  /**
   * Get field value from form data
   */
  const getFieldValue = (data: FormBuilderData, field: string): any => {
    const parts = field.split('.')
    let value: any = data
    
    for (const part of parts) {
      if (value === null || value === undefined) return undefined
      value = value[part]
    }
    
    return value
  }

  /**
   * Validate entire form
   */
  const validate = useCallback((): boolean => {
    const allErrors: ValidationError[] = [
      ...validateRequiredFields(),
      ...validateQuestions(),
      ...applyCustomRules()
    ]

    // Convert to error map
    const errorMap: Record<string, string> = {}
    allErrors.forEach(error => {
      errorMap[error.field] = error.message
    })

    setErrors(errorMap)
    return allErrors.length === 0
  }, [validateRequiredFields, validateQuestions, applyCustomRules])

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: string): boolean => {
    // Clear existing error for this field
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })

    // Run validation for this field
    const allErrors: ValidationError[] = [
      ...validateRequiredFields(),
      ...validateQuestions(),
      ...applyCustomRules()
    ]

    // Find errors for this field
    const fieldErrors = allErrors.filter(e => e.field === field)
    
    if (fieldErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors[0].message
      }))
      return false
    }

    return true
  }, [validateRequiredFields, validateQuestions, applyCustomRules])

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  /**
   * Clear error for specific field
   */
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  /**
   * Set custom error
   */
  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }))
  }, [])

  /**
   * Check if form is valid (computed)
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setError
  }
}
