"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { FUNCTIONAL_ROLES_OPTIONS } from "@/lib/utils"
import type { User } from "@/types/entities/user"

/**
 * Props for the FunctionalRolesDialog component
 */
export interface FunctionalRolesDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** User whose functional roles will be changed */
  user: User | null
  /** Currently selected functional roles */
  selectedRoles: string[]
  /** Callback when roles selection changes */
  onRolesChange: (roles: string[]) => void
  /** Callback when roles change is confirmed */
  onConfirm: () => void
  /** Whether the update operation is in progress */
  loading?: boolean
  /** Error message to display */
  error?: string | null
}

/**
 * FunctionalRolesDialog Component
 * 
 * Dialog for managing a user's functional roles. Allows multiple selection
 * of roles like DOCENTE, DISCENTE, EGRESSO, etc.
 * 
 * @example
 * ```tsx
 * <FunctionalRolesDialog
 *   isOpen={isFunctionalRolesDialogOpen}
 *   onOpenChange={setIsFunctionalRolesDialogOpen}
 *   user={selectedUser}
 *   selectedRoles={selectedFunctionalRoles}
 *   onRolesChange={setSelectedFunctionalRoles}
 *   onConfirm={handleConfirmFunctionalRolesChange}
 *   loading={functionalRolesLoading}
 *   error={functionalRolesError}
 * />
 * ```
 */
export function FunctionalRolesDialog({
  isOpen,
  onOpenChange,
  user,
  selectedRoles,
  onRolesChange,
  onConfirm,
  loading = false,
  error = null,
}: FunctionalRolesDialogProps) {
  /**
   * Handle checkbox change for a role
   */
  const handleRoleToggle = (roleValue: string, checked: boolean) => {
    if (checked) {
      onRolesChange([...selectedRoles, roleValue])
    } else {
      onRolesChange(selectedRoles.filter((r) => r !== roleValue))
    }
  }

  /**
   * Get selected roles labels for display
   */
  const getSelectedRolesLabels = () => {
    return FUNCTIONAL_ROLES_OPTIONS
      .filter((r) => selectedRoles.includes(r.value))
      .map((r) => r.label)
      .join(", ")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Cargos Funcionais
          </DialogTitle>
          <DialogDescription>
            Escolha os cargos funcionais para o usuário <b>{user?.name}</b>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Roles Checkboxes */}
          <div className="grid grid-cols-1 gap-2 border rounded-lg p-3 bg-muted/20">
            {FUNCTIONAL_ROLES_OPTIONS.map((role) => (
              <label
                key={role.value}
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
              >
                <Checkbox
                  checked={selectedRoles.includes(role.value)}
                  onCheckedChange={(checked) => handleRoleToggle(role.value, checked as boolean)}
                  id={`functional-role-${role.value}`}
                />
                <span className="flex-1">{role.label}</span>
              </label>
            ))}
          </div>
          
          {/* Selection Summary */}
          <div className="text-sm">
            {selectedRoles.length === 0 ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>Usuário não terá acesso a nenhum formulário específico</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Usuário terá acesso a formulários para: <b>{getSelectedRolesLabels()}</b>
                </span>
              </div>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            className="bg-upe-blue hover:bg-upe-blue/90 text-white" 
            onClick={onConfirm} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
