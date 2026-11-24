"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { FormList } from "@/components/forms/FormList"

export default function AdminFormulariosPage() {
  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <FormList />
      </div>
    </DashboardLayout>
  )
}
