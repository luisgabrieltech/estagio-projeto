/**
 * UserManagement Feature Components
 * 
 * This module exports all components related to user management in the admin dashboard.
 * 
 * Main component:
 * - UserManagement: Main container component that composes all sub-components
 * 
 * Sub-components:
 * - UserManagementHeader: Page header with title and description
 * - UserManagementFilters: Filter panel with search, role, and functional role filters
 * - UserManagementTable: Table/card view for displaying users
 * - UserManagementTableRow: Table row component for desktop view
 * - UserManagementCard: Card component for mobile view
 * - UserManagementDialogs: Container for all action dialogs
 */

export { UserManagement } from "./UserManagement"
export type { UserManagementProps } from "./UserManagement"

export { UserManagementHeader } from "./UserManagementHeader"
export type { UserManagementHeaderProps } from "./UserManagementHeader"

export { UserManagementFilters } from "./UserManagementFilters"
export type { UserManagementFiltersProps } from "./UserManagementFilters"

export { UserManagementTable } from "./UserManagementTable"
export type { UserManagementTableProps } from "./UserManagementTable"

export { UserManagementTableRow } from "./UserManagementTableRow"
export type { UserManagementTableRowProps } from "./UserManagementTableRow"

export { UserManagementCard } from "./UserManagementCard"
export type { UserManagementCardProps } from "./UserManagementCard"

export { UserManagementDialogs } from "./UserManagementDialogs"
export type { UserManagementDialogsProps } from "./UserManagementDialogs"
