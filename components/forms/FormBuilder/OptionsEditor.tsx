'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'

/**
 * Props for OptionsEditor component
 */
export interface OptionsEditorProps {
  /** Current options */
  options: string[]
  
  /** Callback when options change */
  onChange: (options: string[]) => void
}

/**
 * OptionsEditor component
 * 
 * Editor for question options (multiple choice, checkbox, dropdown).
 * Allows adding and removing options.
 * 
 * @param props - Component props
 * @returns OptionsEditor component
 */
export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const handleAddOption = () => {
    onChange([...options, ''])
  }

  const handleRemoveOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index))
  }

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    onChange(newOptions)
  }

  return (
    <div className="space-y-3">
      <Label>
        Opções <span className="text-destructive">*</span>
      </Label>
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm text-muted-foreground">
              {index + 1}.
            </div>
            <Input
              value={option}
              onChange={(e) => handleUpdateOption(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveOption(index)}
              disabled={options.length <= 1}
              aria-label="Remover opção"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddOption}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Opção
      </Button>
    </div>
  )
}
