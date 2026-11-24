"use client"

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { userKeys, formKeys } from '@/lib/query/keys'
import { getUsers } from '@/lib/api/user.api'
import { getPublicForms } from '@/lib/api/form.api'

export interface AdminMetrics {
  userCount: number
  formCount: number
}

export interface UseAdminDashboardReturn extends AdminMetrics {
  loading: boolean
  isRefreshing: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const {
    data: usersData,
    isLoading: usersLoading,
    isFetching: usersFetching,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => getUsers({ page: 1, pageSize: 1 }),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })

  const {
    data: formsData,
    isLoading: formsLoading,
    isFetching: formsFetching,
    error: formsError,
    refetch: refetchForms
  } = useQuery({
    queryKey: formKeys.public(userId),
    queryFn: () => getPublicForms(),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })

  const userCount = usersData?.pagination?.total ?? usersData?.users?.length ?? 0
  const formCount = Array.isArray(formsData) ? formsData.length : 0

  const loading = usersLoading || formsLoading
  const isRefreshing = (usersFetching && !usersLoading) || (formsFetching && !formsLoading)

  const error = usersError?.message || formsError?.message || null

  const refresh = useCallback(async () => {
    await Promise.all([
      refetchUsers(),
      refetchForms()
    ])
  }, [refetchUsers, refetchForms])

  return {
    userCount,
    formCount,
    loading,
    isRefreshing,
    error,
    refresh
  }
}
