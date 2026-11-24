"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionAnalysis } from "./QuestionAnalysis"
import { QuestionStats } from "@/types/entities/response"
import { FileText } from "lucide-react"

interface QuestionsTabProps {
  questionStats: QuestionStats[]
  loading?: boolean
}

export function QuestionsTab({ questionStats, loading = false }: QuestionsTabProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise por Questão</CardTitle>
          <CardDescription>
            Estatísticas detalhadas de cada questão do formulário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-upe-blue mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Carregando análise das questões...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (questionStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise por Questão</CardTitle>
          <CardDescription>
            Estatísticas detalhadas de cada questão do formulário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma estatística disponível
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {questionStats.map((question) => (
        <QuestionAnalysis 
          key={question.questionId} 
          question={question}
          showDetailed={true}
        />
      ))}
    </div>
  )
}
