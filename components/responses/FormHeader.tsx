"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Download, FileText, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FormDetails {
  id: string
  title: string
  description: string
  category: string
  status: string
  deadline?: Date
  estimatedTime?: string
  totalQuestions: number
  createdAt: Date
  createdBy: {
    name: string
    email: string
  }
}

interface FormHeaderProps {
  form: FormDetails
  onBack: () => void
  onRefresh: () => void
  onExport: () => void
  isRefreshing?: boolean
  isExporting?: boolean
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
    case 'DRAFT': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'CLOSED': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'Ativo'
    case 'DRAFT': return 'Rascunho'
    case 'CLOSED': return 'Encerrado'
    default: return status
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'DOCENTES': return 'Docentes'
    case 'DISCENTES': return 'Discentes'
    case 'EGRESSOS': return 'Egressos'
    case 'TECNICOS_UNIDADES': return 'Técnicos das Unidades'
    case 'TECNICOS_COMPLEXO': return 'Técnicos do Complexo'
    default: return category
  }
}

export function FormHeader({ 
  form, 
  onBack, 
  onRefresh, 
  onExport, 
  isRefreshing = false,
  isExporting = false 
}: FormHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
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
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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
        >
          <Clock className="h-4 w-4" />
          Atualizar
        </Button>
        <Button 
          variant="outline" 
          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          onClick={onExport}
          disabled={isExporting}
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>
    </div>
  )
}
