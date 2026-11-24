"use client"

import { ReactNode } from "react"
import { TableCell, TableHead } from "@/components/ui/table"

/**
 * Props for the DataTableCell component
 */
export interface DataTableCellProps {
  /** Cell content */
  children: ReactNode
  /** Whether this is a header cell */
  header?: boolean
  /** Additional CSS classes */
  className?: string
  /** Column span */
  colSpan?: number
  /** Alignment */
  align?: "left" | "center" | "right"
}

/**
 * DataTableCell Component
 * 
 * Represents a single cell in the table. Can be used for both header and body cells.
 * 
 * @example
 * ```tsx
 * // Header cell
 * <DataTableCell header>Name</DataTableCell>
 * 
 * // Body cell
 * <DataTableCell>{user.name}</DataTableCell>
 * 
 * // Aligned cell
 * <DataTableCell align="right">{price}</DataTableCell>
 * ```
 */
export function DataTableCell({ 
  children, 
  header = false, 
  className = "",
  colSpan,
  align = "left"
}: DataTableCellProps) {
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
  const combinedClassName = `${alignClass} ${className}`
  
  if (header) {
    return (
      <TableHead className={combinedClassName} colSpan={colSpan}>
        {children}
      </TableHead>
    )
  }
  
  return (
    <TableCell className={combinedClassName} colSpan={colSpan}>
      {children}
    </TableCell>
  )
}
