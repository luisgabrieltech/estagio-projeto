"use client"

import { ReactNode } from "react"
import { TableHeader } from "@/components/ui/table"

/**
 * Props for the DataTableHeader component
 */
export interface DataTableHeaderProps {
  /** Header row content */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * DataTableHeader Component
 * 
 * Wrapper for table header section.
 * 
 * @example
 * ```tsx
 * <DataTableHeader>
 *   <DataTableRow>
 *     <DataTableCell header>Column 1</DataTableCell>
 *     <DataTableCell header>Column 2</DataTableCell>
 *   </DataTableRow>
 * </DataTableHeader>
 * ```
 */
export function DataTableHeader({ children, className = "" }: DataTableHeaderProps) {
  return (
    <TableHeader className={className}>
      {children}
    </TableHeader>
  )
}
