"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Download, FileText, Calendar, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { FormDetails } from "@/types/entities/response"

/**
 * Props for the ResponsesHeader component
 */
export interface ResponsesHeaderProps {
  /** Form details to display */
  form: FormDetails
  /** Callback when back button is clicked */
  onBack: () => void
  /** Callback when refresh button is clicked */
  onRefresh: () => void
  /** Callback when export button is clicked */
  onExport: () => void
  /** Whether data is currently being refreshed */
  isRefreshing?: boolean
  /** Whether data is currently being exported */
  isExporting?: boolean
}

/**
 * Gets the appropriate color classes for a form status
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
    case 'DRAFT': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'CLOSED': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Gets the display label for a form status
 */
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'ACTIVE': return 'Ativo'
    case 'DRAFT': return 'Rascunho'
    case 'CLOSED': return 'Encerrado'
    default: return status
  }
}

/**
 * Gets the display label for a form category
 */
const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'DOCENTES': return 'Docentes'
    case 'DISCENTES': return 'Discentes'
    case 'EGRESSOS': return 'Egressos'
    case 'TECNICOS_UNIDADES': return 'Técnicos das Unidades'
    case 'TECNICOS_COMPLEXO': return 'Técnicos do Complexo'
    default: return category
  }
}

/**
 * Header component for the responses dashboard
 * Displays form title, status, metadata, and action buttons
 * 
 * @example
 * ```tsx
 * <ResponsesHeader
 *   form={formDetails}
 *   onBack={() => router.back()}
 *   onRefresh={handleRefresh}
 *   onExport={handleExport}
 *   isRefreshing={loading}
 * />
 * ```
 */
export function ResponsesHeader({ 
  form, 
  onBack, 
  onRefresh, 
  onExport, 
  isRefreshing = false,
  isExporting = false 
}: ResponsesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-upe-blue">{form.title}</h1>
            <Badge className={getStatusColor(form.status)}>
              {getStatusLabel(form.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground">{form.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {getCategoryLabel(form.category)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Criado em {format(form.createdAt, "dd/MM/yyyy", { locale: ptBR })}
            </span>
            {form.deadline && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Prazo: {format(form.deadline, "dd/MM/yyyy", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Atualizar dados"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
        <Button 
          variant="outline" 
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          onClick={onExport}
          disabled={isExporting}
          aria-label="Exportar para CSV"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>
    </div>
  )
}
