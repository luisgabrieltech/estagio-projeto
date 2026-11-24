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
import { AlertTriangle, Loader2 } from "lucide-react"
import type { User } from "@/types/entities/user"

/**
 * Props for the DeleteUserDialog component
 */
export interface DeleteUserDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** User to be deleted (for display purposes) */
  user: User | null
  /** Callback when deletion is confirmed */
  onConfirm: () => void
  /** Whether the delete operation is in progress */
  loading?: boolean
  /** Error message to display */
  error?: string | null
}

/**
 * DeleteUserDialog Component
 * 
 * Dialog for confirming user deletion. Displays a warning message
 * and requires explicit confirmation before proceeding.
 * 
 * @example
 * ```tsx
 * <DeleteUserDialog
 *   isOpen={isDeleteDialogOpen}
 *   onOpenChange={setIsDeleteDialogOpen}
 *   user={selectedUser}
 *   onConfirm={handleConfirmDelete}
 *   loading={deleteLoading}
 *   error={deleteError}
 * />
 * ```
 */
export function DeleteUserDialog({
  isOpen,
  onOpenChange,
  user,
  onConfirm,
  loading = false,
  error = null,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-upe-red">
            <AlertTriangle className="h-5 w-5" />
            Confirmar exclusão
          </DialogTitle>
          <DialogDescription>
            Você está prestes a excluir um usuário. Esta ação não pode ser desfeita e todos os dados associados
            serão perdidos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {user && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          )}
          <p className="text-sm font-medium">Tem certeza que deseja excluir este usuário?</p>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Sim, excluir usuário"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
