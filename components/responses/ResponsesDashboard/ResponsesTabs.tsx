"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "../OverviewTab"
import { QuestionsTab } from "../QuestionsTab"
import { TimelineTab } from "../TimelineTab"
import { FormMetrics, QuestionStats } from "@/types/entities/response"

/**
 * Props for the ResponsesTabs component
 */
export interface ResponsesTabsProps {
  /** Currently active tab */
  activeTab: string
  /** Callback when tab changes */
  onTabChange: (tab: string) => void
  /** Form metrics data */
  metrics: FormMetrics | null
  /** Array of question statistics */
  questionStats: QuestionStats[]
  /** Whether question stats are loading */
  questionStatsLoading?: boolean
}

/**
 * Tabs component for the responses dashboard
 * Provides navigation between Overview, Questions, and Timeline views
 * 
 * @example
 * ```tsx
 * <ResponsesTabs
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   metrics={metrics}
 *   questionStats={questionStats}
 *   questionStatsLoading={questionStatsLoading}
 * />
 * ```
 */
export function ResponsesTabs({ 
  activeTab, 
  onTabChange, 
  metrics, 
  questionStats,
  questionStatsLoading = false
}: ResponsesTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="bg-muted/50">
        <TabsTrigger 
          value="overview" 
          className="data-[state=active]:bg-upe-blue data-[state=active]:text-white"
        >
          Visão Geral
        </TabsTrigger>
        <TabsTrigger 
          value="questions" 
          className="data-[state=active]:bg-upe-blue data-[state=active]:text-white"
        >
          Por Questão
        </TabsTrigger>
        <TabsTrigger 
          value="timeline" 
          className="data-[state=active]:bg-upe-blue data-[state=active]:text-white"
        >
          Linha do Tempo
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <OverviewTab metrics={metrics} />
      </TabsContent>

      <TabsContent value="questions" className="space-y-6">
        <QuestionsTab 
          questionStats={questionStats} 
          loading={questionStatsLoading} 
        />
      </TabsContent>

      <TabsContent value="timeline" className="space-y-6">
        <TimelineTab metrics={metrics} />
      </TabsContent>
    </Tabs>
  )
}
