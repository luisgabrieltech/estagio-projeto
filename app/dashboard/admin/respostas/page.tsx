"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  BarChart3, 
  Users, 
  Clock, 
  Calendar,
  FileText,
  Filter,
  Download,
  TrendingUp
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { routes } from "@/lib/config/routes"
import { useRouter } from "next/navigation"
import { FormWithStats } from "@/types/entities/form"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formsCache, TTL } from "@/lib/utils"
import { apiRequest } from "@/lib/utils/api-utils"

export default function AdminRespostasPage() {
  const router = useRouter()
  const [forms, setForms] = useState<FormWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const fetchFormsWithStats = async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      // Verificar cache primeiro (a menos que seja refresh forçado)
      const cacheKey = 'admin-forms-list'
      if (!forceRefresh) {
        const cachedData = formsCache.get(cacheKey)
        
        if (cachedData) {
          setForms(cachedData as FormWithStats[])
          setLoading(false)
          return
        }
      }
      
      // Se não houver cache ou for refresh forçado, buscar do servidor
      const data = await apiRequest<FormWithStats[]>('admin/responses/forms-stats')
      const formsList = Array.isArray(data) ? data : []
      setForms(formsList)
      
      // Armazenar no cache (TTL: 2 minutos)
      formsCache.set(cacheKey, formsList, TTL.TWO_MINUTES)
    } catch (error) {
      console.error('Erro ao carregar formulários:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    formsCache.delete('admin-forms-list')
    fetchFormsWithStats(true)
  }

  useEffect(() => {
    fetchFormsWithStats()
  }, [])

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || form.status === statusFilter
    const matchesCategory = categoryFilter === "all" || form.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-upe-blue mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando formulários...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">Gestão de Respostas</h1>
            <p className="text-muted-foreground">
              Analise respostas, gere relatórios e visualize métricas dos formulários
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              <Clock className="h-4 w-4" />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar formulários..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="ACTIVE">Ativo</SelectItem>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="CLOSED">Encerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      <SelectItem value="DOCENTES">Docentes</SelectItem>
                      <SelectItem value="DISCENTES">Discentes</SelectItem>
                      <SelectItem value="EGRESSOS">Egressos</SelectItem>
                      <SelectItem value="TECNICOS_UNIDADES">Técnicos das Unidades</SelectItem>
                      <SelectItem value="TECNICOS_COMPLEXO">Técnicos do Complexo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Formulários */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredForms.length === 0 ? (
            <motion.div variants={item} className="col-span-full">
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum formulário encontrado</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                    ? "Tente ajustar os filtros para ver mais resultados."
                    : "Não há formulários disponíveis no momento."}
                </p>
              </Card>
            </motion.div>
          ) : (
            filteredForms.map((form) => (
              <motion.div key={form.id} variants={item}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-upe-blue transition-colors">
                          {form.title}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {form.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(form.status)}>
                        {getStatusLabel(form.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(form.category)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Métricas principais */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-blue-600 mr-1" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{form.totalResponses}</div>
                        <div className="text-xs text-blue-600">Respostas</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {form.responseRate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-green-600">Taxa de Resposta</div>
                      </div>
                    </div>

                    {/* Informações adicionais */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{form.totalQuestions} questões</span>
                      </div>
                      {form.deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Prazo: {format(new Date(form.deadline), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                      )}
                      {form.lastResponse && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            Última resposta: {format(new Date(form.lastResponse), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-upe-blue hover:bg-upe-blue/90"
                        onClick={() => router.push(routes.dashboard.admin.responses.view(form.id))}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Ver Respostas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
