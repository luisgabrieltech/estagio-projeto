"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { routes } from "@/lib/config/routes"
import type { EvaluationForm } from "@/hooks/evaluations/useEvaluations"

/**
 * Props for the EvaluationCard component
 */
export interface EvaluationCardProps {
  /** The evaluation form data */
  form: EvaluationForm
  /** Whether this evaluation has been completed by the user */
  isCompleted?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * EvaluationCard Component
 * 
 * Displays a single evaluation card with title, description, deadline,
 * estimated time, and action button.
 * 
 * @example
 * ```tsx
 * <EvaluationCard 
 *   form={evaluationForm} 
 *   isCompleted={false} 
 * />
 * ```
 */
export function EvaluationCard({ 
  form, 
  isCompleted = false,
  className = "" 
}: EvaluationCardProps) {
  const isAvailable = form.externalStatus === "AVAILABLE"
  const isFrozen = form.externalStatus === "FROZEN"
  const isScheduled = form.externalStatus === "SCHEDULED"

  const formattedDeadline = form.deadline 
    ? new Date(form.deadline).toLocaleDateString('pt-BR')
    : null

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Title and Description */}
          <div>
            <h3 className="font-medium text-upe-blue">{form.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {form.description}
            </p>
          </div>

          {/* Meta info and Action */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-4">
              {/* Deadline */}
              {formattedDeadline && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Prazo: {formattedDeadline}</span>
                </div>
              )}

              {/* Estimated Time */}
              {form.estimatedTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Tempo estimado: {form.estimatedTime} min</span>
                </div>
              )}

              {/* Status Badges */}
              {isFrozen && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Congelado para respostas
                </Badge>
              )}
              {isScheduled && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  Em breve
                </Badge>
              )}

              {/* Completed indicator */}
              {isCompleted && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>Você já respondeu esta avaliação.</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {!isCompleted && (
              isAvailable ? (
                <Button 
                  className="bg-upe-blue hover:bg-upe-blue/90 text-white" 
                  asChild
                >
                  <Link href={routes.dashboard.evaluations.respond(form.id)}>
                    Responder
                  </Link>
                </Button>
              ) : (
                <Button disabled variant="outline">
                  Indisponível
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
