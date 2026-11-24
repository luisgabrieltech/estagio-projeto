"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import NovoFormularioPage from "../page"
import { apiRequest } from "@/lib/utils/api-utils"
import { LoadingState } from "@/components/common/LoadingState/LoadingState"
import { ErrorState } from "@/components/common/ErrorState/ErrorState"
import { Card, CardContent } from "@/components/ui/card"
import type { Form } from "@/types/entities/form"
import type { FormBuilderData } from "@/hooks/forms/useFormBuilder"

/**
 * Convert Form entity to FormBuilderData format
 */
function formToBuilderData(form: Form): Partial<FormBuilderData> & { id: string } {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    category: form.category,
    status: form.status,
    deadline: form.deadline ?? null,
    estimatedTime: form.estimatedTime ?? null,
    generatesCertificate: form.generatesCertificate,
    certificateHours: form.certificateHours ?? null,
    questions: form.questions ?? [],
  }
}

export default function EditarFormularioPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [formData, setFormData] = useState<(Partial<FormBuilderData> & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchForm = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiRequest<Form>(`forms?id=${id}`)
      setFormData(formToBuilderData(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar formulário")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchForm()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <LoadingState 
              variant="spinner" 
              size="lg"
              message="Carregando formulário..." 
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !formData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ErrorState
          title="Erro ao carregar formulário"
          message={error || "Formulário não encontrado"}
          onRetry={fetchForm}
          action={
            <button
              onClick={() => router.push("/dashboard/admin/formularios")}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Voltar para lista
            </button>
          }
        />
      </div>
    )
  }

  return <NovoFormularioPage initialData={formData} />
} 