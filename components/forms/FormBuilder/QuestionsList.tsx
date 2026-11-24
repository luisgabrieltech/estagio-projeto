'use client'

import { useCallback, memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Question } from '@/types/entities/form'
import { QuestionItem } from './QuestionItem'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'

export interface QuestionsListProps {
  questions: Question[]
  selectedQuestionId: string | null
  onSelectQuestion: (questionId: string) => void
  onDeleteQuestion: (questionId: string) => void
  onMoveUp: (questionId: string) => void
  onMoveDown: (questionId: string) => void
}

/**
 * QuestionsList component - displays list of questions with actions
 */
export const QuestionsList = memo(function QuestionsList({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onDeleteQuestion,
  onMoveUp,
  onMoveDown
}: QuestionsListProps) {
  // Memoized handler for new question button
  const handleNewQuestion = useCallback(() => {
    onSelectQuestion('')
  }, [onSelectQuestion])

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">Perguntas</CardTitle>
            <CardDescription className="text-sm">
              {questions.length === 0 
                ? 'Nenhuma pergunta adicionada' 
                : `${questions.length} ${questions.length === 1 ? 'pergunta' : 'perguntas'}`
              }
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleNewQuestion}
            className="bg-upe-blue hover:bg-upe-blue/90 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {questions.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Nenhuma pergunta"
              description="Clique em 'Nova' para adicionar a primeira pergunta"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                index={index}
                isSelected={question.id === selectedQuestionId}
                isFirst={index === 0}
                isLast={index === questions.length - 1}
                onSelect={() => onSelectQuestion(question.id)}
                onDelete={() => onDeleteQuestion(question.id)}
                onMoveUp={() => onMoveUp(question.id)}
                onMoveDown={() => onMoveDown(question.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
})
