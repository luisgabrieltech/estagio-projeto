'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'

/**
 * Props for GridEditor component
 */
export interface GridEditorProps {
  /** Current rows */
  rows: string[]
  
  /** Current columns */
  columns: string[]
  
  /** Callback when rows change */
  onRowsChange: (rows: string[]) => void
  
  /** Callback when columns change */
  onColumnsChange: (columns: string[]) => void
}

/**
 * GridEditor component
 * 
 * Editor for grid question rows and columns.
 * Allows adding and removing rows and columns.
 * 
 * @param props - Component props
 * @returns GridEditor component
 */
export function GridEditor({
  rows,
  columns,
  onRowsChange,
  onColumnsChange
}: GridEditorProps) {
  const handleAddRow = () => {
    onRowsChange([...rows, ''])
  }

  const handleRemoveRow = (index: number) => {
    onRowsChange(rows.filter((_, i) => i !== index))
  }

  const handleUpdateRow = (index: number, value: string) => {
    const newRows = [...rows]
    newRows[index] = value
    onRowsChange(newRows)
  }

  const handleAddColumn = () => {
    onColumnsChange([...columns, ''])
  }

  const handleRemoveColumn = (index: number) => {
    onColumnsChange(columns.filter((_, i) => i !== index))
  }

  const handleUpdateColumn = (index: number, value: string) => {
    const newColumns = [...columns]
    newColumns[index] = value
    onColumnsChange(newColumns)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>
          Linhas <span className="text-destructive">*</span>
        </Label>
        
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm text-muted-foreground">
                {index + 1}.
              </div>
              <Input
                value={row}
                onChange={(e) => handleUpdateRow(index, e.target.value)}
                placeholder={`Linha ${index + 1}`}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRow(index)}
                disabled={rows.length <= 1}
                aria-label="Remover linha"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Linha
        </Button>
      </div>

      <div className="space-y-3">
        <Label>
          Colunas <span className="text-destructive">*</span>
        </Label>
        
        <div className="space-y-2">
          {columns.map((column, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm text-muted-foreground">
                {index + 1}.
              </div>
              <Input
                value={column}
                onChange={(e) => handleUpdateColumn(index, e.target.value)}
                placeholder={`Coluna ${index + 1}`}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveColumn(index)}
                disabled={columns.length <= 1}
                aria-label="Remover coluna"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddColumn}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Coluna
        </Button>
      </div>
    </div>
  )
}
