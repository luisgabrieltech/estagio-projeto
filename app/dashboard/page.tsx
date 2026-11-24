"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, CheckCircle2, Clock, FileText, Info } from "lucide-react"
import { useSession } from "next-auth/react"
import { routes } from "@/lib/config/routes"
import { DASHBOARD_MESSAGES, CALENDAR_EVENTS } from "@/lib/config/dashboard-content"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useDashboard } from "@/hooks/dashboard"
import type { EvaluationForm } from "@/hooks/evaluations/useEvaluations"

export default function DashboardPage() {
  const { data: session } = useSession()
  
  const {
    pendingCount,
    completedCount,
    pendingForms,
    userFunctionalRolesWithLabels,
    loading,
  } = useDashboard()

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-upe-blue">
              Bem-vindo, {session?.user?.name || "Usuário"}
            </h1>
            <p className="text-muted-foreground">Confira suas avaliações e informações importantes.</p>
            {userFunctionalRolesWithLabels.length > 0 && (
              <TooltipProvider>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs text-muted-foreground self-center">Suas funções:</span>
                  {userFunctionalRolesWithLabels.map(({ value, label }: { value: string; label: string }) => (
                    <Tooltip key={value}>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center text-xs font-medium bg-upe-blue/10 text-upe-blue px-3 py-1.5 rounded-full border border-upe-blue/20 hover:bg-upe-blue/20 transition-colors cursor-help">
                          {label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Você verá formulários direcionados para <strong>{label}</strong>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>

        <Alert className="mb-6 border-upe-blue/20 bg-upe-blue/5">
          <Info className="h-4 w-4 text-upe-blue" />
          <AlertTitle className="text-upe-blue">Bem-vindo à plataforma de avaliações</AlertTitle>
          <AlertDescription>
            O sistema está em fase de implementação. Em breve iniciaremos um novo ciclo de avaliações.
          </AlertDescription>
        </Alert>

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

          <TabsContent value="visao-geral">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium">Avaliações Pendentes</h3>
                    <FileText className="h-4 w-4 text-upe-red" />
                  </div>
                  <div className="text-3xl font-bold text-upe-blue">
                    {loading ? "..." : pendingCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pendingCount > 0 ? "Você tem avaliações para responder" : "Nenhuma pendente"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium">Avaliações Concluídas</h3>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-upe-blue">
                    {loading ? "..." : completedCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {completedCount > 0 ? `+${completedCount} concluídas` : "Nenhuma concluída"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium">Próximo Evento</h3>
                    <Calendar className="h-4 w-4 text-upe-blue" />
                  </div>
                  <div className="text-lg font-bold text-upe-blue">Divulgação de Resultados</div>
                  <p className="text-xs text-muted-foreground">15/07/2023</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold text-upe-blue mb-4">Avaliações Recentes</h2>
              <p className="text-sm text-muted-foreground mb-4">Formulários disponíveis para preenchimento</p>

              <div className="space-y-4">
                {loading ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                      <div className="text-muted-foreground">Carregando avaliações...</div>
                    </CardContent>
                  </Card>
                ) : pendingForms.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <div className="text-muted-foreground mb-2">Nenhuma avaliação pendente</div>
                      {userFunctionalRolesWithLabels.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            Você tem acesso a formulários para:
                          </p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {userFunctionalRolesWithLabels.map(({ value, label }: { value: string; label: string }) => (
                              <span key={value} className="text-xs bg-upe-blue/10 text-upe-blue px-2 py-1 rounded-full">
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  pendingForms.map((form: EvaluationForm) => (
                    <Card key={form.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                          <div>
                            <h3 className="font-medium text-upe-blue">{form.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Prazo: {form.deadline ? new Date(form.deadline).toLocaleDateString() : "-"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Tempo estimado: {form.estimatedTime || "-"} min</span>
                            </div>
                            <Button size="sm" className="bg-upe-red hover:bg-upe-red/90 text-white" asChild>
                              <Link href={routes.dashboard.evaluations.respond(form.id)}>Responder</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={routes.dashboard.evaluations.home}>Ver todas as avaliações</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mensagens">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-upe-blue mb-4">Comunicados</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Informações sobre a participação nas avaliações
                </p>

                <div className="space-y-4">
                  {DASHBOARD_MESSAGES.map((message, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-upe-blue">{message.title}</h3>
                        <span className="text-xs text-muted-foreground">{message.date}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{message.content}</p>
                      {message.link && (
                        <Button variant="link" className="mt-1 h-auto p-0 text-upe-blue" asChild>
                          <Link href={message.link.url}>{message.link.text}</Link>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-upe-blue mb-4">Calendário de Avaliações</h2>
                <p className="text-sm text-muted-foreground mb-4">Datas importantes do processo avaliativo</p>

                <div className="space-y-4">
                  {CALENDAR_EVENTS.map((event, index) => (
                    <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-upe-blue/10 text-upe-blue">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="font-medium text-upe-blue">{event.title}</h3>
                          <span className="text-xs font-medium text-upe-red">{event.date}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
