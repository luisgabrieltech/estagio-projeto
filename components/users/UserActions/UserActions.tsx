"use client"

import { DeleteUserDialog } from "./DeleteUserDialog"
import { ResetPasswordDialog } from "./ResetPasswordDialog"
import { UserProfileDialog } from "./UserProfileDialog"
import { RoleDialog } from "./RoleDialog"
import { FunctionalRolesDialog } from "./FunctionalRolesDialog"
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
 * Props for the UserActions component
 */
export interface UserActionsProps {
  // Delete Dialog
  /** Whether the delete dialog is open */
  isDeleteDialogOpen: boolean
  /** Callback when delete dialog open state changes */
  onDeleteDialogChange: (open: boolean) => void
  /** Callback when deletion is confirmed */
  onConfirmDelete: () => void
  /** Whether delete operation is loading */
  deleteLoading?: boolean
  /** Delete operation error message */
  deleteError?: string | null

  // Reset Password Dialog
  /** Whether the reset password dialog is open */
  isResetPasswordDialogOpen: boolean
  /** Callback when reset password dialog open state changes */
  onResetPasswordDialogChange: (open: boolean) => void
  /** Callback when reset password is confirmed */
  onConfirmResetPassword: () => void
  /** Whether reset password operation is loading */
  resetPasswordLoading?: boolean
  /** Reset password success message */
  resetPasswordSuccess?: string | null
  /** Reset password error message */
  resetPasswordError?: string | null

  // Profile Dialog
  /** Whether the profile dialog is open */
  isProfileDialogOpen: boolean
  /** Callback when profile dialog open state changes */
  onProfileDialogChange: (open: boolean) => void
  /** Currently selected user */
  selectedUser: User | null
  /** User's form responses */
  userResponses?: UserResponse[]
  /** Whether responses are loading */
  loadingResponses?: boolean
  /** Status success message */
  statusSuccess?: string | null
  /** Status error message */
  statusError?: string | null

  // Role Dialog
  /** Whether the role dialog is open */
  isRoleDialogOpen: boolean
  /** Callback when role dialog open state changes */
  onRoleDialogChange: (open: boolean) => void
  /** Currently selected role */
  selectedRole: string
  /** Callback when role selection changes */
  onSelectedRoleChange: (role: string) => void
  /** Callback when role change is confirmed */
  onConfirmRoleChange: () => void
  /** Whether role update is loading */
  roleLoading?: boolean
  /** Role update error message */
  roleError?: string | null

  // Functional Roles Dialog
  /** Whether the functional roles dialog is open */
  isFunctionalRolesDialogOpen: boolean
  /** Callback when functional roles dialog open state changes */
  onFunctionalRolesDialogChange: (open: boolean) => void
  /** Currently selected functional roles */
  selectedFunctionalRoles: string[]
  /** Callback when functional roles selection changes */
  onSelectedFunctionalRolesChange: (roles: string[]) => void
  /** Callback when functional roles change is confirmed */
  onConfirmFunctionalRolesChange: () => void
  /** Whether functional roles update is loading */
  functionalRolesLoading?: boolean
  /** Functional roles update error message */
  functionalRolesError?: string | null
}

/**
 * UserActions Component
 * 
 * Container component that composes all user action dialogs.
 * Provides a unified interface for managing user-related dialogs
 * including delete, reset password, profile view, role change,
 * and functional roles management.
 * 
 * @example
 * ```tsx
 * <UserActions
 *   // Delete Dialog
 *   isDeleteDialogOpen={isDeleteDialogOpen}
 *   onDeleteDialogChange={setIsDeleteDialogOpen}
 *   onConfirmDelete={handleConfirmDelete}
 *   deleteLoading={deleteLoading}
 *   
 *   // Reset Password Dialog
 *   isResetPasswordDialogOpen={isResetPasswordDialogOpen}
 *   onResetPasswordDialogChange={setIsResetPasswordDialogOpen}
 *   onConfirmResetPassword={handleConfirmResetPassword}
 *   resetPasswordLoading={resetPasswordLoading}
 *   resetPasswordSuccess={resetPasswordSuccess}
 *   resetPasswordError={resetPasswordError}
 *   
 *   // Profile Dialog
 *   isProfileDialogOpen={isProfileDialogOpen}
 *   onProfileDialogChange={setIsProfileDialogOpen}
 *   selectedUser={selectedUser}
 *   userResponses={userResponses}
 *   loadingResponses={loadingResponses}
 *   
 *   // Role Dialog
 *   isRoleDialogOpen={isRoleDialogOpen}
 *   onRoleDialogChange={setIsRoleDialogOpen}
 *   selectedRole={selectedRole}
 *   onSelectedRoleChange={setSelectedRole}
 *   onConfirmRoleChange={handleConfirmRoleChange}
 *   roleLoading={roleLoading}
 *   roleError={roleError}
 *   
 *   // Functional Roles Dialog
 *   isFunctionalRolesDialogOpen={isFunctionalRolesDialogOpen}
 *   onFunctionalRolesDialogChange={setIsFunctionalRolesDialogOpen}
 *   selectedFunctionalRoles={selectedFunctionalRoles}
 *   onSelectedFunctionalRolesChange={setSelectedFunctionalRoles}
 *   onConfirmFunctionalRolesChange={handleConfirmFunctionalRolesChange}
 *   functionalRolesLoading={functionalRolesLoading}
 *   functionalRolesError={functionalRolesError}
 * />
 * ```
 */
export function UserActions({
  // Delete Dialog
  isDeleteDialogOpen,
  onDeleteDialogChange,
  onConfirmDelete,
  deleteLoading = false,
  deleteError = null,

  // Reset Password Dialog
  isResetPasswordDialogOpen,
  onResetPasswordDialogChange,
  onConfirmResetPassword,
  resetPasswordLoading = false,
  resetPasswordSuccess = null,
  resetPasswordError = null,

  // Profile Dialog
  isProfileDialogOpen,
  onProfileDialogChange,
  selectedUser,
  userResponses = [],
  loadingResponses = false,
  statusSuccess = null,
  statusError = null,

  // Role Dialog
  isRoleDialogOpen,
  onRoleDialogChange,
  selectedRole,
  onSelectedRoleChange,
  onConfirmRoleChange,
  roleLoading = false,
  roleError = null,

  // Functional Roles Dialog
  isFunctionalRolesDialogOpen,
  onFunctionalRolesDialogChange,
  selectedFunctionalRoles,
  onSelectedFunctionalRolesChange,
  onConfirmFunctionalRolesChange,
  functionalRolesLoading = false,
  functionalRolesError = null,
}: UserActionsProps) {
  return (
    <>
      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        user={selectedUser}
        onConfirm={onConfirmDelete}
        loading={deleteLoading}
        error={deleteError}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        isOpen={isResetPasswordDialogOpen}
        onOpenChange={onResetPasswordDialogChange}
        user={selectedUser}
        onConfirm={onConfirmResetPassword}
        loading={resetPasswordLoading}
        success={resetPasswordSuccess}
        error={resetPasswordError}
      />

      {/* User Profile Dialog */}
      <UserProfileDialog
        isOpen={isProfileDialogOpen}
        onOpenChange={onProfileDialogChange}
        user={selectedUser}
        responses={userResponses}
        loadingResponses={loadingResponses}
        statusSuccess={statusSuccess}
        statusError={statusError}
      />

      {/* Role Dialog */}
      <RoleDialog
        isOpen={isRoleDialogOpen}
        onOpenChange={onRoleDialogChange}
        user={selectedUser}
        selectedRole={selectedRole}
        onRoleChange={onSelectedRoleChange}
        onConfirm={onConfirmRoleChange}
        loading={roleLoading}
        error={roleError}
      />

      {/* Functional Roles Dialog */}
      <FunctionalRolesDialog
        isOpen={isFunctionalRolesDialogOpen}
        onOpenChange={onFunctionalRolesDialogChange}
        user={selectedUser}
        selectedRoles={selectedFunctionalRoles}
        onRolesChange={onSelectedFunctionalRolesChange}
        onConfirm={onConfirmFunctionalRolesChange}
        loading={functionalRolesLoading}
        error={functionalRolesError}
      />
    </>
  )
}
