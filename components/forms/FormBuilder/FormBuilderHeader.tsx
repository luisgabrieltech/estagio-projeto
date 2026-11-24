'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * Props for FormBuilderHeader component
 */
export interface FormBuilderHeaderProps {
  /** Form title */
  title: string
  
  /** Whether form has unsaved changes */
  isDirty?: boolean
  
  /** Whether form is being saved */
  saving?: boolean
  
  /** Callback when save button is clicked */
  onSave: () => Promise<any>
  
  /** Callback when cancel button is clicked */
  onCancel?: () => void
}

/**
 * FormBuilderHeader component
 * 
 * Header for the form builder with title and action buttons.
 * Displays save and cancel buttons with appropriate states.
 * 
 * @param props - Component props
 * @returns FormBuilderHeader component
 */
export function FormBuilderHeader({
  title,
  isDirty = false,
  saving = false,
  onSave,
  onCancel
}: FormBuilderHeaderProps) {
  const router = useRouter()

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              disabled={saving}
              aria-label="Voltar"
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {title}
                </h1>
                {isDirty && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    Não salvo
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            
            <Button
              onClick={onSave}
              disabled={saving}
              className="min-w-[120px] bg-upe-blue hover:bg-upe-blue/90"
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
