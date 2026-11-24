'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { FormBuilderData } from '@/hooks/forms/useFormBuilder'

/**
 * Props for BasicInfoTab component
 */
export interface BasicInfoTabProps {
  /** Current form data */
  formData: FormBuilderData
  
  /** Callback when form data is updated */
  onUpdate: (data: Partial<FormBuilderData>) => void
}

/**
 * Category labels for display
 */
const CATEGORY_LABELS: Record<string, string> = {
  DOCENTES: 'Docentes',
  DISCENTES: 'Discentes',
  EGRESSOS: 'Egressos',
  TECNICOS_UNIDADES: 'Técnicos das Unidades',
  TECNICOS_COMPLEXO: 'Técnicos do Complexo'
}

/**
 * Convert Date to datetime-local input format (YYYY-MM-DDTHH:mm)
 * Preserves local timezone without UTC conversion
 */
function dateToLocalInputValue(date: Date | null): string {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Convert datetime-local input value to Date
 * Preserves local timezone
 */
function localInputValueToDate(value: string): Date | null {
  if (!value) return null
  return new Date(value)
}

/**
 * BasicInfoTab component
 * 
 * Form for editing basic form information including:
 * - Title and description
 * - Category
 * - Deadline and estimated time
 * - Certificate settings
 * 
 * @param props - Component props
 * @returns BasicInfoTab component
 */
export function BasicInfoTab({ formData, onUpdate }: BasicInfoTabProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-lg">Informações Gerais</CardTitle>
          <CardDescription className="text-sm">
            Configure as informações básicas do formulário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-semibold">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Digite o título do formulário (mínimo 3 caracteres)"
              required
              className="text-base"
            />
            {formData.title && formData.title.length < 3 && (
              <p className="text-sm text-destructive">
                Título deve ter pelo menos 3 caracteres ({formData.title.length}/3)
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-semibold">
              Descrição <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Digite a descrição do formulário (mínimo 10 caracteres)"
              rows={5}
              required
              className="resize-none"
            />
            {formData.description && formData.description.length < 10 && (
              <p className="text-sm text-destructive">
                Descrição deve ter pelo menos 10 caracteres ({formData.description.length}/10)
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="category" className="text-sm font-semibold">
              Categoria <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => onUpdate({ category: value })}
            >
              <SelectTrigger id="category" className="text-base">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-lg">Configurações de Prazo</CardTitle>
          <CardDescription className="text-sm">
            Defina prazos e tempo estimado para resposta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label htmlFor="deadline" className="text-sm font-semibold">
              Prazo Final
            </Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={dateToLocalInputValue(formData.deadline)}
              onChange={(e) => onUpdate({ 
                deadline: localInputValueToDate(e.target.value)
              })}
              className="text-base"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="estimatedTime" className="text-sm font-semibold">
              Tempo Estimado (minutos)
            </Label>
            <Input
              id="estimatedTime"
              type="number"
              min="1"
              value={formData.estimatedTime || ''}
              onChange={(e) => onUpdate({ 
                estimatedTime: e.target.value || null 
              })}
              placeholder="Ex: 15"
              className="text-base"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-lg">Certificado</CardTitle>
          <CardDescription className="text-sm">
            Configure se este formulário gera certificado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="space-y-1">
              <Label htmlFor="generatesCertificate" className="text-sm font-semibold cursor-pointer">
                Gerar Certificado
              </Label>
              <p className="text-xs text-muted-foreground">
                Emitir certificado ao concluir este formulário
              </p>
            </div>
            <Switch
              id="generatesCertificate"
              checked={formData.generatesCertificate}
              onCheckedChange={(checked) => onUpdate({ generatesCertificate: checked })}
            />
          </div>

          {formData.generatesCertificate && (
            <div className="space-y-3">
              <Label htmlFor="certificateHours" className="text-sm font-semibold">
                Carga Horária (horas) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="certificateHours"
                type="number"
                min="1"
                value={formData.certificateHours || ''}
                onChange={(e) => onUpdate({ 
                  certificateHours: e.target.value || null 
                })}
                placeholder="Ex: 8"
                required={formData.generatesCertificate}
                className="text-base"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
