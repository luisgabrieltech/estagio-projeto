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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { routes } from "@/lib/config/routes"
import { apiRequest } from "@/lib/utils/api-utils"

interface Form {
  id: string
  title: string
  description?: string
  status: string
  externalStatus: string
  createdAt: string
  deadline?: string
  estimatedTime?: number
  respondentCount?: number
}

interface FormTableProps {
  forms: Form[]
  loading: boolean
  onDelete: (formId: string, formName: string) => void
  onVisibility: (form: Form) => void
}

export function FormTable({ forms, loading, onDelete, onVisibility }: FormTableProps) {
  const handleDownloadJSON = async (form: Form) => {
    try {
      const data = await apiRequest<Form>(`forms?id=${form.id}`)
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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-upe-blue"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (forms.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
            <FileText className="h-8 w-8 mb-2" />
            <p>Nenhum formulário encontrado</p>
            <p className="text-sm text-center px-4">Tente ajustar os filtros ou criar um novo formulário</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status Interno</TableHead>
              <TableHead>Status Externo</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Tempo Estimado</TableHead>
              <TableHead>Respostas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => {
              const criadoEm = form.createdAt ? format(new Date(form.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"
              const prazo = form.deadline ? format(new Date(form.deadline), "dd/MM/yyyy", { locale: ptBR }) : "-"
              const tempoEstimado = form.estimatedTime ? `${form.estimatedTime} min` : "-"
              
              return (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{form.title}</span>
                      {form.description && (
                        <span className="text-xs text-muted-foreground">{form.description}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={form.status} />
                  </TableCell>
                  <TableCell>
                    <ExternalStatusBadge status={form.externalStatus} />
                  </TableCell>
                  <TableCell>{criadoEm}</TableCell>
                  <TableCell>{prazo}</TableCell>
                  <TableCell>{tempoEstimado}</TableCell>
                  <TableCell>{form.respondentCount || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={`${routes.dashboard.admin.forms.home}/preview/${form.id}`} target="_blank" rel="noopener noreferrer">
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
                        <DropdownMenuItem onClick={() => handleDownloadJSON(form)}>
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
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {forms.map((form) => {
          const criadoEm = form.createdAt ? format(new Date(form.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"
          const prazo = form.deadline ? format(new Date(form.deadline), "dd/MM/yyyy", { locale: ptBR }) : "-"
          const tempoEstimado = form.estimatedTime ? `${form.estimatedTime} min` : "-"
          
          return (
            <Card key={form.id} className="overflow-hidden">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={`${routes.dashboard.admin.forms.home}/preview/${form.id}`} target="_blank" rel="noopener noreferrer">
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
                      <DropdownMenuItem onClick={() => handleDownloadJSON(form)}>
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
        })}
      </div>
    </>
  )
}

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
