import { ReactNode } from "react"
import { TableRow } from "@/components/ui/table"

/**
 * Props for the DataTableRow component
 */
export interface DataTableRowProps {
  /** Row cells */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Click handler for the row */
  onClick?: () => void
}

/**
 * DataTableRow Component
 * 
 * Represents a single row in the table.
 * 
 * @example
 * ```tsx
 * <DataTableRow onClick={() => handleRowClick(item.id)}>
 *   <DataTableCell>{item.name}</DataTableCell>
 *   <DataTableCell>{item.email}</DataTableCell>
 * </DataTableRow>
 * ```
 */
export function DataTableRow({ children, className = "", onClick }: DataTableRowProps) {
  return (
    <TableRow 
      className={`${onClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </TableRow>
  )
}
