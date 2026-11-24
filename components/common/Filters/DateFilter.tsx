import { Calendar } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Props for the DateFilter component
 */
export interface DateFilterProps {
  /** Current selected date */
  value: Date | undefined
  /** Callback when date changes */
  onChange: (date: Date | undefined) => void
  /** Label for the date picker */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * DateFilter Component
 * 
 * Date picker filter with calendar popup.
 * 
 * @example
 * ```tsx
 * <DateFilter
 *   label="Data de início"
 *   value={startDate}
 *   onChange={setStartDate}
 *   placeholder="Selecione uma data"
 * />
 * ```
 */
export function DateFilter({
  value,
  onChange,
  label,
  placeholder = "Selecione uma data",
  className = ""
}: DateFilterProps) {
  return (
    <div className={`flex-1 ${className}`}>
      {label && (
        <Label htmlFor="date-filter" className="text-sm mb-1.5 block">
          {label}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-filter"
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {value ? (
              format(value, "PPP", { locale: ptBR })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
