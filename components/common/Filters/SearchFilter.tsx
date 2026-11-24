import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Props for the SearchFilter component
 */
export interface SearchFilterProps {
  /** Current search value */
  value: string
  /** Callback when search value changes */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Label for the search input */
  label?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * SearchFilter Component
 * 
 * Search input filter with icon and optional label.
 * 
 * @example
 * ```tsx
 * <SearchFilter
 *   label="Buscar"
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   placeholder="Buscar por nome..."
 * />
 * ```
 */
export function SearchFilter({
  value,
  onChange,
  placeholder = "Buscar...",
  label,
  className = ""
}: SearchFilterProps) {
  return (
    <div className={`flex-1 ${className}`}>
      {label && (
        <Label htmlFor="search-filter" className="text-sm mb-1.5 block">
          {label}
        </Label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search-filter"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  )
}
