import { ReactNode } from "react"
import { Table } from "@/components/ui/table"

/**
 * Props for the DataTable component
 */
export interface DataTableProps {
  /** Table content (header and body) */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * DataTable Component
 * 
 * Generic reusable table component that wraps the shadcn/ui Table component
 * with consistent styling and structure.
 * 
 * @example
 * ```tsx
 * <DataTable>
 *   <DataTableHeader>
 *     <DataTableRow>
 *       <DataTableCell header>Name</DataTableCell>
 *       <DataTableCell header>Email</DataTableCell>
 *     </DataTableRow>
 *   </DataTableHeader>
 *   <DataTableBody>
 *     {data.map(item => (
 *       <DataTableRow key={item.id}>
 *         <DataTableCell>{item.name}</DataTableCell>
 *         <DataTableCell>{item.email}</DataTableCell>
 *       </DataTableRow>
 *     ))}
 *   </DataTableBody>
 * </DataTable>
 * ```
 */
export function DataTable({ children, className = "" }: DataTableProps) {
  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        {children}
      </Table>
    </div>
  )
}
