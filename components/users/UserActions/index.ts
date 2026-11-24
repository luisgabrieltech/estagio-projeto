/**
 * UserActions Module
 * 
 * This module exports all user action dialog components for managing
 * user-related operations like deletion, password reset, profile viewing,
 * and role management.
 * 
 * @module features/users/UserActions
 */

// Main component
export { UserActions } from "./UserActions"
export type { UserActionsProps } from "./UserActions"

// Individual dialog components
export { DeleteUserDialog } from "./DeleteUserDialog"
export type { DeleteUserDialogProps } from "./DeleteUserDialog"

export { ResetPasswordDialog } from "./ResetPasswordDialog"
export type { ResetPasswordDialogProps } from "./ResetPasswordDialog"

export { UserProfileDialog } from "./UserProfileDialog"
export type { UserProfileDialogProps } from "./UserProfileDialog"

export { RoleDialog } from "./RoleDialog"
export type { RoleDialogProps } from "./RoleDialog"

export { FunctionalRolesDialog } from "./FunctionalRolesDialog"
export type { FunctionalRolesDialogProps } from "./FunctionalRolesDialog"
