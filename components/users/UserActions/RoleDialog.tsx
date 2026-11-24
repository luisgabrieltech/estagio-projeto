"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserCog, Loader2, AlertCircle } from "lucide-react"
import type { User } from "@/types/entities/user"
import { ROLE_LABELS } from "@/types/entities/user"

/**
 * Available role options for selection
 */
const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrador", description: "Acesso total ao sistema" },
  { value: "CSA", label: "CSA (Comissão Setorial de Avaliação)", description: "Gerencia formulários e respostas" },
  { value: "USER", label: "Usuário", description: "Acesso básico ao sistema" },
] as const

/**
 * Props for the RoleDialog component
 */
export interface RoleDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** User whose role will be changed */
  user: User | null
  /** Currently selected role */
  selectedRole: string
  /** Callback when role selection changes */
  onRoleChange: (role: string) => void
  /** Callback when role change is confirmed */
  onConfirm: () => void
  /** Whether the update operation is in progress */
  loading?: boolean
  /** Error message to display */
  error?: string | null
}

/**
 * RoleDialog Component
 * 
 * Dialog for changing a user's system role. Allows selection between
 * ADMIN, CSA, and USER roles with descriptions.
 * 
 * @example
 * ```tsx
 * <RoleDialog
 *   isOpen={isRoleDialogOpen}
 *   onOpenChange={setIsRoleDialogOpen}
 *   user={selectedUser}
 *   selectedRole={selectedRole}
 *   onRoleChange={setSelectedRole}
 *   onConfirm={handleConfirmRoleChange}
 *   loading={roleLoading}
 *   error={roleError}
 * />
 * ```
 */
export function RoleDialog({
  isOpen,
  onOpenChange,
  user,
  selectedRole,
  onRoleChange,
  onConfirm,
  loading = false,
  error = null,
}: RoleDialogProps) {
  const currentRoleLabel = user?.role ? ROLE_LABELS[user.role] || user.role : ""
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Definir Cargo
          </DialogTitle>
          <DialogDescription>
            Escolha o novo cargo para o usuário <b>{user?.name}</b>.
            {user?.role && (
              <span className="block mt-1 text-muted-foreground">
                Cargo atual: <b>{currentRoleLabel}</b>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <Select value={selectedRole} onValueChange={onRoleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  <div className="flex flex-col">
                    <span>{role.label}</span>
                    <span className="text-xs text-muted-foreground">{role.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
            disabled={loading || !selectedRole}
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
