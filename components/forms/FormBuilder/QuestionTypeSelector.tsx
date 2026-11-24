'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { QuestionType } from '@/types/entities/form'

/**
 * Props for QuestionTypeSelector component
 */
export interface QuestionTypeSelectorProps {
  /** Current question type */
  value: QuestionType | string
  
  /** Callback when type changes */
  onChange: (type: QuestionType) => void
}

/**
 * Available question types with labels and descriptions
 */
const QUESTION_TYPES = [
  {
    value: 'TEXT',
    label: 'Texto',
    description: 'Resposta em texto livre'
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: 'Múltipla Escolha',
    description: 'Selecionar uma opção'
  },
  {
    value: 'CHECKBOX',
    label: 'Caixas de Seleção',
    description: 'Selecionar múltiplas opções'
  },
  {
    value: 'DROPDOWN',
    label: 'Lista Suspensa',
    description: 'Selecionar de uma lista'
  },
  {
    value: 'SCALE',
    label: 'Escala',
    description: 'Avaliação numérica'
  },
  {
    value: 'GRID',
    label: 'Grade',
    description: 'Matriz de perguntas'
  },
  {
    value: 'SECTION',
    label: 'Seção',
    description: 'Divisor de seções'
  }
] as const

/**
 * QuestionTypeSelector component
 * 
 * Select dropdown for choosing question type.
 * Displays all available question types with descriptions.
 * 
 * @param props - Component props
 * @returns QuestionTypeSelector component
 */
export function QuestionTypeSelector({ value, onChange }: QuestionTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as QuestionType)}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o tipo de pergunta" />
      </SelectTrigger>
      <SelectContent>
        {QUESTION_TYPES.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            <div className="flex flex-col">
              <span className="font-medium">{type.label}</span>
              <span className="text-xs text-muted-foreground">{type.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
