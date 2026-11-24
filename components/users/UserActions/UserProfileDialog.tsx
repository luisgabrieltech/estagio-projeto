"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { User as UserIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type { User } from "@/types/entities/user"

/**
 * Response data structure for user responses
 */
interface UserResponse {
  id: string
  value: string
  createdAt: string
  form: {
    id: string
    title: string
  }
}

/**
 * Props for the UserProfileDialog component
 */
export interface UserProfileDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** User to display */
  user: User | null
  /** User's form responses */
  responses?: UserResponse[]
  /** Whether responses are loading */
  loadingResponses?: boolean
  /** Success message to display */
  statusSuccess?: string | null
  /** Error message to display */
  statusError?: string | null
}

/**
 * UserProfileDialog Component
 * 
 * Dialog for displaying detailed user profile information including
 * personal data, extra data, and form responses.
 * 
 * @example
 * ```tsx
 * <UserProfileDialog
 *   isOpen={isProfileDialogOpen}
 *   onOpenChange={setIsProfileDialogOpen}
 *   user={selectedUser}
 *   responses={userResponses}
 *   loadingResponses={loadingResponses}
 * />
 * ```
 */
export function UserProfileDialog({
  isOpen,
  onOpenChange,
  user,
  responses = [],
  loadingResponses = false,
  statusSuccess = null,
  statusError = null,
}: UserProfileDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Perfil do Usuário
          </DialogTitle>
          <DialogDescription>Visão detalhada do usuário selecionado</DialogDescription>
        </DialogHeader>
        
        {user && (
          <div className="space-y-4 py-2">
            {/* User Header */}
            <UserProfileHeader user={user} />
            
            {/* Basic Info */}
            <UserBasicInfo user={user} />
            
            {/* Extra Data */}
            {user.extraData && <UserExtraData extraData={user.extraData} />}
            
            {/* Responses */}
            <UserResponsesList responses={responses} loading={loadingResponses} />
            
            {/* Status Messages */}
            {statusSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{statusSuccess}</AlertDescription>
              </Alert>
            )}
            
            {statusError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{statusError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * User profile header with avatar and basic info
 */
function UserProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src="/images/placeholders/placeholder.svg" alt={user.name} />
        <AvatarFallback className="bg-upe-blue text-white text-2xl">
          {user.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-bold text-lg">{user.name}</div>
        <div className="text-muted-foreground text-sm">{user.email}</div>
        <RoleBadge role={user.role} />
      </div>
    </div>
  )
}

/**
 * User basic information grid
 */
function UserBasicInfo({ user }: { user: User }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <span className="font-medium">ID:</span> {user.id}
      </div>
      <div>
        <span className="font-medium">Status:</span>{" "}
        {user.active ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ativo
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Inativo
          </Badge>
        )}
      </div>
      <div>
        <span className="font-medium">Criado em:</span>{" "}
        {user.createdAt ? new Date(user.createdAt).toLocaleString("pt-BR") : "-"}
      </div>
      <div>
        <span className="font-medium">Atualizado em:</span>{" "}
        {user.updatedAt ? new Date(user.updatedAt).toLocaleString("pt-BR") : "-"}
      </div>
    </div>
  )
}

/**
 * User extra data section
 */
function UserExtraData({ extraData }: { extraData: User["extraData"] }) {
  if (!extraData) return null
  
  const hasData = extraData.course || extraData.campus || extraData.registration || extraData.department
  
  if (!hasData) return null
  
  return (
    <div className="grid grid-cols-2 gap-2 text-sm border-t pt-2 mt-2">
      {extraData.course && (
        <div>
          <span className="font-medium">Curso:</span> {extraData.course}
        </div>
      )}
      {extraData.campus && (
        <div>
          <span className="font-medium">Campus:</span> {extraData.campus}
        </div>
      )}
      {extraData.registration && (
        <div>
          <span className="font-medium">Matrícula:</span> {extraData.registration}
        </div>
      )}
      {extraData.department && (
        <div>
          <span className="font-medium">Departamento:</span> {extraData.department}
        </div>
      )}
    </div>
  )
}

/**
 * User responses list
 */
function UserResponsesList({ 
  responses, 
  loading 
}: { 
  responses: UserResponse[]
  loading: boolean 
}) {
  return (
    <div className="mt-4 border-t pt-2">
      <div className="font-semibold mb-2">Formulários Respondidos</div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-upe-blue" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando respostas...</span>
        </div>
      ) : responses.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(
            responses
              .filter((resp) => resp.form?.id) // Filter out responses without form data
              .reduce((acc: Record<string, { title: string; responses: UserResponse[]; createdAt: string }>, resp) => {
              const formId = resp.form.id
              if (!acc[formId]) {
                acc[formId] = {
                  title: resp.form.title || 'Formulário sem título',
                  responses: [],
                  createdAt: resp.createdAt,
                }
              }
              acc[formId].responses.push(resp)
              if (new Date(resp.createdAt) > new Date(acc[formId].createdAt)) {
                acc[formId].createdAt = resp.createdAt
              }
              return acc
            }, {})
          ).map(([formId, data]) => {
            const totalQuestions = data.responses.length
            const answeredQuestions = data.responses.filter(
              (r) => r.value && r.value.trim() !== ""
            ).length
            const blankQuestions = totalQuestions - answeredQuestions

            return (
              <div
                key={formId}
                className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-upe-blue truncate">{data.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Respondido em:{" "}
                      {new Date(data.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="text-gray-600">{totalQuestions} questões</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-green-700">Respondidas:</span>
                    <span className="text-green-600">{answeredQuestions}</span>
                  </div>
                  {blankQuestions > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-orange-700">Em branco:</span>
                      <span className="text-orange-600">{blankQuestions}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground py-4 text-center">
          Nenhuma resposta encontrada
        </div>
      )}
    </div>
  )
}

/**
 * Role badge component
 */
function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "ADMIN":
      return <Badge className="bg-upe-red hover:bg-upe-red/90">Administrador</Badge>
    case "CSA":
      return <Badge className="bg-purple-500 hover:bg-purple-600">CSA</Badge>
    case "USER":
      return <Badge variant="outline">Usuário</Badge>
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}
