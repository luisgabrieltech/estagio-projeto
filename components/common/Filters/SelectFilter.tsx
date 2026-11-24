import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * Option for SelectFilter
 */
export interface SelectOption {
  /** Option value */
  value: string
  /** Option label to display */
  label: string
}

/**
 * Props for the SelectFilter component
 */
export interface SelectFilterProps {
  /** Current selected value */
  value: string
  /** Callback when value changes */
  onChange: (value: string) => void
  /** Available options */
  options: SelectOption[]
  /** Label for the select */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * SelectFilter Component
 * 
 * Dropdown select filter with optional label.
 * 
 * @example
 * ```tsx
 * <SelectFilter
 *   label="Status"
 *   value={status}
 *   onChange={setStatus}
 *   placeholder="Selecione um status"
 *   options={[
 *     { value: "active", label: "Ativo" },
 *     { value: "inactive", label: "Inativo" }
 *   ]}
 * />
 * ```
 */
export function SelectFilter({
  value,
  onChange,
  options,
  label,
  placeholder = "Selecione...",
  className = ""
}: SelectFilterProps) {
  return (
    <div className={`flex-1 ${className}`}>
      {label && (
        <Label htmlFor="select-filter" className="text-sm mb-1.5 block">
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="select-filter">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
