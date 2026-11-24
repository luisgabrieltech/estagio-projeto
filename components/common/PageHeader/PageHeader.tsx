"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { PageTitle } from "./PageTitle"
import { PageDescription } from "./PageDescription"
import { PageActions } from "./PageActions"

/**
 * Interface for breadcrumb navigation items
 */
export interface Breadcrumb {
  /** Text label for the breadcrumb */
  label: string
  /** URL for the breadcrumb (optional - if not provided, won't be clickable) */
  href?: string
}

/**
 * Props for the PageHeader component
 */
export interface PageHeaderProps {
  /** Main page title */
  title: string
  /** Optional page description */
  description?: string
  /** Optional action elements (buttons, etc) displayed on the right */
  actions?: ReactNode
  /** Optional breadcrumbs for navigation */
  breadcrumbs?: Breadcrumb[]
  /** Additional CSS classes */
  className?: string
}

/**
 * PageHeader Component
 * 
 * Reusable page header component with support for:
 * - Title and description
 * - Actions (buttons, etc)
 * - Breadcrumbs for navigation
 * - Smooth animations
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="Gestão de Usuários"
 *   description="Gerencie os usuários do sistema"
 *   breadcrumbs={[
 *     { label: "Dashboard", href: "/dashboard" },
 *     { label: "Admin", href: "/dashboard/admin" },
 *     { label: "Usuários" }
 *   ]}
 *   actions={
 *     <Button>
 *       <Plus className="mr-2 h-4 w-4" />
 *       Novo Usuário
 *     </Button>
 *   }
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className = ""
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 ${className}`}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4" />
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <PageTitle>{title}</PageTitle>
          {description && (
            <PageDescription>{description}</PageDescription>
          )}
        </div>
        {actions && (
          <PageActions>{actions}</PageActions>
        )}
      </div>
    </motion.div>
  )
}
