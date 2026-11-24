"use client"

import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { EvaluationForm } from "@/components/evaluations"
import { routes } from "@/lib/config/routes"
import { toast } from "sonner"

export default function ResponderAvaliacaoPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const handleSuccess = () => {
    toast.success("Avaliação enviada com sucesso!")
    router.push(routes.dashboard.evaluations.home)
  }

  const handleError = (error: Error) => {
    console.error("Error submitting evaluation:", error)
    toast.error("Erro ao enviar avaliação. Tente novamente.")
  }

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <EvaluationForm
          formId={formId}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </DashboardLayout>
  )
}
