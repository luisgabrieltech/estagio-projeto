'use client'

import type { Question } from '@/types/entities/form'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

/**
 * Props for SectionRenderer component
 */
export interface SectionRendererProps {
  /** Section question to render */
  question: Question
  /** Optional className for styling */
  className?: string
}

/**
 * SectionRenderer component
 * 
 * Renders a section header in a form. Sections are used to
 * organize questions into logical groups with titles and descriptions.
 * 
 * @param props - Component props
 * @returns SectionRenderer component
 * 
 * @example
 * ```tsx
 * <SectionRenderer
 *   question={sectionQuestion}
 * />
 * ```
 */
export function SectionRenderer({
  question,
  className
}: SectionRendererProps) {
  return (
    <div className={cn('py-4', className)}>
      {/* Section title */}
      <h3 className="text-xl font-semibold text-upe-blue mb-2">
        {question.text}
      </h3>

      {/* Section description */}
      {question.description && (
        <p className="text-muted-foreground mb-4">
          {question.description}
        </p>
      )}

      {/* Separator */}
      <Separator className="mt-4" />
    </div>
  )
}
