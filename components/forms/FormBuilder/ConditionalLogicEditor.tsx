'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'
import type { Question } from '@/types/entities/form'

/**
 * Conditional rule interface
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
 * Props for ConditionalLogicEditor component
 */
export interface ConditionalLogicEditorProps {
  /** Current conditional rule */
  conditional: any
  
  /** All questions in the form */
  questions: Question[]
  
  /** ID of current question being edited */
  currentQuestionId: string
  
  /** Callback when conditional rule changes */
  onChange: (conditional: ConditionalRule | null) => void
}

/**
 * ConditionalLogicEditor component
 * 
 * Editor for conditional logic rules.
 * Allows selecting dependent question, operator, and conditions.
 * 
 * @param props - Component props
 * @returns ConditionalLogicEditor component
 */
export function ConditionalLogicEditor({
  conditional,
  questions,
  currentQuestionId,
  onChange
}: ConditionalLogicEditorProps) {
  const [isEnabled, setIsEnabled] = useState(!!conditional)

  const currentIndex = questions.findIndex(q => q.id === currentQuestionId)
  const availableQuestions = questions
    .slice(0, currentIndex === -1 ? questions.length : currentIndex)
    .filter(q => ['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN', 'SCALE'].includes(q.type))

  const handleToggle = () => {
    if (isEnabled) {
      setIsEnabled(false)
      onChange(null)
    } else {
      setIsEnabled(true)
      onChange({
        dependsOn: '',
        operator: 'AND',
        conditions: [{ type: 'equals', value: '' }]
      })
    }
  }

  const handleDependsOnChange = (questionId: string) => {
    onChange({
      ...conditional,
      dependsOn: questionId
    })
  }

  const handleOperatorChange = (operator: 'AND' | 'OR') => {
    onChange({
      ...conditional,
      operator
    })
  }

  const handleAddCondition = () => {
    onChange({
      ...conditional,
      conditions: [...(conditional?.conditions || []), { type: 'equals', value: '' }]
    })
  }

  const handleRemoveCondition = (index: number) => {
    const newConditions = conditional.conditions.filter((_: any, i: number) => i !== index)
    onChange({
      ...conditional,
      conditions: newConditions
    })
  }

  const handleUpdateCondition = (index: number, field: 'type' | 'value', value: string) => {
    const newConditions = [...conditional.conditions]
    newConditions[index] = { ...newConditions[index], [field]: value }
    onChange({
      ...conditional,
      conditions: newConditions
    })
  }

  if (!isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lógica Condicional</CardTitle>
          <CardDescription>
            Mostrar esta pergunta apenas quando certas condições forem atendidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleToggle} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Lógica Condicional
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lógica Condicional</CardTitle>
            <CardDescription>
              Esta pergunta será mostrada condicionalmente
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleToggle}>
            Remover
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma pergunta disponível para dependência. Adicione perguntas de múltipla escolha antes desta.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Depende da Pergunta</Label>
              <Select
                value={conditional?.dependsOn || ''}
                onValueChange={handleDependsOnChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pergunta" />
                </SelectTrigger>
                <SelectContent>
                  {availableQuestions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Operador</Label>
              <Select
                value={conditional?.operator || 'AND'}
                onValueChange={(val) => handleOperatorChange(val as 'AND' | 'OR')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">E (todas as condições)</SelectItem>
                  <SelectItem value="OR">OU (qualquer condição)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Condições</Label>
              {conditional?.conditions?.map((condition: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <Select
                    value={condition.type}
                    onValueChange={(val) => handleUpdateCondition(index, 'type', val)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Igual a</SelectItem>
                      <SelectItem value="contains">Contém</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={condition.value}
                    onChange={(e) => handleUpdateCondition(index, 'value', e.target.value)}
                    placeholder="Valor"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCondition(index)}
                    disabled={conditional.conditions.length <= 1}
                    aria-label="Remover condição"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCondition}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Condição
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
