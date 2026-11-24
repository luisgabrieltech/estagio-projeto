import { useMutation, useQueryClient } from '@tanstack/react-query'

interface MutationFactoryOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  invalidateKeys?: readonly unknown[][]
  getInvalidateKeys?: (data: TData, variables: TVariables) => readonly unknown[][]
}

interface MutationHookOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void
}

export function createMutation<TData, TVariables>(
  options: MutationFactoryOptions<TData, TVariables>
) {
  return function useMutationHook(
    mutationOptions?: MutationHookOptions<TData, TVariables>
  ) {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: options.mutationFn,
      onSuccess: (data, variables) => {
        options.invalidateKeys?.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key })
        })

        options.getInvalidateKeys?.(data, variables).forEach(key => {
          queryClient.invalidateQueries({ queryKey: key })
        })

        mutationOptions?.onSuccess?.(data, variables)
      },
      onError: mutationOptions?.onError,
      onSettled: mutationOptions?.onSettled,
    })
  }
}
