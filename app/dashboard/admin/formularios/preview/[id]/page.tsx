'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { EvaluationPreview } from '@/components/forms/evaluation-preview'
import { apiRequest } from '@/lib/utils/api-utils'
import type { Form } from '@/types/entities/form'

export default function PreviewFormularioPage() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<{ id: string; form: Form | null } | null>(null)

  useEffect(() => {
    let active = true

    apiRequest<Form>(`forms?id=${encodeURIComponent(id)}`)
      .then(form => {
        if (active) setResult({ id, form })
      })
      .catch(() => {
        if (active) setResult({ id, form: null })
      })

    return () => { active = false }
  }, [id])

  const isLoading = result?.id !== id
  const form = !isLoading ? result.form : null

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        {isLoading ? (
          <p role="status">Carregando...</p>
        ) : form ? (
          <>
            <h1 className="mb-2 text-2xl font-bold text-upe-blue">Pré-visualização: {form.title}</h1>
            <p className="mb-6 text-muted-foreground">{form.description}</p>
            <EvaluationPreview key={form.id} questions={form.questions ?? []} />
          </>
        ) : (
          <p>Formulário não encontrado.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
