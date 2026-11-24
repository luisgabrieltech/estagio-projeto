"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { routes } from "@/lib/config/routes"
import { apiRequest, getApiUrl } from "@/lib/utils/api-utils"
import { LoadingState } from "@/components/common/LoadingState"
import { ResponsesHeader } from "./ResponsesHeader"
import { ResponsesFilters } from "./ResponsesFilters"
import { ResponsesStats } from "./ResponsesStats"
import { ResponsesTabs } from "./ResponsesTabs"
import { useResponseFilters, useResponseStats } from "@/hooks/responses"
import type { ResponseFilters, FormDetails } from "@/types/entities/response"

export interface ResponsesDashboardProps {
  formId: string
}

export function ResponsesDashboard({ formId }: ResponsesDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  
  const { data: formData, isLoading: formLoading } = useQuery({
    queryKey: ['forms', formId],
    queryFn: () => apiRequest<FormDetails>(`forms?id=${formId}`),
    enabled: !!formId
  })

  const form = formData
  const loading = formLoading

  const { 
    filters, 
    filterOptions, 
    loading: filtersLoading, 
    updateFilters 
  } = useResponseFilters(formId)
  const {
    metrics,
    questionStats,
    metricsLoading,
    questionStatsLoading,
    fetchMetrics,
    fetchQuestionStats,
    refreshData,
    resetLoadedState
  } = useResponseStats(formId)

  useEffect(() => {
    if (!formId) return
    
    if (activeTab === "overview") {
      fetchMetrics(filters)
    } else if (activeTab === "questions") {
      fetchQuestionStats(filters)
    }
  }, [formId, activeTab, fetchMetrics, fetchQuestionStats, filters])

  const handleFiltersChange = useCallback((newFilters: ResponseFilters) => {
    updateFilters(newFilters)
    resetLoadedState()
    
    if (activeTab === "overview") {
      fetchMetrics(newFilters)
    } else if (activeTab === "questions") {
      fetchQuestionStats(newFilters)
    }
  }, [activeTab, updateFilters, resetLoadedState, fetchMetrics, fetchQuestionStats])
  
  const handleRefreshData = useCallback(() => {
    refreshData(filters, activeTab)
  }, [refreshData, filters, activeTab])

  const handleBack = useCallback(() => {
    router.push(routes.dashboard.admin.responses.home)
  }, [router])

  const handleExport = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set('format', 'csv')
      params.set('includePersonalData', 'false')
      
      const exportUrl = getApiUrl(`admin/responses/${formId}/export?${params.toString()}`)
      
      const link = document.createElement('a')
      link.href = exportUrl
      link.download = `export.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Erro ao exportar:', error)
    }
  }, [formId])

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])

  if (loading) {
    return (
      <div className="w-full p-4 md:p-6">
        <LoadingState message="Carregando dados do formulário..." size="lg" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Formulário não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O formulário solicitado não existe ou você não tem permissão para acessá-lo.
            </p>
            <Button onClick={handleBack}>
              Voltar para Gestão de Respostas
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ResponsesHeader
          form={form}
          onBack={handleBack}
          onRefresh={handleRefreshData}
          onExport={handleExport}
          isRefreshing={metricsLoading || questionStatsLoading}
          isExporting={loading}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ResponsesFilters
          filters={filters}
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          loading={filtersLoading}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ResponsesStats metrics={metrics} loading={metricsLoading} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ResponsesTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          metrics={metrics}
          questionStats={questionStats}
          questionStatsLoading={questionStatsLoading}
        />
      </motion.div>
    </div>
  )
}
