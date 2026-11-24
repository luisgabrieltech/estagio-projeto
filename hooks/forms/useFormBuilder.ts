import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/utils/api-utils'
import { useCreateForm, useUpdateForm } from './useFormMutations'
import type { Question } from '@/types/entities/form'

/**
 * Form data for builder
 */
export interface FormBuilderData {
  id?: string
  title: string
  description: string
  category: string
  status: string
  deadline: Date | null
  estimatedTime: string | null
  generatesCertificate: boolean
  certificateHours: string | null
  questions: Question[]
}

/**
 * Options for useFormBuilder hook
 */
export interface UseFormBuilderOptions {
  /** Initial form data (for editing) */
  initialData?: Partial<FormBuilderData>
  /** Form ID for editing */
  formId?: string
  /** Callback when form is saved successfully */
  onSave?: (form: any) => void
  /** Callback when save fails */
  onError?: (error: Error) => void
}

/**
 * Return type for useFormBuilder hook
 */
export interface UseFormBuilderReturn {
  /** Current form data */
  formData: FormBuilderData
  /** Currently selected/editing question */
  currentQuestion: Question | null
  /** ID of question being edited */
  editingQuestionId: string | null
  /** Loading state */
  loading: boolean
  /** Saving state */
  saving: boolean
  /** Error state */
  error: Error | null
  /** Whether form has unsaved changes */
  isDirty: boolean
  /** Actions for managing form builder */
  actions: {
    /** Update form metadata */
    updateFormData: (data: Partial<FormBuilderData>) => void
    /** Add a new question */
    addQuestion: (question: Question) => void
    /** Start editing a question */
    editQuestion: (questionId: string) => void
    /** Update a question */
    updateQuestion: (questionId: string, updates: Partial<Question>) => void
    /** Delete a question */
    deleteQuestion: (questionId: string) => void
    /** Move question up in order */
    moveQuestionUp: (questionId: string) => void
    /** Move question down in order */
    moveQuestionDown: (questionId: string) => void
    /** Clear current question selection */
    clearCurrentQuestion: () => void
    /** Save form */
    saveForm: () => Promise<any | null>
    /** Reset form to initial state */
    reset: () => void
  }
}

/**
 * Default form data
 */
const defaultFormData: FormBuilderData = {
  title: '',
  description: '',
  category: '',
  status: 'DRAFT',
  deadline: null,
  estimatedTime: null,
  generatesCertificate: false,
  certificateHours: null,
  questions: []
}

/**
 * Custom hook for managing form builder state and actions
 * 
 * This hook provides:
 * - Form data management
 * - Question CRUD operations
 * - Question reordering
 * - Form saving with validation
 * - Dirty state tracking
 * 
 * @param options - Configuration options
 * @returns Form builder state and actions
 * 
 * @example
 * ```tsx
 * function FormBuilder({ formId }: { formId?: string }) {
 *   const {
 *     formData,
 *     currentQuestion,
 *     saving,
 *     actions
 *   } = useFormBuilder({
 *     formId,
 *     onSave: (form) => router.push(`/forms/${form.id}`)
 *   })
 * 
 *   return (
 *     <div>
 *       <input
 *         value={formData.title}
 *         onChange={(e) => actions.updateFormData({ title: e.target.value })}
 *       />
 *       <button onClick={actions.saveForm} disabled={saving}>
 *         Save
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useFormBuilder(options: UseFormBuilderOptions = {}): UseFormBuilderReturn {
  const { initialData, formId, onSave, onError } = options
  const router = useRouter()

  // Use mutation hooks
  const createFormMutation = useCreateForm()
  const updateFormMutation = useUpdateForm()

  const [formData, setFormData] = useState<FormBuilderData>({
    ...defaultFormData,
    ...initialData
  })
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [initialFormData] = useState<FormBuilderData>({
    ...defaultFormData,
    ...initialData
  })

  // Derive saving state from mutations
  const saving = createFormMutation.isPending || updateFormMutation.isPending

  /**
   * Load form data if formId is provided
   */
  useEffect(() => {
    if (formId) {
      loadFormData(formId)
    }
  }, [formId])

  /**
   * Load form data from API
   */
  const loadFormData = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const form = await apiRequest<any>(`/forms?id=${id}`)

      setFormData({
        id: form.id,
        title: form.title,
        description: form.description,
        category: form.category,
        status: form.status,
        deadline: form.deadline ? new Date(form.deadline) : null,
        estimatedTime: form.estimatedTime || null,
        generatesCertificate: form.generatesCertificate,
        certificateHours: form.certificateHours || null,
        questions: form.questions || []
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load form')
      setError(error)
      toast.error('Erro ao carregar formulário', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update form metadata
   */
  const updateFormData = useCallback((data: Partial<FormBuilderData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setIsDirty(true)
  }, [])

  /**
   * Add a new question
   */
  const addQuestion = useCallback((question: Question) => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...question, order: prev.questions.length }]
    }))
    setIsDirty(true)
  }, [])

  /**
   * Start editing a question
   */
  const editQuestion = useCallback((questionId: string) => {
    // If empty string, clear selection (for new question)
    if (!questionId) {
      setCurrentQuestion(null)
      setEditingQuestionId(null)
      return
    }
    
    // Use functional update to access latest state without dependency
    setFormData(prev => {
      const question = prev.questions.find(q => q.id === questionId)
      if (question) {
        setCurrentQuestion(question)
        setEditingQuestionId(questionId)
      }
      return prev // Don't modify formData
    })
  }, [])

  /**
   * Update a question
   */
  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    }))
    setIsDirty(true)
  }, [])

  /**
   * Delete a question
   */
  const deleteQuestion = useCallback((questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions
        .filter(q => q.id !== questionId)
        .map((q, index) => ({ ...q, order: index }))
    }))
    setIsDirty(true)
    
    // Clear current question if it's the one being deleted
    if (editingQuestionId === questionId) {
      setCurrentQuestion(null)
      setEditingQuestionId(null)
    }
  }, [editingQuestionId])

  /**
   * Move question up in order
   */
  const moveQuestionUp = useCallback((questionId: string) => {
    setFormData(prev => {
      const questions = [...prev.questions]
      const index = questions.findIndex(q => q.id === questionId)
      
      if (index > 0) {
        // Swap with previous question
        [questions[index - 1], questions[index]] = [questions[index], questions[index - 1]]
        
        // Update order values
        return {
          ...prev,
          questions: questions.map((q, i) => ({ ...q, order: i }))
        }
      }
      
      return prev
    })
    setIsDirty(true)
  }, [])

  /**
   * Move question down in order
   */
  const moveQuestionDown = useCallback((questionId: string) => {
    setFormData(prev => {
      const questions = [...prev.questions]
      const index = questions.findIndex(q => q.id === questionId)
      
      if (index < questions.length - 1) {
        // Swap with next question
        [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]]
        
        // Update order values
        return {
          ...prev,
          questions: questions.map((q, i) => ({ ...q, order: i }))
        }
      }
      
      return prev
    })
    setIsDirty(true)
  }, [])

  /**
   * Clear current question selection
   */
  const clearCurrentQuestion = useCallback(() => {
    setCurrentQuestion(null)
    setEditingQuestionId(null)
  }, [])

  /**
   * Save form to API
   */
  const saveForm = useCallback(async (): Promise<any | null> => {
    setError(null)

    try {
      // Basic validation
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório')
      }
      if (formData.title.trim().length < 3) {
        throw new Error('Título deve ter pelo menos 3 caracteres')
      }
      if (!formData.description.trim()) {
        throw new Error('Descrição é obrigatória')
      }
      if (formData.description.trim().length < 10) {
        throw new Error('Descrição deve ter pelo menos 10 caracteres')
      }
      if (!formData.category) {
        throw new Error('Categoria é obrigatória')
      }

      let savedForm: any

      // Use appropriate mutation based on whether we're creating or updating
      if (formData.id) {
        // Update: include status and questions
        const updateData: any = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          status: formData.status,
          generatesCertificate: formData.generatesCertificate,
        }
        
        // Only add optional fields if they have values
        if (formData.deadline) updateData.deadline = formData.deadline
        if (formData.estimatedTime) updateData.estimatedTime = formData.estimatedTime
        if (formData.certificateHours) updateData.certificateHours = formData.certificateHours
        
        // Add questions
        if (formData.questions && formData.questions.length > 0) {
          updateData.questions = formData.questions.map((q, idx) => ({
            text: q.text,
            type: q.type,
            required: q.required,
            options: q.options || [],
            rows: q.rows || [],
            columns: q.columns || [],
            order: idx,
            ...(q.id && { id: q.id }),
            ...(q.customId && { customId: q.customId }),
            ...(q.conditional && { conditional: q.conditional }),
          }))
        }
        
        savedForm = await updateFormMutation.mutateAsync({
          id: formData.id,
          data: updateData
        })
      } else {
        // Create: exclude id and status, include questions
        // Filter out questions without text (empty questions)
        const validQuestions = (formData.questions || []).filter(q => q.text?.trim())
        
        const createData: any = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          generatesCertificate: formData.generatesCertificate,
        }
        
        // Only add optional fields if they have values
        if (formData.deadline) createData.deadline = formData.deadline
        if (formData.estimatedTime) createData.estimatedTime = formData.estimatedTime
        if (formData.certificateHours) createData.certificateHours = formData.certificateHours
        
        // Add questions if any
        if (validQuestions.length > 0) {
          createData.questions = validQuestions.map((q, idx) => ({
            text: q.text.trim(),
            type: q.type,
            required: q.required ?? false,
            options: q.options || [],
            rows: q.rows || [],
            columns: q.columns || [],
            order: idx,
            ...(q.customId && { customId: q.customId }),
            ...(q.conditional && { conditional: q.conditional }),
          }))
        }
        
        savedForm = await createFormMutation.mutateAsync(createData)
      }
      
      toast.success('Formulário salvo com sucesso')
      setIsDirty(false)
      onSave?.(savedForm)
      
      return savedForm
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to save form')
      setError(error)
      
      // Extract error message - it's already formatted by apiRequest
      const errorMessage = error.message || 'Erro desconhecido ao salvar formulário'
      
      toast.error('Erro ao salvar formulário', {
        description: errorMessage
      })
      onError?.(error)
      return null
    }
  }, [formData, createFormMutation, updateFormMutation, onSave, onError])

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setFormData(initialFormData)
    setCurrentQuestion(null)
    setEditingQuestionId(null)
    setIsDirty(false)
    setError(null)
  }, [initialFormData])

  return {
    formData,
    currentQuestion,
    editingQuestionId,
    loading,
    saving,
    error,
    isDirty,
    actions: {
      updateFormData,
      addQuestion,
      editQuestion,
      updateQuestion,
      deleteQuestion,
      moveQuestionUp,
      moveQuestionDown,
      clearCurrentQuestion,
      saveForm,
      reset
    }
  }
}
