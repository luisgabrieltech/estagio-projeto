"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserManagement } from "@/components/users/UserManagement"

export default function AdminUsuariosPage() {
  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <UserManagement />
      </div>
    </DashboardLayout>
  )
}
