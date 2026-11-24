"use client"

import { ReactNode } from "react"
import { TableBody } from "@/components/ui/table"

/**
 * Props for the DataTableBody component
 */
export interface DataTableBodyProps {
  /** Table body rows */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * DataTableBody Component
 * 
 * Wrapper for table body section containing data rows.
 * 
 * @example
 * ```tsx
 * <DataTableBody>
 *   {data.map(item => (
 *     <DataTableRow key={item.id}>
 *       <DataTableCell>{item.name}</DataTableCell>
 *     </DataTableRow>
 *   ))}
 * </DataTableBody>
 * ```
 */
export function DataTableBody({ children, className = "" }: DataTableBodyProps) {
  return (
    <TableBody className={className}>
      {children}
    </TableBody>
  )
}
