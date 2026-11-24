"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, FileText, Search, RefreshCw, Loader2 } from "lucide-react"
import { useCertificates } from "@/hooks/certificates"
import { SkeletonCertificateCard } from "@/components/dashboard/skeleton-loaders"
import { useToast } from "@/components/ui/use-toast"
import { fetchWithRetry, getApiUrl } from "@/lib/utils"
import type { CertificateWithDetails } from "@/types/entities/certificate"

// Normalized certificate for display
interface DisplayCertificate {
  id: string
  formTitle: string
  completedAt: string
}

export default function CertificadosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { toast } = useToast()

  // Use React Query hook for certificates
  const {
    data: certificatesData,
    isLoading: loading,
    isFetching,
    refetch
  } = useCertificates()

  // Normalize certificates for display (handle different API response formats)
  const certificates: DisplayCertificate[] = useMemo(() => {
    if (!certificatesData) return []
    
    const rawCerts = Array.isArray(certificatesData) ? certificatesData : []
    
    return rawCerts.map((cert: CertificateWithDetails) => ({
      id: cert.id,
      // Handle both formats: { formTitle } or { form: { title } }
      formTitle: cert.metadata?.formTitle || cert.form?.title || 'Certificado',
      // Handle both formats: { completedAt } or { createdAt }
      completedAt: cert.metadata?.completionDate || cert.createdAt?.toString() || new Date().toISOString()
    }))
  }, [certificatesData])

  // Filter certificates by search query
  const filteredCertificates = useMemo(() => {
    if (!searchQuery) return certificates
    const lowerQuery = searchQuery.toLowerCase()
    return certificates.filter(cert =>
      cert.formTitle.toLowerCase().includes(lowerQuery)
    )
  }, [certificates, searchQuery])

  const isRefreshing = isFetching && !loading

  const handleRefresh = () => {
    refetch()
  }

  const handleDownload = async (certificateId: string, formTitle: string) => {
    setDownloadingId(certificateId)
    
    try {
      const loadingToast = toast({
        title: "Baixando certificado...",
        description: "Por favor, aguarde.",
      })

      const response = await fetchWithRetry(
        getApiUrl(`certificates/${certificateId}/download`),
        {
          maxRetries: 3,
          onRetry: (attempt: number) => {
            toast({
              title: `Tentativa ${attempt} de 3`,
              description: "Tentando novamente...",
            })
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ao baixar: ${response.status}`)
      }

      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado_${formTitle.replace(/\s/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      loadingToast.dismiss()
      toast({
        title: "Download concluído!",
        description: "Seu certificado foi baixado com sucesso.",
        variant: "default",
      })
    } catch (error) {
      console.error("Erro ao baixar certificado:", error)
      
      toast({
        title: "Erro ao baixar certificado",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">Certificados</h1>
            <p className="text-muted-foreground">Gerencie e baixe seus certificados de conclusão</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar certificados..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <>
              <SkeletonCertificateCard />
              <SkeletonCertificateCard />
              <SkeletonCertificateCard />
            </>
          ) : filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <Card key={certificate.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <h3 className="font-medium text-upe-blue">{certificate.formTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Concluído em: {new Date(certificate.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-upe-blue hover:bg-upe-blue/90 text-white"
                          onClick={() => handleDownload(certificate.id, certificate.formTitle)}
                          disabled={downloadingId === certificate.id}
                        >
                          {downloadingId === certificate.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Baixando...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Baixar Certificado
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum certificado encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Você ainda não possui certificados ou nenhum corresponde à sua busca.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
