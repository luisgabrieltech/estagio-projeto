"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/PageHeader"
import { routes } from "@/lib/config/routes"

/**
 * FormListHeader Component
 * 
 * Header for the forms list page with title, description, and "New Form" button.
 * Uses the common PageHeader component for consistent styling.
 * 
 * @example
 * ```tsx
 * <FormListHeader />
 * ```
 */
export function FormListHeader() {
  return (
    <PageHeader
      title="Gestão de Formulários"
      description="Crie, edite e gerencie formulários de avaliação"
      actions={
        <Button className="bg-upe-blue hover:bg-upe-blue/90 text-white" asChild>
          <Link href={routes.dashboard.admin.forms.new}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Formulário
          </Link>
        </Button>
      }
    />
  )
}
