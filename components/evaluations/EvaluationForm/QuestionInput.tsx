"use client"

import { useCallback } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { sanitizeTextInput } from "@/lib/utils/sanitize"
import type { EvaluationQuestion, ResponseValue } from "@/hooks/evaluations/useEvaluationForm"

/**
 * Maximum length for text responses
 */
const MAX_TEXT_LENGTH = 5000

/**
 * Scale labels configuration
 */
const SCALE_LABELS = {
  min: "1 - Muito insatisfeito",
  max: "5 - Muito satisfeito"
} as const

/**
 * Props for the QuestionInput component
 */
export interface QuestionInputProps {
  /** The question to render input for */
  question: EvaluationQuestion
  /** Current response value */
  value: ResponseValue
  /** Callback when response changes */
  onChange: (value: ResponseValue) => void
  /** Whether the input is disabled */
  disabled?: boolean
}

/**
 * QuestionInput Component
 * 
 * Renders the appropriate input type based on the question type.
 * Supports multiple_choice, checkbox, text, scale, dropdown, and grid types.
 * 
 * @example
 * ```tsx
 * <QuestionInput
 *   question={question}
 *   value={responses[question.id]}
 *   onChange={(value) => handleResponseChange(question.id, value)}
 * />
 * ```
 */
export function QuestionInput({ 
  question, 
  value, 
  onChange,
  disabled = false 
}: QuestionInputProps) {
  const type = (question.type || "").toLowerCase()

  /**
   * Handle text input change with sanitization
   */
  const handleTextChange = useCallback((inputValue: string) => {
    const sanitized = sanitizeTextInput(inputValue, MAX_TEXT_LENGTH)
    onChange(sanitized)
  }, [onChange])

  // Multiple Choice
  if (type === "multiple_choice") {
    return (
      <RadioGroup
        onValueChange={onChange}
        value={value as string}
        disabled={disabled}
        className="space-y-2"
      >
        {Array.isArray(question.options) && question.options
          .filter(option => option.trim() !== "")
          .map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${question.id}-${option}`} />
              <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                {option}
              </Label>
            </div>
          ))
        }
      </RadioGroup>
    )
  }

  // Checkbox
  if (type === "checkbox") {
    const currentValues = (value as string[]) || []
    return (
      <div className="space-y-2">
        {Array.isArray(question.options) && question.options
          .filter(option => option.trim() !== "")
          .map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}-${option}`}
                checked={currentValues.includes(option)}
                disabled={disabled}
                onCheckedChange={(checked) => {
                  onChange(
                    checked
                      ? [...currentValues, option]
                      : currentValues.filter((v) => v !== option)
                  )
                }}
              />
              <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                {option}
              </Label>
            </div>
          ))
        }
      </div>
    )
  }

  // Text
  if (type === "text") {
    return (
      <Textarea
        placeholder="Digite sua resposta aqui..."
        value={(value as string) || ""}
        onChange={(e) => handleTextChange(e.target.value)}
        disabled={disabled}
        className="min-h-[100px]"
        maxLength={MAX_TEXT_LENGTH}
        aria-describedby={`${question.id}-char-count`}
      />
    )
  }

  // Scale
  if (type === "scale") {
    return (
      <div className="space-y-2">
        <div className="flex justify-between px-1">
          <span className="text-sm text-muted-foreground">{SCALE_LABELS.min}</span>
          <span className="text-sm text-muted-foreground">{SCALE_LABELS.max}</span>
        </div>
        <RadioGroup
          value={value as string}
          onValueChange={onChange}
          disabled={disabled}
          className="flex justify-between"
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex flex-col items-center gap-2">
              <RadioGroupItem value={String(num)} id={`scale-${question.id}-${num}`} />
              <Label htmlFor={`scale-${question.id}-${num}`} className="text-sm">
                {num}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    )
  }

  // Dropdown
  if (type === "dropdown") {
    return (
      <Select
        value={value as string}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          {Array.isArray(question.options) && question.options
            .filter(option => option.trim() !== "")
            .map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    )
  }

  // Grid
  if (type === "grid") {
    const gridValue = (value as Record<string, string>) || {}
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border"></th>
              {question.columns?.map((column, colIndex) => (
                <th key={colIndex} className="p-2 border text-center text-sm">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {question.rows?.map((row, rowIndex) => {
              const rowName = `grid-row-${question.id}-${rowIndex}`
              return (
                <tr key={rowIndex}>
                  <td className="p-2 border font-medium text-sm">{row}</td>
                  {question.columns?.map((_, colIndex) => {
                    const radioValue = `${rowIndex}-${colIndex}`
                    const radioId = `grid-${question.id}-${rowIndex}-${colIndex}`
                    return (
                      <td key={colIndex} className="p-2 border text-center">
                        <input
                          type="radio"
                          name={rowName}
                          value={radioValue}
                          id={radioId}
                          checked={gridValue[rowIndex] === radioValue}
                          disabled={disabled}
                          onChange={() => {
                            onChange({
                              ...gridValue,
                              [rowIndex]: radioValue
                            })
                          }}
                          className="h-4 w-4 rounded-full border border-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // Unknown type
  return (
    <div className="text-muted-foreground text-sm">
      Tipo de questão não suportado: {question.type}
    </div>
  )
}
