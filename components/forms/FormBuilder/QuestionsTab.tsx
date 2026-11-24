'use client'

import { useCallback, memo, useState } from 'react'
import type { Question } from '@/types/entities/form'
import { QuestionsList } from './QuestionsList'
import { QuestionEditor } from './QuestionEditor'

export interface QuestionsTabProps {
  questions: Question[]
  currentQuestion: Question | null
  editingQuestionId: string | null
  onAddQuestion: (question: Question) => void
  onEditQuestion: (questionId: string) => void
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void
  onDeleteQuestion: (questionId: string) => void
  onMoveUp: (questionId: string) => void
  onMoveDown: (questionId: string) => void
  onClearSelection: () => void
}

/**
 * QuestionsTab component - manages form questions with list and editor
 */
export const QuestionsTab = memo(function QuestionsTab({
  questions,
  currentQuestion,
  editingQuestionId,
  onAddQuestion,
  onEditQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onMoveUp,
  onMoveDown,
  onClearSelection
}: QuestionsTabProps) {
  // Key to force editor reset after adding new question
  const [editorResetKey, setEditorResetKey] = useState(0)

  // Memoized save handler
  const handleSave = useCallback((question: Partial<Question>) => {
    if (editingQuestionId) {
      onUpdateQuestion(editingQuestionId, question)
    } else {
      onAddQuestion(question as Question)
      // Increment key to force new editor instance with fresh ID
      setEditorResetKey(prev => prev + 1)
    }
    onClearSelection()
  }, [editingQuestionId, onUpdateQuestion, onAddQuestion, onClearSelection])

  // Unique key: use question ID when editing, or reset key when creating new
  const editorKey = editingQuestionId || `new-${editorResetKey}`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="sticky top-24">
          <QuestionsList
            questions={questions}
            selectedQuestionId={editingQuestionId}
            onSelectQuestion={onEditQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        <QuestionEditor
          key={editorKey}
          question={currentQuestion}
          questions={questions}
          onSave={handleSave}
          onCancel={onClearSelection}
        />
      </div>
    </div>
  )
})
