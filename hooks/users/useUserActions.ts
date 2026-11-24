import { useState, useCallback, useRef, useEffect } from 'react'
import { apiRequest } from '@/lib/utils/api-utils'
import { useUpdateUser, useDeleteUser } from './useUserMutations'
import type { User } from '@/types/entities/user'

interface ActionResult {
  success: boolean
  message?: string
  error?: string
}

interface UserActionsState {
  loading: {
    activate: string | null
    deactivate: string | null
    delete: string | null
    resetPassword: string | null
    updateRole: string | null
    updateFunctionalRoles: string | null
  }
  errors: {
    activate: string | null
    deactivate: string | null
    delete: string | null
    resetPassword: string | null
    updateRole: string | null
    updateFunctionalRoles: string | null
  }
  success: {
    activate: string | null
    deactivate: string | null
    delete: string | null
    resetPassword: string | null
    updateRole: string | null
    updateFunctionalRoles: string | null
  }
}

interface UseUserActionsReturn extends UserActionsState {
  activateUser: (userId: string) => Promise<ActionResult>
  deactivateUser: (userId: string) => Promise<ActionResult>
  deleteUser: (userId: string) => Promise<ActionResult>
  resetPassword: (userId: string) => Promise<ActionResult>
  updateRole: (userId: string, role: string) => Promise<ActionResult>
  updateFunctionalRoles: (userId: string, user: User, functionalRoles: string[]) => Promise<ActionResult>
  clearSuccess: () => void
  clearErrors: () => void
  invalidateCache: () => void
}

export function useUserActions(): UseUserActionsReturn {
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const timeoutRefs = useRef<Record<string, NodeJS.Timeout | null>>({
    activate: null,
    deactivate: null,
  })

  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [])

  const [activateLoading, setActivateLoading] = useState<string | null>(null)
  const [deactivateLoading, setDeactivateLoading] = useState<string | null>(null)
  const [resetPasswordLoading, setResetPasswordLoading] = useState<string | null>(null)
  const [updateRoleLoading, setUpdateRoleLoading] = useState<string | null>(null)
  const [updateFunctionalRolesLoading, setUpdateFunctionalRolesLoading] = useState<string | null>(null)

  const [activateError, setActivateError] = useState<string | null>(null)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null)
  const [updateRoleError, setUpdateRoleError] = useState<string | null>(null)
  const [updateFunctionalRolesError, setUpdateFunctionalRolesError] = useState<string | null>(null)

  const [activateSuccess, setActivateSuccess] = useState<string | null>(null)
  const [deactivateSuccess, setDeactivateSuccess] = useState<string | null>(null)
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<string | null>(null)
  const [updateRoleSuccess, setUpdateRoleSuccess] = useState<string | null>(null)
  const [updateFunctionalRolesSuccess, setUpdateFunctionalRolesSuccess] = useState<string | null>(null)

  const invalidateCache = useCallback(() => {}, [])

  const activateUser = useCallback(async (userId: string): Promise<ActionResult> => {
    setActivateLoading(userId)
    setActivateError(null)
    setActivateSuccess(null)

    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: { active: true }
      })

      const successMessage = 'Usuário ativado com sucesso!'
      setActivateSuccess(successMessage)

      if (timeoutRefs.current.activate) {
        clearTimeout(timeoutRefs.current.activate)
      }

      timeoutRefs.current.activate = setTimeout(() => {
        setActivateSuccess(null)
        timeoutRefs.current.activate = null
      }, 2000)

      return { success: true, message: successMessage }
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao ativar usuário'
      setActivateError(errorMessage)
      console.error('Error activating user:', err)
      return { success: false, error: errorMessage }
    } finally {
      setActivateLoading(null)
    }
  }, [updateUserMutation])

  const deactivateUser = useCallback(async (userId: string): Promise<ActionResult> => {
    setDeactivateLoading(userId)
    setDeactivateError(null)
    setDeactivateSuccess(null)

    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: { active: false }
      })

      const successMessage = 'Usuário inativado com sucesso!'
      setDeactivateSuccess(successMessage)

      if (timeoutRefs.current.deactivate) {
        clearTimeout(timeoutRefs.current.deactivate)
      }

      timeoutRefs.current.deactivate = setTimeout(() => {
        setDeactivateSuccess(null)
        timeoutRefs.current.deactivate = null
      }, 2000)

      return { success: true, message: successMessage }
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao inativar usuário'
      setDeactivateError(errorMessage)
      console.error('Error deactivating user:', err)
      return { success: false, error: errorMessage }
    } finally {
      setDeactivateLoading(null)
    }
  }, [updateUserMutation])

  const deleteUser = useCallback(async (userId: string): Promise<ActionResult> => {
    try {
      await deleteUserMutation.mutateAsync(userId)
      return { success: true, message: 'Usuário excluído com sucesso!' }
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao excluir usuário'
      console.error('Error deleting user:', err)
      return { success: false, error: errorMessage }
    }
  }, [deleteUserMutation])

  const resetPassword = useCallback(async (userId: string): Promise<ActionResult> => {
    setResetPasswordLoading(userId)
    setResetPasswordError(null)
    setResetPasswordSuccess(null)

    try {
      await apiRequest(`/user/${userId}/reset-password`, { method: 'POST' })

      const successMessage = 'E-mail de redefinição enviado com sucesso!'
      setResetPasswordSuccess(successMessage)

      return { success: true, message: successMessage }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar e-mail de redefinição'
      setResetPasswordError(errorMessage)
      console.error('Error resetting password:', err)
      return { success: false, error: errorMessage }
    } finally {
      setResetPasswordLoading(null)
    }
  }, [])

  const updateRole = useCallback(async (userId: string, role: string): Promise<ActionResult> => {
    setUpdateRoleLoading(userId)
    setUpdateRoleError(null)
    setUpdateRoleSuccess(null)

    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: { role: role as any }
      })

      const successMessage = 'Cargo alterado com sucesso!'
      setUpdateRoleSuccess(successMessage)

      return { success: true, message: successMessage }
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao alterar cargo'
      setUpdateRoleError(errorMessage)
      console.error('Error updating role:', err)
      return { success: false, error: errorMessage }
    } finally {
      setUpdateRoleLoading(null)
    }
  }, [updateUserMutation])

  const updateFunctionalRoles = useCallback(async (
    userId: string,
    user: User,
    functionalRoles: string[]
  ): Promise<ActionResult> => {
    setUpdateFunctionalRolesLoading(userId)
    setUpdateFunctionalRolesError(null)
    setUpdateFunctionalRolesSuccess(null)

    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: {
          extraData: {
            ...user.extraData,
            functionalRoles
          }
        }
      })

      const successMessage = 'Cargos funcionais alterados com sucesso!'
      setUpdateFunctionalRolesSuccess(successMessage)

      return { success: true, message: successMessage }
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao alterar cargos funcionais'
      setUpdateFunctionalRolesError(errorMessage)
      console.error('Error updating functional roles:', err)
      return { success: false, error: errorMessage }
    } finally {
      setUpdateFunctionalRolesLoading(null)
    }
  }, [updateUserMutation])

  const clearSuccess = useCallback(() => {
    setActivateSuccess(null)
    setDeactivateSuccess(null)
    setResetPasswordSuccess(null)
    setUpdateRoleSuccess(null)
    setUpdateFunctionalRolesSuccess(null)
  }, [])

  const clearErrors = useCallback(() => {
    setActivateError(null)
    setDeactivateError(null)
    setResetPasswordError(null)
    setUpdateRoleError(null)
    setUpdateFunctionalRolesError(null)
  }, [])

  return {
    loading: {
      activate: activateLoading,
      deactivate: deactivateLoading,
      delete: deleteUserMutation.isPending ? 'pending' : null,
      resetPassword: resetPasswordLoading,
      updateRole: updateRoleLoading,
      updateFunctionalRoles: updateFunctionalRolesLoading
    },
    errors: {
      activate: activateError,
      deactivate: deactivateError,
      delete: deleteUserMutation.error?.message || null,
      resetPassword: resetPasswordError,
      updateRole: updateRoleError,
      updateFunctionalRoles: updateFunctionalRolesError
    },
    success: {
      activate: activateSuccess,
      deactivate: deactivateSuccess,
      delete: deleteUserMutation.isSuccess ? 'Usuário excluído com sucesso!' : null,
      resetPassword: resetPasswordSuccess,
      updateRole: updateRoleSuccess,
      updateFunctionalRoles: updateFunctionalRolesSuccess
    },
    activateUser,
    deactivateUser,
    deleteUser,
    resetPassword,
    updateRole,
    updateFunctionalRoles,
    clearSuccess,
    clearErrors,
    invalidateCache
  }
}
