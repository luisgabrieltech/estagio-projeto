'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BasicInfoTab } from './BasicInfoTab'
import { QuestionsTab } from './QuestionsTab'
import { PreviewTab } from './PreviewTab'
import type { FormBuilderData, UseFormBuilderReturn } from '@/hooks/forms/useFormBuilder'
import type { Question } from '@/types/entities/form'

/**
 * Props for FormBuilderTabs component
 */
export interface FormBuilderTabsProps {
  /** Current form data */
  formData: FormBuilderData
  
  /** Currently selected/editing question */
  currentQuestion: Question | null
  
  /** ID of question being edited */
  editingQuestionId: string | null
  
  /** Form builder actions */
  actions: UseFormBuilderReturn['actions']
}

/**
 * FormBuilderTabs component
 * 
 * Tab navigation for form builder.
 * Contains three tabs: Basic Info, Questions, and Preview.
 * 
 * @param props - Component props
 * @returns FormBuilderTabs component
 */
export function FormBuilderTabs({
  formData,
  currentQuestion,
  editingQuestionId,
  actions
}: FormBuilderTabsProps) {
  return (
    <div className="container mx-auto px-6 py-8">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8 h-12 bg-muted/50">
          <TabsTrigger value="basic" className="text-sm font-medium">
            Informações Básicas
          </TabsTrigger>
          <TabsTrigger value="questions" className="text-sm font-medium">
            Perguntas
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-sm font-medium">
            Pré-visualização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">
          <BasicInfoTab
            formData={formData}
            onUpdate={actions.updateFormData}
          />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6 mt-6">
          <QuestionsTab
            questions={formData.questions}
            currentQuestion={currentQuestion}
            editingQuestionId={editingQuestionId}
            onAddQuestion={actions.addQuestion}
            onEditQuestion={actions.editQuestion}
            onUpdateQuestion={actions.updateQuestion}
            onDeleteQuestion={actions.deleteQuestion}
            onMoveUp={actions.moveQuestionUp}
            onMoveDown={actions.moveQuestionDown}
            onClearSelection={actions.clearCurrentQuestion}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6 mt-6">
          <PreviewTab formData={formData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
