"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

/**
 * Props for the EvaluationsSearch component
 */
export interface EvaluationsSearchProps {
  /** Current search query value */
  value: string
  /** Callback when search query changes */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * EvaluationsSearch Component
 * 
 * Search input field for filtering evaluations.
 * 
 * @example
 * ```tsx
 * <EvaluationsSearch 
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Buscar avaliações..."
 * />
 * ```
 */
export function EvaluationsSearch({ 
  value,
  onChange,
  placeholder = "Buscar avaliações...",
  className = "" 
}: EvaluationsSearchProps) {
  return (
    <div className={`relative w-full md:w-64 ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
