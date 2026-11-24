import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SkeletonStats, SkeletonFormList } from "@/components/dashboard/skeleton-loaders"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="flex flex-wrap gap-1 mt-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>

        {/* Alert skeleton */}
        <Card className="mb-6 border-upe-blue/20 bg-upe-blue/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs skeleton */}
        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="visao-geral" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="mensagens" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="calendario" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Calendário
            </TabsTrigger>
          </TabsList>

          {/* Stats cards skeleton */}
          <SkeletonStats />

          {/* Recent forms section skeleton */}
          <div className="mt-6">
            <Skeleton className="h-7 w-48 mb-4" />
            <Skeleton className="h-4 w-64 mb-4" />
            
            <SkeletonFormList count={3} />

            <div className="mt-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
