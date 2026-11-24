"use client"

import { useState, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from "@/hooks/common"
import { formKeys, responseKeys, userKeys } from '@/lib/query/keys'
import { getPublicForms } from '@/lib/api/form.api'
import { apiRequest } from '@/lib/utils/api-utils'

export interface EvaluationForm {
  id: string
  title: string
  description: string
  category: string
  status: string
  externalStatus: string
  deadline?: string | null
  estimatedTime?: number | null
  generatesCertificate: boolean
  visibleToRoles: string[]
  createdAt: string
  updatedAt: string
}

export interface UserResponse {
  id: string
  formId: string
  questionId: string
  value: string
  createdAt: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  functionalRoles?: string[]
  extraData?: {
    functionalRoles?: string[]
    [key: string]: any
  }
}

export interface UseEvaluationsOptions {
  initialSearchQuery?: string
  autoFetch?: boolean
}

export interface UseEvaluationsReturn {
  forms: EvaluationForm[]
  userResponses: UserResponse[]
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  searchQuery: string
  debouncedSearchQuery: string
  respondedFormIds: Set<string>
  userFunctionalRoles: string[]
  availableEvaluations: EvaluationForm[]
  completedEvaluations: EvaluationForm[]
  setSearchQuery: (query: string) => void
  refresh: () => Promise<void>
  hasRolePermission: (form: EvaluationForm) => boolean
}


export function useEvaluations(options: UseEvaluationsOptions = {}): UseEvaluationsReturn {
  const { initialSearchQuery = "", autoFetch = true } = options

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  const { data: session } = useSession()
  const userId = session?.user?.id

  const { 
    data: formsData, 
    isLoading: formsLoading,
    error: formsError,
    refetch: refetchForms
  } = useQuery({
    queryKey: formKeys.public(userId),
    queryFn: () => getPublicForms(),
    enabled: autoFetch && !!userId,
  })

  const {
    data: userResponsesData = [],
    isLoading: responsesLoading,
    refetch: refetchResponses
  } = useQuery({
    queryKey: responseKeys.byUser(userId || ''),
    queryFn: () => apiRequest<any[]>(`/user/${userId}/responses`),
    enabled: autoFetch && !!userId,
  })

  const userResponses = userResponsesData.map((response: any) => ({
    id: response.id,
    formId: response.formId || response.form?.id || '',
    questionId: response.questionId || response.question?.id || '',
    value: response.value,
    createdAt: response.createdAt instanceof Date ? response.createdAt.toISOString() : response.createdAt
  })) as UserResponse[]

  const {
    data: userProfile = null,
    isLoading: profileLoading,
    refetch: refetchProfile
  } = useQuery({
    queryKey: userKeys.detail(userId || ''),
    queryFn: () => apiRequest<UserProfile>('/user/profile'),
    enabled: autoFetch && !!userId,
  })

  const loading = formsLoading || responsesLoading || profileLoading

  const forms = (formsData || []).map((form: any) => ({
    ...form,
    createdAt: form.createdAt instanceof Date ? form.createdAt.toISOString() : form.createdAt,
    updatedAt: form.updatedAt instanceof Date ? form.updatedAt.toISOString() : form.updatedAt,
    deadline: form.deadline instanceof Date ? form.deadline.toISOString() : form.deadline
  })) as EvaluationForm[]

  const error = formsError ? (formsError as Error).message : null

  const refresh = useCallback(async () => {
    await Promise.all([
      refetchForms(),
      refetchResponses(),
      refetchProfile()
    ])
  }, [refetchForms, refetchResponses, refetchProfile])

  const respondedFormIds = useMemo(
    () => new Set(userResponses.map((r) => r.formId)),
    [userResponses]
  )

  const userFunctionalRoles = useMemo(
    () => userProfile?.functionalRoles ?? [],
    [userProfile]
  )

  const matchesSearch = useMemo(() => {
    if (!debouncedSearchQuery) return () => true
    const lowerQuery = debouncedSearchQuery.toLowerCase()
    return (form: EvaluationForm) =>
      form.title.toLowerCase().includes(lowerQuery) ||
      form.description.toLowerCase().includes(lowerQuery)
  }, [debouncedSearchQuery])

  const hasRolePermission = (form: EvaluationForm) =>
    forms.some(visibleForm => visibleForm.id === form.id)

  const availableEvaluations = useMemo(() => {
    return forms.filter((form) => {
      // 1. Status must be AVAILABLE
      if (form.externalStatus !== "AVAILABLE") return false

      // 2. User must not have responded
      if (respondedFormIds.has(form.id)) return false

      // 3. Apply search filter
      return matchesSearch(form)
    })
  }, [forms, respondedFormIds, matchesSearch])

  const completedEvaluations = useMemo(() => {
    return forms.filter((form) => {
      // 1. Status must not be HIDDEN
      if (form.externalStatus === "HIDDEN") return false

      // 2. User must have responded
      if (!respondedFormIds.has(form.id)) return false

      // 3. Apply search filter
      return matchesSearch(form)
    })
  }, [forms, respondedFormIds, matchesSearch])

  return {
    forms,
    userResponses,
    userProfile,
    loading,
    error,
    searchQuery,
    debouncedSearchQuery,
    respondedFormIds,
    userFunctionalRoles,
    availableEvaluations,
    completedEvaluations,
    setSearchQuery,
    refresh,
    hasRolePermission,
  }
}
