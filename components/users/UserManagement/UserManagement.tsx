"use client"

import { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { useUsers } from "@/hooks/users/useUsers"
import { useUserActions } from "@/hooks/users/useUserActions"
import { apiRequest } from "@/lib/utils/api-utils"
import { responsesCache } from "@/lib/utils/cache-utils"
import { CACHE_TTL } from "@/lib/config"
import { UserManagementHeader } from "./UserManagementHeader"
import { UserManagementFilters } from "./UserManagementFilters"
import { UserManagementTable } from "./UserManagementTable"
import { UserManagementDialogs } from "./UserManagementDialogs"
import type { User } from "@/types/entities/user"
import type { UserResponseItem } from "@/types/api/users"

/**
 * Props for the UserManagement component
 */
export interface UserManagementProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * UserManagement Component
 * 
 * Main component for managing users in the admin dashboard.
 * Composes UserManagementHeader, UserManagementFilters, UserManagementTable,
 * and UserManagementDialogs components.
 * 
 * Uses useUsers and useUserActions hooks for data and actions.
 * 
 * @example
 * ```tsx
 * <UserManagement />
 * ```
 */
export function UserManagement({ className = "" }: UserManagementProps) {
  // Use custom hooks for data and actions
  const {
    users,
    isLoading,
    isFetching,
    filters,
    pagination,
    setSearchQuery,
    setRoleFilter,
    setFunctionalRoleFilter,
    setPage,
    refetch
  } = useUsers()

  const actions = useUserActions()

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isFunctionalRolesDialogOpen, setIsFunctionalRolesDialogOpen] = useState(false)

  // Selected user states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [selectedFunctionalRoles, setSelectedFunctionalRoles] = useState<string[]>([])

  // User responses state
  const [userResponses, setUserResponses] = useState<UserResponseItem[]>([])
  const [loadingResponses, setLoadingResponses] = useState(false)

  // Memoized action methods to avoid dependency issues
  const clearErrors = useMemo(() => actions.clearErrors, [actions.clearErrors])
  const clearSuccess = useMemo(() => actions.clearSuccess, [actions.clearSuccess])

  const loadUserResponses = useCallback(async (userId: string) => {
    setLoadingResponses(true)
    try {
      const cacheKey = `user-responses-${userId}`
      const cached = responsesCache.get(cacheKey)

      if (cached) {
        setUserResponses(cached)
        setLoadingResponses(false)
        return
      }

      const data = await apiRequest<UserResponseItem[]>(`user/${userId}/responses`)
      const responseData = Array.isArray(data) ? data : []
      setUserResponses(responseData)
      responsesCache.set(cacheKey, responseData, CACHE_TTL.THREE_MINUTES)
    } catch (error) {
      console.error('Error loading user responses:', error)
      setUserResponses([])
    } finally {
      setLoadingResponses(false)
    }
  }, [])

  // Dialog handlers
  const handleDeleteClick = useCallback((userId: string) => {
    setSelectedUserId(userId)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleResetPasswordClick = useCallback((userId: string) => {
    setSelectedUserId(userId)
    setIsResetPasswordDialogOpen(true)
    clearErrors()
    clearSuccess()
  }, [clearErrors, clearSuccess])

  const handleViewProfile = useCallback((user: User) => {
    setSelectedUser(user)
    setUserResponses([])
    setIsProfileDialogOpen(true)
    loadUserResponses(user.id)
  }, [loadUserResponses])

  const handleRoleClick = useCallback((user: User) => {
    setSelectedUser(user)
    setSelectedRole(user.role)
    setIsRoleDialogOpen(true)
    clearErrors()
  }, [clearErrors])

  const handleFunctionalRolesClick = useCallback((user: User) => {
    setSelectedUser(user)
    setSelectedFunctionalRoles(user.extraData?.functionalRoles || [])
    setIsFunctionalRolesDialogOpen(true)
    clearErrors()
  }, [clearErrors])

  // Action handlers
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedUserId) return
    const result = await actions.deleteUser(selectedUserId)
    if (result.success) {
      setIsDeleteDialogOpen(false)
      setSelectedUserId(null)
      await refetch()
    }
  }, [selectedUserId, actions, refetch])

  const handleConfirmResetPassword = useCallback(async () => {
    if (!selectedUserId) return
    await actions.resetPassword(selectedUserId)
  }, [selectedUserId, actions])

  const handleActivateUser = useCallback(async (userId: string) => {
    const result = await actions.activateUser(userId)
    if (result.success) await refetch()
  }, [actions, refetch])

  const handleDeactivateUser = useCallback(async (userId: string) => {
    const result = await actions.deactivateUser(userId)
    if (result.success) await refetch()
  }, [actions, refetch])

  const handleConfirmRoleChange = useCallback(async () => {
    if (!selectedUser) return
    const result = await actions.updateRole(selectedUser.id, selectedRole)
    if (result.success) {
      setIsRoleDialogOpen(false)
      await refetch()
    }
  }, [selectedUser, selectedRole, actions, refetch])

  const handleConfirmFunctionalRolesChange = useCallback(async () => {
    if (!selectedUser) return
    const result = await actions.updateFunctionalRoles(
      selectedUser.id, 
      selectedUser, 
      selectedFunctionalRoles
    )
    if (result.success) {
      setIsFunctionalRolesDialogOpen(false)
      await refetch()
    }
  }, [selectedUser, selectedFunctionalRoles, actions, refetch])

  const handleResetPasswordDialogChange = useCallback((open: boolean) => {
    setIsResetPasswordDialogOpen(open)
    if (!open) {
      clearErrors()
      clearSuccess()
    }
  }, [clearErrors, clearSuccess])

  // Animation variants - memoized to prevent re-creation
  const animationVariants = useMemo(() => ({
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      }
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }
  }), [])

  return (
    <div className={`w-full ${className}`}>
      {/* Page Header */}
      <UserManagementHeader />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <UserManagementFilters
          searchQuery={filters.search || ''}
          roleFilter={filters.role || 'all'}
          functionalRoleFilter={filters.functionalRole || 'all'}
          onSearchChange={setSearchQuery}
          onRoleFilterChange={setRoleFilter}
          onFunctionalRoleFilterChange={setFunctionalRoleFilter}
        />
      </motion.div>

      {/* Users Table */}
      <motion.div variants={animationVariants.container} initial="hidden" animate="show">
        <motion.div variants={animationVariants.item}>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                {isLoading ? (
                  "Carregando usuários..."
                ) : (
                  <>
                    Total: {pagination.total} usuários
                    {pagination.totalPages > 1 && ` • Página ${pagination.page} de ${pagination.totalPages}`}
                    {isFetching && " • Atualizando..."}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable
                users={users}
                loading={isLoading}
                statusLoading={actions.loading.activate || actions.loading.deactivate}
                onViewProfile={handleViewProfile}
                onResetPassword={handleResetPasswordClick}
                onRoleClick={handleRoleClick}
                onFunctionalRolesClick={handleFunctionalRolesClick}
                onActivateUser={handleActivateUser}
                onDeactivateUser={handleDeactivateUser}
                onDeleteUser={handleDeleteClick}
              />

              {pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Action Dialogs */}
      <UserManagementDialogs
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteDialogChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
        isResetPasswordDialogOpen={isResetPasswordDialogOpen}
        onResetPasswordDialogChange={handleResetPasswordDialogChange}
        onConfirmResetPassword={handleConfirmResetPassword}
        resetPasswordLoading={!!actions.loading.resetPassword}
        resetPasswordSuccess={actions.success.resetPassword}
        resetPasswordError={actions.errors.resetPassword}
        isProfileDialogOpen={isProfileDialogOpen}
        onProfileDialogChange={setIsProfileDialogOpen}
        selectedUser={selectedUser}
        userResponses={userResponses}
        loadingResponses={loadingResponses}
        statusSuccess={actions.success.activate || actions.success.deactivate}
        statusError={actions.errors.activate || actions.errors.deactivate}
        isRoleDialogOpen={isRoleDialogOpen}
        onRoleDialogChange={setIsRoleDialogOpen}
        selectedRole={selectedRole}
        onSelectedRoleChange={setSelectedRole}
        onConfirmRoleChange={handleConfirmRoleChange}
        roleLoading={!!actions.loading.updateRole}
        roleError={actions.errors.updateRole}
        isFunctionalRolesDialogOpen={isFunctionalRolesDialogOpen}
        onFunctionalRolesDialogChange={setIsFunctionalRolesDialogOpen}
        selectedFunctionalRoles={selectedFunctionalRoles}
        onSelectedFunctionalRolesChange={setSelectedFunctionalRoles}
        onConfirmFunctionalRolesChange={handleConfirmFunctionalRolesChange}
        functionalRolesLoading={!!actions.loading.updateFunctionalRoles}
        functionalRolesError={actions.errors.updateFunctionalRoles}
      />
    </div>
  )
}
