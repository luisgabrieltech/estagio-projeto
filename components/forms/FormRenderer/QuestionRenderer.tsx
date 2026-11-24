'use client'

import { useCallback } from 'react'
import type { Question } from '@/types/entities/form'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/**
 * Props for QuestionRenderer component
 */
export interface QuestionRendererProps {
  /** Question to render */
  question: Question
  /** Current response value */
  value?: any
  /** Callback when response changes */
  onChange?: (value: any) => void
  /** Validation error message */
  error?: string
  /** Whether question is read-only */
  readOnly?: boolean
  /** Question number for display */
  questionNumber?: number
  /** Optional className for styling */
  className?: string
}

/**
 * QuestionRenderer component
 * 
 * Renders a question based on its type and manages user input.
 * Supports multiple question types: text, multiple choice, checkbox,
 * dropdown, scale, and grid.
 * 
 * @param props - Component props
 * @returns QuestionRenderer component
 * 
 * @example
 * ```tsx
 * <QuestionRenderer
 *   question={question}
 *   value={response}
 *   onChange={(value) => handleChange(question.id, value)}
 *   error={validationError}
 * />
 * ```
 */
export function QuestionRenderer({
  question,
  value,
  onChange,
  error,
  readOnly = false,
  questionNumber,
  className
}: QuestionRendererProps) {
  /**
   * Render question input based on type
   */
  const renderInput = useCallback(() => {
    switch (question.type) {
      case 'TEXT':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={readOnly}
            placeholder="Digite sua resposta..."
            className={cn(error && 'border-destructive')}
          />
        )

      case 'MULTIPLE_CHOICE':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            disabled={readOnly}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label
                  htmlFor={`${question.id}-${index}`}
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => {
              const isChecked = Array.isArray(value) && value.includes(option)
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (readOnly) return
                      
                      const currentValues = Array.isArray(value) ? value : []
                      
                      if (checked) {
                        onChange?.([...currentValues, option])
                      } else {
                        onChange?.(currentValues.filter(v => v !== option))
                      }
                    }}
                    disabled={readOnly}
                  />
                  <Label
                    htmlFor={`${question.id}-${index}`}
                    className="font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              )
            })}
          </div>
        )

      case 'DROPDOWN':
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={readOnly}
          >
            <SelectTrigger className={cn(error && 'border-destructive')}>
              <SelectValue placeholder="Selecione uma opção..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'SCALE':
        return (
          <RadioGroup
            value={value?.toString() || ''}
            onValueChange={(val) => onChange?.(parseInt(val))}
            disabled={readOnly}
            className="flex space-x-4"
          >
            {[1, 2, 3, 4, 5].map((scale) => (
              <div key={scale} className="flex flex-col items-center space-y-2">
                <RadioGroupItem value={scale.toString()} id={`${question.id}-${scale}`} />
                <Label
                  htmlFor={`${question.id}-${scale}`}
                  className="font-normal cursor-pointer"
                >
                  {scale}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'GRID':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted"></th>
                  {question.columns?.map((column, index) => (
                    <th key={index} className="border p-2 bg-muted text-sm font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.rows?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border p-2 font-medium text-sm">{row}</td>
                    {question.columns?.map((column, colIndex) => {
                      const cellValue = value?.[row]
                      const isSelected = cellValue === column
                      
                      return (
                        <td key={colIndex} className="border p-2 text-center">
                          <RadioGroup
                            value={cellValue || ''}
                            onValueChange={(val) => {
                              if (readOnly) return
                              
                              onChange?.({
                                ...value,
                                [row]: val
                              })
                            }}
                            disabled={readOnly}
                          >
                            <RadioGroupItem
                              value={column}
                              id={`${question.id}-${rowIndex}-${colIndex}`}
                              className="mx-auto"
                            />
                          </RadioGroup>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={readOnly}
            placeholder="Digite sua resposta..."
            className={cn(error && 'border-destructive')}
          />
        )
    }
  }, [question, value, onChange, error, readOnly])

  return (
    <Card className={cn('p-6', className)}>
      {/* Question header */}
      <div className="mb-4">
        <Label className="text-base font-medium">
          {questionNumber && (
            <span className="text-muted-foreground mr-2">{questionNumber}.</span>
          )}
          {question.text}
          {question.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
        
        {question.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {question.description}
          </p>
        )}
      </div>

      {/* Question input */}
      <div className="mb-2">
        {renderInput()}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive mt-2">
          {error}
        </p>
      )}
    </Card>
  )
}
