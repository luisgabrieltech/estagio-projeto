'use client'

import { useCallback, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react'
import type { Question } from '@/types/entities/form'
import { cn } from '@/lib/utils'

/**
 * Props for QuestionItem component
 */
export interface QuestionItemProps {
  /** Question data */
  question: Question
  /** Question index in the list */
  index: number
  /** Whether this question is selected */
  isSelected: boolean
  /** Whether this is the first question */
  isFirst: boolean
  /** Whether this is the last question */
  isLast: boolean
  /** Callback when question is selected */
  onSelect: () => void
  /** Callback when question is deleted */
  onDelete: () => void
  /** Callback when question is moved up */
  onMoveUp: () => void
  /** Callback when question is moved down */
  onMoveDown: () => void
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Múltipla Escolha',
  CHECKBOX: 'Caixas de Seleção',
  TEXT: 'Texto',
  SCALE: 'Escala',
  GRID: 'Grade',
  DROPDOWN: 'Lista Suspensa',
  SECTION: 'Seção'
}

/**
 * QuestionItem component - displays a single question in the list
 */
export function QuestionItem({
  question,
  index,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown
}: QuestionItemProps) {
  const handleCardClick = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect()
  }, [onSelect])

  const handleMoveUp = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onMoveUp()
  }, [onMoveUp])

  const handleMoveDown = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onMoveDown()
  }, [onMoveDown])

  const handleEdit = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect()
  }, [onSelect])

  const handleDelete = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete()
  }, [onDelete])

  return (
    <Card
      className={cn(
        'group p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50',
        isSelected && 'border-primary shadow-md bg-primary/5 ring-2 ring-primary/20'
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors",
          isSelected 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">
              {question.text || 'Nova pergunta'}
            </h4>
            {question.customId && (
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                {question.customId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-md bg-muted/50">
              {QUESTION_TYPE_LABELS[question.type] || question.type}
            </span>
            {question.required && (
              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Obrigatória
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10"
            onClick={handleMoveUp}
            disabled={isFirst}
            aria-label="Mover para cima"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10"
            onClick={handleMoveDown}
            disabled={isLast}
            aria-label="Mover para baixo"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10"
            onClick={handleEdit}
            aria-label="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            aria-label="Deletar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
