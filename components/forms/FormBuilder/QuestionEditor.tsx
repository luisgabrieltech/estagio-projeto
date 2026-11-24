'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { Question } from '@/types/entities/form'
import { QuestionTypeSelector } from './QuestionTypeSelector'
import { OptionsEditor } from './OptionsEditor'
import { GridEditor } from './GridEditor'
import { ConditionalLogicEditor } from './ConditionalLogicEditor'

/**
 * Generate a unique question ID using crypto for better uniqueness
 */
function generateQuestionId(): string {
  const timestamp = Date.now()
  const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).substring(2, 10)
  return `q-${timestamp}-${randomPart}`
}

/**
 * Create default question data
 */
function createDefaultQuestion(existingQuestion?: Question | null): Partial<Question> {
  if (existingQuestion) {
    return {
      id: existingQuestion.id,
      customId: existingQuestion.customId ?? null, // Preserve null/undefined, don't convert to empty string
      type: existingQuestion.type,
      text: existingQuestion.text,
      description: existingQuestion.description || '',
      required: existingQuestion.required,
      order: existingQuestion.order,
      options: existingQuestion.options || [],
      rows: existingQuestion.rows || [],
      columns: existingQuestion.columns || [],
      conditional: existingQuestion.conditional || null
    }
  }
  
  return {
    id: generateQuestionId(),
    customId: null, // Start with null, not empty string
    type: 'TEXT',
    text: '',
    description: '',
    required: false,
    order: 0,
    options: [],
    rows: [],
    columns: [],
    conditional: null
  }
}

export interface QuestionEditorProps {
  question: Question | null
  questions: Question[]
  onSave: (question: Partial<Question>) => void
  onCancel: () => void
}

/**
 * QuestionEditor component - form for creating/editing questions
 */
export function QuestionEditor({
  question,
  questions,
  onSave,
  onCancel
}: QuestionEditorProps) {
  // Initialize form data based on question prop
  const [formData, setFormData] = useState<Partial<Question>>(() => 
    createDefaultQuestion(question)
  )

  // Sync form data when question prop changes
  useEffect(() => {
    setFormData(createDefaultQuestion(question))
  }, [question])

  // Memoized handlers to prevent unnecessary re-renders
  const handleFieldChange = useCallback(<K extends keyof Question>(
    field: K, 
    value: Question[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(() => {
    if (!formData.text?.trim()) {
      alert('O texto da pergunta é obrigatório')
      return
    }
    onSave(formData)
  }, [formData, onSave])

  // Computed values
  const needsOptions = useMemo(() => 
    ['MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN'].includes(formData.type || ''),
    [formData.type]
  )
  const needsGrid = formData.type === 'GRID'

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg">
          {question ? 'Editar Pergunta' : 'Nova Pergunta'}
        </CardTitle>
        <CardDescription className="text-sm">
          Configure os detalhes da pergunta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <Label htmlFor="customId" className="text-sm font-semibold">
            ID Personalizado (opcional)
          </Label>
          <Input
            id="customId"
            value={formData.customId ?? ''}
            onChange={(e) => {
              const value = e.target.value.trim()
              handleFieldChange('customId', value || null)
            }}
            placeholder="Ex: q1, pergunta_nome, etc."
            className="text-base font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Use um identificador único para facilitar referências e análises
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="questionType" className="text-sm font-semibold">
            Tipo de Pergunta <span className="text-destructive">*</span>
          </Label>
          <QuestionTypeSelector
            value={formData.type || 'TEXT'}
            onChange={(type) => handleFieldChange('type', type)}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="questionText" className="text-sm font-semibold">
            Texto da Pergunta <span className="text-destructive">*</span>
          </Label>
          <Input
            id="questionText"
            value={formData.text}
            onChange={(e) => handleFieldChange('text', e.target.value)}
            placeholder="Digite a pergunta"
            required
            className="text-base"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="questionDescription" className="text-sm font-semibold">
            Descrição (opcional)
          </Label>
          <Textarea
            id="questionDescription"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Adicione uma descrição ou instrução"
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="space-y-1">
            <Label htmlFor="required" className="text-sm font-semibold cursor-pointer">
              Pergunta Obrigatória
            </Label>
            <p className="text-xs text-muted-foreground">
              Usuário deve responder esta pergunta
            </p>
          </div>
          <Switch
            id="required"
            checked={formData.required}
            onCheckedChange={(checked) => handleFieldChange('required', checked)}
          />
        </div>

        {needsOptions && (
          <div className="pt-2">
            <OptionsEditor
              options={formData.options || []}
              onChange={(options) => handleFieldChange('options', options)}
            />
          </div>
        )}

        {needsGrid && (
          <div className="pt-2">
            <GridEditor
              rows={formData.rows || []}
              columns={formData.columns || []}
              onRowsChange={(rows) => handleFieldChange('rows', rows)}
              onColumnsChange={(columns) => handleFieldChange('columns', columns)}
            />
          </div>
        )}

        <div className="pt-2">
          <ConditionalLogicEditor
            conditional={formData.conditional}
            questions={questions}
            currentQuestionId={formData.id || ''}
            onChange={(conditional) => handleFieldChange('conditional', conditional)}
          />
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <Button 
            onClick={handleSave} 
            className="flex-1 bg-upe-blue hover:bg-upe-blue/90"
          >
            Salvar Pergunta
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="min-w-[100px]"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
