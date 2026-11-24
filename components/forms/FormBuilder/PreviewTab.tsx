'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EvaluationPreview } from '@/components/forms/evaluation-preview'
import type { FormBuilderData } from '@/hooks/forms/useFormBuilder'

export interface PreviewTabProps {
  formData: FormBuilderData
}

export function PreviewTab({ formData }: PreviewTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{formData.title || 'Sem título'}</CardTitle>
          <CardDescription className="text-base">
            {formData.description || 'Sem descrição'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {formData.category && (
              <div>
                <span className="font-medium">Categoria:</span>{' '}
                <span className="text-muted-foreground">{formData.category}</span>
              </div>
            )}
            {formData.estimatedTime && (
              <div>
                <span className="font-medium">Tempo estimado:</span>{' '}
                <span className="text-muted-foreground">{formData.estimatedTime} minutos</span>
              </div>
            )}
            {formData.deadline && (
              <div>
                <span className="font-medium">Prazo:</span>{' '}
                <span className="text-muted-foreground">
                  {new Date(formData.deadline).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {formData.generatesCertificate && (
              <div>
                <span className="font-medium">Certificado:</span>{' '}
                <span className="text-muted-foreground">
                  {formData.certificateHours}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {formData.questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma pergunta adicionada ainda. Vá para a aba "Perguntas" para adicionar perguntas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <EvaluationPreview questions={formData.questions} />
      )}
    </div>
  )
}
