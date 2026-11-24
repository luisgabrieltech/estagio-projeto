import { ReactNode } from "react"
import { Card } from "@/components/ui/card"

/**
 * Props for the FilterPanel component
 */
export interface FilterPanelProps {
  /** Filter components to display */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Optional title for the filter panel */
  title?: string
}

/**
 * FilterPanel Component
 * 
 * Container for filter components with consistent styling.
 * 
 * @example
 * ```tsx
 * <FilterPanel title="Filtros">
 *   <SearchFilter value={search} onChange={setSearch} />
 *   <SelectFilter
 *     label="Status"
 *     value={status}
 *     onChange={setStatus}
 *     options={statusOptions}
 *   />
 * </FilterPanel>
 * ```
 */
export function FilterPanel({ children, className = "", title }: FilterPanelProps) {
  return (
    <Card className={`p-4 ${className}`}>
      {title && (
        <h3 className="text-sm font-medium mb-3">{title}</h3>
      )}
      <div className="flex flex-col md:flex-row gap-3">
        {children}
      </div>
    </Card>
  )
}
