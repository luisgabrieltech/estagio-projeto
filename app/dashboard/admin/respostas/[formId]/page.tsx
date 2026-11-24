"use client"

import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ResponsesDashboard } from "@/components/responses"

export default function FormResponsesPage() {
  const params = useParams()
  const formId = params.formId as string

  return (
    <DashboardLayout>
      <ResponsesDashboard formId={formId} />
    </DashboardLayout>
  )
}
