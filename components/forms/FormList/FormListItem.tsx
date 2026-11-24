"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  FileText,
  Calendar,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableRow } from "@/components/common/DataTable/DataTableRow"
import { DataTableCell } from "@/components/common/DataTable/DataTableCell"
import { routes } from "@/lib/config/routes"
import { apiRequest } from "@/lib/utils/api-utils"

/**
 * Form data interface for table display
 */
export interface FormTableData {
  id: string
  title: string
  description: string
  status: string
  externalStatus: string
  createdAt: Date
  deadline?: Date | null
  estimatedTime?: string | null
  respondentCount?: number
  visibleToRoles: string[]
  _count?: {
    questions?: number
  }
}

/**
 * Props for the FormListItem component
 */
export interface FormListItemProps {
  /** Form data to display */
  form: FormTableData
  /** Callback when delete is clicked */
  onDelete: (formId: string, formName: string) => void
  /** Callback when visibility is clicked */
  onVisibility: (form: FormTableData) => void
  /** Optional callback when form is selected */
  onSelect?: (formId: string) => void
  /** Display variant - table row or card */
  variant?: "row" | "card"
}

/**
 * FormListItem Component
 * 
 * Renders a single form item as either a table row (desktop) or card (mobile).
 * Includes actions dropdown with view, edit, visibility, download, and delete options.
 */
export function FormListItem({
  form,
  onDelete,
  onVisibility,
  onSelect,
  variant = "row",
}: FormListItemProps) {
  /**
   * Download form as JSON
   */
  const handleDownloadJSON = async () => {
    try {
      const data = await apiRequest<FormTableData>(`forms?id=${form.id}`)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `formulario-${form.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao baixar formulário')
    }
  }

  // Format dates
  const criadoEm = form.createdAt 
    ? format(new Date(form.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) 
    : "-"
  const prazo = form.deadline 
    ? format(new Date(form.deadline), "dd/MM/yyyy", { locale: ptBR }) 
    : "-"
  const tempoEstimado = form.estimatedTime 
    ? `${form.estimatedTime} min` 
    : "-"

  // Actions dropdown menu
  const actionsMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a 
            href={`${routes.dashboard.admin.forms.home}/preview/${form.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>Visualizar</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${routes.dashboard.admin.forms.new}/${form.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onVisibility(form)}>
          <Users className="mr-2 h-4 w-4 text-upe-blue" />
          <span>Gerenciar visibilidade</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadJSON}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Baixar JSON</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-upe-red focus:text-upe-red"
          onClick={() => onDelete(form.id, form.title)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Card variant for mobile
  if (variant === "card") {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2">{form.title}</CardTitle>
              {form.description && (
                <CardDescription className="text-sm mt-1 line-clamp-2">
                  {form.description}
                </CardDescription>
              )}
            </div>
            {actionsMenu}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={form.status} />
            <ExternalStatusBadge status={form.externalStatus} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs">Criado em</div>
                <div className="font-medium text-foreground truncate">{criadoEm}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs">Prazo</div>
                <div className="font-medium text-foreground truncate">{prazo}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs">Tempo Est.</div>
                <div className="font-medium text-foreground">{tempoEstimado}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs">Respostas</div>
                <div className="font-medium text-foreground">{form.respondentCount || 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Row variant for desktop table
  return (
    <DataTableRow>
      <DataTableCell>
        <div className="flex flex-col">
          <span className="font-medium">{form.title}</span>
          {form.description && (
            <span className="text-xs text-muted-foreground">{form.description}</span>
          )}
        </div>
      </DataTableCell>
      <DataTableCell>
        <StatusBadge status={form.status} />
      </DataTableCell>
      <DataTableCell>
        <ExternalStatusBadge status={form.externalStatus} />
      </DataTableCell>
      <DataTableCell>{criadoEm}</DataTableCell>
      <DataTableCell>{prazo}</DataTableCell>
      <DataTableCell>{tempoEstimado}</DataTableCell>
      <DataTableCell>{form.respondentCount || 0}</DataTableCell>
      <DataTableCell align="right">
        {actionsMenu}
      </DataTableCell>
    </DataTableRow>
  )
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
    case "ACTIVE":
      return <Badge className="bg-green-500 hover:bg-green-600">Pronto</Badge>
    case "draft":
    case "DRAFT":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Desenvolvimento
        </Badge>
      )
    case "closed":
    case "CLOSED":
      return (
        <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
          Encerrado
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

/**
 * External status badge component
 */
function ExternalStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "AVAILABLE":
      return <Badge className="bg-green-500 hover:bg-green-600">Disponível</Badge>
    case "HIDDEN":
      return <Badge variant="outline" className="text-muted-foreground">Oculto</Badge>
    case "FROZEN":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Congelado</Badge>
    case "SCHEDULED":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Agendado</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
