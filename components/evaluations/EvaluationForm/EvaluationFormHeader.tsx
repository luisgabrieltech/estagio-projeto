"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Props for the EvaluationFormHeader component
 */
export interface EvaluationFormHeaderProps {
  /** Form title */
  title: string
  /** Form description */
  description?: string
  /** Callback when back button is clicked */
  onBack: () => void
}

/**
 * EvaluationFormHeader Component
 * 
 * Displays the header for the evaluation form with title, description,
 * and a back button for navigation.
 * 
 * @example
 * ```tsx
 * <EvaluationFormHeader
 *   title="Avaliação de Docentes"
 *   description="Avalie os docentes do seu curso"
 *   onBack={() => router.push('/dashboard/avaliacoes')}
 * />
 * ```
 */
export function EvaluationFormHeader({ 
  title, 
  description, 
  onBack 
}: EvaluationFormHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          aria-label="Voltar para lista de avaliações"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-upe-blue">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
