"use client"

import { DeleteUserDialog } from "../UserActions/DeleteUserDialog"
import { ResetPasswordDialog } from "../UserActions/ResetPasswordDialog"
import { UserProfileDialog } from "../UserActions/UserProfileDialog"
import { RoleDialog } from "../UserActions/RoleDialog"
import { FunctionalRolesDialog } from "../UserActions/FunctionalRolesDialog"
import type { User } from "@/types/entities/user"

/**
 * Props for the UserManagementDialogs component
 */
export interface UserManagementDialogsProps {
  // Delete Dialog
  /** Whether the delete dialog is open */
  isDeleteDialogOpen: boolean
  /** Callback when delete dialog open state changes */
  onDeleteDialogChange: (open: boolean) => void
  /** Callback when deletion is confirmed */
  onConfirmDelete: () => void

  // Reset Password Dialog
  /** Whether the reset password dialog is open */
  isResetPasswordDialogOpen: boolean
  /** Callback when reset password dialog open state changes */
  onResetPasswordDialogChange: (open: boolean) => void
  /** Callback when reset password is confirmed */
  onConfirmResetPassword: () => void
  /** Whether the reset password operation is in progress */
  resetPasswordLoading: boolean
  /** Success message for reset password */
  resetPasswordSuccess: string | null
  /** Error message for reset password */
  resetPasswordError: string | null

  // Profile Dialog
  /** Whether the profile dialog is open */
  isProfileDialogOpen: boolean
  /** Callback when profile dialog open state changes */
  onProfileDialogChange: (open: boolean) => void
  /** Selected user for profile display */
  selectedUser: User | null
  /** User's form responses */
  userResponses: any[]
  /** Whether responses are loading */
  loadingResponses: boolean
  /** Success message for status operations */
  statusSuccess: string | null
  /** Error message for status operations */
  statusError: string | null

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
  /** Whether the role update operation is in progress */
  roleLoading: boolean
  /** Error message for role update */
  roleError: string | null

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
  /** Whether the functional roles update operation is in progress */
  functionalRolesLoading: boolean
  /** Error message for functional roles update */
  functionalRolesError: string | null
}

/**
 * UserManagementDialogs Component
 * 
 * Container component for all user management dialogs.
 * Composes the individual dialog components from UserActions module.
 * 
 * Includes:
 * - DeleteUserDialog: Confirmation dialog for user deletion
 * - ResetPasswordDialog: Dialog for sending password reset email
 * - UserProfileDialog: Dialog for viewing user profile details
 * - RoleDialog: Dialog for changing user system role
 * - FunctionalRolesDialog: Dialog for managing user functional roles
 * 
 * @example
 * ```tsx
 * <UserManagementDialogs
 *   isDeleteDialogOpen={isDeleteDialogOpen}
 *   onDeleteDialogChange={setIsDeleteDialogOpen}
 *   onConfirmDelete={handleConfirmDelete}
 *   // ... other props
 * />
 * ```
 */
export function UserManagementDialogs({
  isDeleteDialogOpen,
  onDeleteDialogChange,
  onConfirmDelete,
  isResetPasswordDialogOpen,
  onResetPasswordDialogChange,
  onConfirmResetPassword,
  resetPasswordLoading,
  resetPasswordSuccess,
  resetPasswordError,
  isProfileDialogOpen,
  onProfileDialogChange,
  selectedUser,
  userResponses,
  loadingResponses,
  statusSuccess,
  statusError,
  isRoleDialogOpen,
  onRoleDialogChange,
  selectedRole,
  onSelectedRoleChange,
  onConfirmRoleChange,
  roleLoading,
  roleError,
  isFunctionalRolesDialogOpen,
  onFunctionalRolesDialogChange,
  selectedFunctionalRoles,
  onSelectedFunctionalRolesChange,
  onConfirmFunctionalRolesChange,
  functionalRolesLoading,
  functionalRolesError,
}: UserManagementDialogsProps) {
  return (
    <>
      {/* Delete Dialog */}
      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        user={selectedUser}
        onConfirm={onConfirmDelete}
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

      {/* Profile Dialog */}
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
