import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * Props for the DataTablePagination component
 */
export interface DataTablePaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Total number of items */
  totalItems: number
  /** Number of items per page */
  pageSize: number
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * DataTablePagination Component
 * 
 * Pagination controls for DataTable with page navigation and item count display.
 * 
 * @example
 * ```tsx
 * <DataTablePagination
 *   currentPage={1}
 *   totalPages={10}
 *   totalItems={100}
 *   pageSize={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * ```
 */
export function DataTablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = ""
}: DataTablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)
  
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages
  
  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t ${className}`}>
      <div className="text-sm text-muted-foreground">
        Mostrando <span className="font-medium">{startItem}</span> a{" "}
        <span className="font-medium">{endItem}</span> de{" "}
        <span className="font-medium">{totalItems}</span> resultados
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Página <span className="font-medium">{currentPage}</span> de{" "}
          <span className="font-medium">{totalPages}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
