import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SkeletonCertificateCard } from "@/components/dashboard/skeleton-loaders"
import { Skeleton } from "@/components/ui/skeleton"

export default function CertificadosLoading() {
  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-10 w-64" />
          </div>
        </div>

        <div className="space-y-4">
          <SkeletonCertificateCard />
          <SkeletonCertificateCard />
          <SkeletonCertificateCard />
        </div>
      </div>
    </DashboardLayout>
  )
}
