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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type { User } from "@/types/entities/user"

/**
 * Props for the ResetPasswordDialog component
 */
export interface ResetPasswordDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** User whose password will be reset */
  user: User | null
  /** Callback when reset is confirmed */
  onConfirm: () => void
  /** Whether the reset operation is in progress */
  loading?: boolean
  /** Success message to display */
  success?: string | null
  /** Error message to display */
  error?: string | null
}

/**
 * ResetPasswordDialog Component
 * 
 * Dialog for confirming password reset. Sends a reset email to the user
 * and displays loading, success, and error states.
 * 
 * @example
 * ```tsx
 * <ResetPasswordDialog
 *   isOpen={isResetPasswordDialogOpen}
 *   onOpenChange={setIsResetPasswordDialogOpen}
 *   user={selectedUser}
 *   onConfirm={handleConfirmResetPassword}
 *   loading={resetPasswordLoading}
 *   success={resetPasswordSuccess}
 *   error={resetPasswordError}
 * />
 * ```
 */
export function ResetPasswordDialog({
  isOpen,
  onOpenChange,
  user,
  onConfirm,
  loading = false,
  success = null,
  error = null,
}: ResetPasswordDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Redefinir senha
          </DialogTitle>
          <DialogDescription>
            Você está prestes a redefinir a senha deste usuário. Uma nova senha será gerada e enviada para o e-mail
            do usuário.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {user && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          )}
          
          <p className="text-sm font-medium">Tem certeza que deseja redefinir a senha deste usuário?</p>
          
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {success ? "Fechar" : "Cancelar"}
          </Button>
          {!success && (
            <Button
              className="bg-upe-blue hover:bg-upe-blue/90 text-white"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Sim, redefinir senha"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
