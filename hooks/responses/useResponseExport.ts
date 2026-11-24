"use client"

import { useState, useCallback } from "react"
import { ResponseFilters, ExportConfig, ExportResult } from "@/types/entities/response"
import { getApiUrl } from "@/lib/utils"

/**
 * Export format types supported by the API
 */
export type ExportFormat = 'csv' | 'excel'

/**
 * Export options for customizing the export
 */
export interface ExportOptions {
  /** Export file format */
  format: ExportFormat
  /** Whether to include raw data values */
  includeMetrics?: boolean
  /** Whether to include personal data (name, email) */
  includePersonalData?: boolean
  /** Specific question IDs to include (optional, all if not specified) */
  questionIds?: string[]
  /** Filters to apply to exported data */
  filters?: ResponseFilters
}

/**
 * Return type for the useResponseExport hook
 */
export interface UseResponseExportReturn {
  /** Whether an export is currently in progress */
  exporting: boolean
  /** Error message if export failed */
  error: string | null
  /** Last export result */
  lastExport: ExportResult | null
  /** Export data to CSV format */
  exportToCSV: (options?: Partial<ExportOptions>) => Promise<void>
  /** Export data to Excel format */
  exportToExcel: (options?: Partial<ExportOptions>) => Promise<void>
  /** Generic export function with full options */
  exportData: (options: ExportOptions) => Promise<void>
  /** Clear the last error */
  clearError: () => void
}

/**
 * Hook for managing response data exports
 * Provides functions to export form responses to CSV or Excel formats
 * 
 * @param formId - The ID of the form to export responses for
 * @returns Object containing export functions, loading state, and error handling
 * 
 * @example
 * ```tsx
 * const { 
 *   exporting, 
 *   error, 
 *   exportToCSV, 
 *   exportToExcel 
 * } = useResponseExport(formId)
 * 
 * // Export to CSV with default options
 * await exportToCSV()
 * 
 * // Export to Excel with filters
 * await exportToExcel({ 
 *   filters: { campus: ['Campus A'] },
 *   includePersonalData: false 
 * })
 * ```
 */
export function useResponseExport(formId: string): UseResponseExportReturn {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastExport, setLastExport] = useState<ExportResult | null>(null)

  /**
   * Builds query string from export options
   * 
   * @param options - Export options to convert to query string
   * @returns URL query string
   */
  const buildExportQueryString = useCallback((options: ExportOptions): string => {
    const params = new URLSearchParams()
    
    // Format
    params.set('format', options.format)
    
    // Include options
    if (options.includeMetrics !== undefined) {
      params.set('includeMetrics', String(options.includeMetrics))
    }
    if (options.includePersonalData !== undefined) {
      params.set('includePersonalData', String(options.includePersonalData))
    }
    
    // Question IDs
    if (options.questionIds && options.questionIds.length > 0) {
      params.set('questionIds', options.questionIds.join(','))
    }
    
    // Filters
    if (options.filters) {
      if (options.filters.campus && options.filters.campus.length > 0) {
        params.set('campus', options.filters.campus.join(','))
      }
      if (options.filters.course && options.filters.course.length > 0) {
        params.set('course', options.filters.course.join(','))
      }
      if (options.filters.userRole && options.filters.userRole.length > 0) {
        params.set('role', options.filters.userRole.join(','))
      }
      if (options.filters.responseDate?.from) {
        params.set('dateFrom', options.filters.responseDate.from.toISOString())
      }
      if (options.filters.responseDate?.to) {
        params.set('dateTo', options.filters.responseDate.to.toISOString())
      }
    }
    
    return params.toString()
  }, [])

  /**
   * Triggers a file download from a URL
   * 
   * @param url - The URL to download from
   * @param filename - Suggested filename for the download
   */
  const triggerDownload = useCallback((url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  /**
   * Generic export function that handles all export formats
   * 
   * @param options - Export configuration options
   */
  const exportData = useCallback(async (options: ExportOptions): Promise<void> => {
    if (!formId) {
      setError('ID do formulário não fornecido')
      return
    }

    try {
      setExporting(true)
      setError(null)
      
      const queryString = buildExportQueryString(options)
      const exportUrl = getApiUrl(`admin/responses/${formId}/export?${queryString}`)
      
      // Trigger download directly
      const filename = `export_${formId}_${new Date().toISOString().split('T')[0]}.${options.format === 'excel' ? 'xlsx' : 'csv'}`
      triggerDownload(exportUrl, filename)
      
      // Set last export result
      setLastExport({
        downloadUrl: exportUrl,
        filename,
        size: 0, // Size unknown for direct download
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000) // 1 hour expiry
      })
      
    } catch (err) {
      console.error('Erro ao exportar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro ao exportar dados')
    } finally {
      setExporting(false)
    }
  }, [formId, buildExportQueryString, triggerDownload])

  /**
   * Export data to CSV format
   * 
   * @param options - Optional export options (format will be set to 'csv')
   */
  const exportToCSV = useCallback(async (options?: Partial<ExportOptions>): Promise<void> => {
    await exportData({
      format: 'csv',
      includeMetrics: false,
      includePersonalData: false,
      ...options
    })
  }, [exportData])

  /**
   * Export data to Excel format
   * 
   * @param options - Optional export options (format will be set to 'excel')
   */
  const exportToExcel = useCallback(async (options?: Partial<ExportOptions>): Promise<void> => {
    await exportData({
      format: 'excel',
      includeMetrics: false,
      includePersonalData: false,
      ...options
    })
  }, [exportData])

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    exporting,
    error,
    lastExport,
    exportToCSV,
    exportToExcel,
    exportData,
    clearError
  }
}
