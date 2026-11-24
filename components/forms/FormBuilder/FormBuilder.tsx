'use client'

import { useFormBuilder, type UseFormBuilderOptions } from '@/hooks/forms/useFormBuilder'
import { FormBuilderHeader } from './FormBuilderHeader'
import { FormBuilderTabs } from './FormBuilderTabs'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'

/**
 * Props for FormBuilder component
 */
export interface FormBuilderProps extends UseFormBuilderOptions {
  /** Optional className for styling */
  className?: string
}

/**
 * FormBuilder component
 * 
 * Main component for building and editing forms.
 * Composes FormBuilderHeader and FormBuilderTabs to provide
 * a complete form building experience.
 * 
 * @param props - Component props
 * @returns FormBuilder component
 * 
 * @example
 * ```tsx
 * <FormBuilder
 *   formId="123"
 *   onSave={(form) => router.push(`/forms/${form.id}`)}
 * />
 * ```
 */
export function FormBuilder(props: FormBuilderProps) {
  const { className, ...builderOptions } = props

  const {
    formData,
    currentQuestion,
    editingQuestionId,
    loading,
    saving,
    error,
    isDirty,
    actions
  } = useFormBuilder(builderOptions)

  // Show loading state while fetching form data
  if (loading) {
    return <LoadingState message="Carregando formulário..." />
  }

  // Show error state if loading failed
  if (error && !formData.title) {
    return (
      <ErrorState
        title="Erro ao carregar formulário"
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className={className}>
      <FormBuilderHeader
        title={formData.title || 'Novo Formulário'}
        isDirty={isDirty}
        saving={saving}
        onSave={actions.saveForm}
        onCancel={actions.reset}
      />

      <FormBuilderTabs
        formData={formData}
        currentQuestion={currentQuestion}
        editingQuestionId={editingQuestionId}
        actions={actions}
      />
    </div>
  )
}
