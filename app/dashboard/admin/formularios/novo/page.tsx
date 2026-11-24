"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { FormBuilder } from "@/components/forms/FormBuilder/FormBuilder"
import { routes } from "@/lib/config/routes"
import type { FormBuilderData } from "@/hooks/forms/useFormBuilder"

interface NovoFormularioPageProps {
  initialData?: Partial<FormBuilderData> & { id?: string }
}

export default function NovoFormularioPage({ initialData }: NovoFormularioPageProps) {
  const router = useRouter()

  const handleSave = () => {
    router.push(routes.dashboard.admin.forms.home)
  }

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <FormBuilder
          formId={initialData?.id}
          initialData={initialData}
          onSave={handleSave}
        />
      </div>
    </DashboardLayout>
  )
}
