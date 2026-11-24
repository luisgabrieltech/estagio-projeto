import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userKeys } from '@/lib/query/keys'
import { createUser, updateUser, deleteUser } from '@/lib/api/user.api'
import type { UserCreateData, UserUpdateData } from '@/types/entities/user'

/**
 * Hook for creating a new user
 * 
 * Automatically invalidates user list queries on success to ensure
 * the UI reflects the newly created user.
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 * 
 * @example
 * ```tsx
 * function CreateUserForm() {
 *   const { mutate, isPending, isError, error } = useCreateUser()
 * 
 *   const handleSubmit = (data: UserCreateData) => {
 *     mutate(data, {
 *       onSuccess: () => {
 *         toast({ title: 'User created successfully' })
 *       }
 *     })
 *   }
 * 
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate all user list queries to refetch with new user
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook for updating an existing user
 * 
 * Automatically invalidates both the specific user detail query and
 * all user list queries on success to ensure the UI is up to date.
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 * 
 * @example
 * ```tsx
 * function EditUserForm({ userId }: { userId: string }) {
 *   const { mutate, isPending } = useUpdateUser()
 * 
 *   const handleSubmit = (data: UserUpdateData) => {
 *     mutate({ id: userId, data }, {
 *       onSuccess: () => {
 *         toast({ title: 'User updated successfully' })
 *       }
 *     })
 *   }
 * 
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, variables) => {
      // Invalidate the specific user detail query
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
      // Invalidate all user list queries
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook for deleting a user
 * 
 * Automatically invalidates all user list queries on success to ensure
 * the deleted user is removed from the UI.
 * 
 * @returns Mutation object with mutate, mutateAsync, isPending, isError, error, isSuccess, data
 * 
 * @example
 * ```tsx
 * function DeleteUserButton({ userId }: { userId: string }) {
 *   const { mutate, isPending } = useDeleteUser()
 * 
 *   const handleDelete = () => {
 *     if (confirm('Are you sure?')) {
 *       mutate(userId, {
 *         onSuccess: () => {
 *           toast({ title: 'User deleted successfully' })
 *         }
 *       })
 *     }
 *   }
 * 
 *   return <button onClick={handleDelete} disabled={isPending}>Delete</button>
 * }
 * ```
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate all user list queries to refetch without deleted user
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
