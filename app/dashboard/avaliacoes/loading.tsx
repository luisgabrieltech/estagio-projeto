import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SkeletonFormList } from "@/components/dashboard/skeleton-loaders"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AvaliacoesLoading() {
  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        {/* Header with title and search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full md:w-64" />
        </div>

        {/* Tabs with skeleton content */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="available" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Disponíveis
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Concluídas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <SkeletonFormList count={3} />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <SkeletonFormList count={2} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
