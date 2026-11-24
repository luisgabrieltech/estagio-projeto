"use client"

import { AlertTriangle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FUNCTIONAL_ROLES_OPTIONS } from "@/lib/utils"

interface FormActionsProps {
  // Delete dialog props
  isDeleteDialogOpen: boolean
  deleteFormName: string
  deleteConfirmInput: string
  onDeleteDialogChange: (open: boolean) => void
  onDeleteConfirmInputChange: (value: string) => void
  onConfirmDelete: () => void
  
  // Visibility dialog props
  isVisibilityDialogOpen: boolean
  selectedRoles: string[]
  selectedStatus: string
  isUpdating: boolean
  onVisibilityDialogChange: (open: boolean) => void
  onRolesChange: (roles: string[]) => void
  onStatusChange: (status: string) => void
  onSaveVisibility: () => void
}

export function FormActions({
  isDeleteDialogOpen,
  deleteFormName,
  deleteConfirmInput,
  onDeleteDialogChange,
  onDeleteConfirmInputChange,
  onConfirmDelete,
  isVisibilityDialogOpen,
  selectedRoles,
  selectedStatus,
  isUpdating,
  onVisibilityDialogChange,
  onRolesChange,
  onStatusChange,
  onSaveVisibility,
}: FormActionsProps) {
  const roles = FUNCTIONAL_ROLES_OPTIONS

  const handleRoleToggle = (roleValue: string, checked: boolean) => {
    if (checked) {
      onRolesChange([...selectedRoles, roleValue])
    } else {
      onRolesChange(selectedRoles.filter(r => r !== roleValue))
    }
  }

  return (
    <>
      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-upe-red">
              <AlertTriangle className="h-5 w-5" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-upe-red">Atenção!</span><br />
              Você está prestes a excluir o formulário <b>{deleteFormName}</b>.<br />
              <span className="text-sm">Todas as perguntas e respostas associadas serão <b>apagadas permanentemente</b>.</span><br />
              <br />
              Para confirmar, digite o nome exato do formulário abaixo:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Digite o nome do formulário"
              value={deleteConfirmInput}
              onChange={e => onDeleteConfirmInputChange(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onDeleteDialogChange(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={deleteConfirmInput !== deleteFormName}
            >
              Sim, excluir formulário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visibility Dialog */}
      <Dialog open={isVisibilityDialogOpen} onOpenChange={onVisibilityDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Visibilidade</DialogTitle>
            <DialogDescription>
              Defina o status e as roles funcionais que podem visualizar este formulário
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Status do Formulário */}
            <div>
              <label className="block font-medium mb-2">Status do Formulário</label>
              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIDDEN">🙈 Oculto</SelectItem>
                  <SelectItem value="AVAILABLE">✅ Disponível</SelectItem>
                  <SelectItem value="FROZEN">🧊 Congelado</SelectItem>
                  <SelectItem value="SCHEDULED">⏰ Agendado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Status "Oculto" torna o formulário invisível para todos os usuários
              </p>
            </div>

            {/* Roles Funcionais Permitidas */}
            <div>
              <label className="block font-medium mb-2">Roles Funcionais Permitidas</label>
              <div className="grid grid-cols-1 gap-2 border rounded-lg p-3 bg-muted/20">
                {roles.map((role) => (
                  <label key={role.value} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
                    <Checkbox
                      checked={selectedRoles.includes(role.value)}
                      onCheckedChange={(checked) => handleRoleToggle(role.value, checked as boolean)}
                      id={`role-${role.value}`}
                    />
                    <span className="flex-1">{role.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedRoles.length === 0 
                  ? "⚠️ Se nenhuma role for selecionada, o formulário será público para todos os usuários" 
                  : `✅ Visível apenas para: ${roles.filter(r => selectedRoles.includes(r.value)).map(r => r.label).join(", ")}`
                }
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onVisibilityDialogChange(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-upe-blue text-white" 
              onClick={onSaveVisibility}
              disabled={isUpdating}
            >
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
