"use client"

import { useState, useRef, useCallback } from "react"
import { FormMetrics, QuestionStats, ResponseFilters } from "@/types/entities/response"
import { metricsCache, TTL } from "@/lib/utils"
import { apiRequest } from "@/lib/utils/api-utils"

/**
 * Hook for managing response statistics and metrics
 * Implements lazy loading and caching for performance optimization
 * 
 * @param formId - The ID of the form to fetch statistics for
 * @returns Object containing metrics, question stats, loading states, and data fetching functions
 * 
 * @example
 * ```tsx
 * const { 
 *   metrics, 
 *   questionStats, 
 *   metricsLoading, 
 *   fetchMetrics, 
 *   fetchQuestionStats,
 *   refreshData 
 * } = useResponseStats(formId)
 * 
 * // Fetch metrics when needed
 * useEffect(() => {
 *   if (activeTab === 'overview') {
 *     fetchMetrics(filters)
 *   }
 * }, [activeTab, filters])
 * ```
 */
export function useResponseStats(formId: string) {
  const [metrics, setMetrics] = useState<FormMetrics | null>(null)
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([])
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [questionStatsLoading, setQuestionStatsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const metricsLoadedRef = useRef(false)
  const questionStatsLoadedRef = useRef(false)

  /**
   * Builds a query string from filters
   * 
   * @param filters - The filters to convert to query string
   * @returns URL query string
   */
  const buildQueryString = (filters: ResponseFilters): string => {
    const params = new URLSearchParams()
    
    if (filters.campus && filters.campus.length > 0) {
      params.set('campus', filters.campus.join(','))
    }
    if (filters.course && filters.course.length > 0) {
      params.set('course', filters.course.join(','))
    }
    if (filters.userRole && filters.userRole.length > 0) {
      params.set('role', filters.userRole.join(','))
    }
    if (filters.responseDate?.from) {
      params.set('dateFrom', filters.responseDate.from.toISOString())
    }
    if (filters.responseDate?.to) {
      params.set('dateTo', filters.responseDate.to.toISOString())
    }
    
    return params.toString()
  }

  /**
   * Fetches form metrics with caching support
   * Only fetches if not already loaded or if filters change
   * 
   * @param currentFilters - The filters to apply when fetching metrics
   */
  const fetchMetrics = useCallback(async (currentFilters: ResponseFilters = {
    campus: [],
    course: [],
    userRole: [],
    completionStatus: 'all'
  }) => {
    if (metricsLoadedRef.current && !currentFilters) return
    
    try {
      setMetricsLoading(true)
      setError(null)
      
      const queryString = buildQueryString(currentFilters)
      const cacheKey = `metrics-${formId}-${queryString}`
      
      const cachedMetrics = metricsCache.get(cacheKey)
      if (cachedMetrics) {
        setMetrics(cachedMetrics as FormMetrics)
        metricsLoadedRef.current = true
        setMetricsLoading(false)
        return
      }
      
      const metricsData = await apiRequest<FormMetrics>(
        `admin/responses/${formId}/metrics${queryString ? '?' + queryString : ''}`
      )
      setMetrics(metricsData)
      metricsCache.set(cacheKey, metricsData, TTL.TWO_MINUTES)
      metricsLoadedRef.current = true

    } catch (err) {
      console.error('Erro ao carregar métricas:', err)
      setError('Erro ao carregar métricas')
    } finally {
      setMetricsLoading(false)
    }
  }, [formId])

  /**
   * Fetches question statistics with caching support
   * Only fetches if not already loaded or if filters change
   * 
   * @param currentFilters - The filters to apply when fetching statistics
   */
  const fetchQuestionStats = useCallback(async (currentFilters: ResponseFilters = {
    campus: [],
    course: [],
    userRole: [],
    completionStatus: 'all'
  }) => {
    if (questionStatsLoadedRef.current && !currentFilters) return
    
    try {
      setQuestionStatsLoading(true)
      setError(null)
      
      const queryString = buildQueryString(currentFilters)
      const cacheKey = `question-stats-${formId}-${queryString}`
      
      const cachedStats = metricsCache.get(cacheKey)
      if (cachedStats) {
        setQuestionStats(cachedStats as QuestionStats[])
        questionStatsLoadedRef.current = true
        setQuestionStatsLoading(false)
        return
      }
      
      const statsData = await apiRequest<QuestionStats[]>(
        `admin/responses/${formId}/statistics${queryString ? '?' + queryString : ''}`
      )
      setQuestionStats(statsData)
      metricsCache.set(cacheKey, statsData, TTL.TWO_MINUTES)
      questionStatsLoadedRef.current = true

    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
      setError('Erro ao carregar estatísticas')
    } finally {
      setQuestionStatsLoading(false)
    }
  }, [formId])

  /**
   * Invalidates cache and reloads data
   * Useful for refreshing data after filters change
   * 
   * @param filters - The current filters to use when refreshing
   * @param activeTab - The currently active tab to determine what to refresh
   */
  const refreshData = useCallback((filters: ResponseFilters, activeTab: string) => {
    // Invalidate only the caches related to this form
    const queryString = buildQueryString(filters)
    metricsCache.delete(`metrics-${formId}-${queryString}`)
    metricsCache.delete(`question-stats-${formId}-${queryString}`)
    
    metricsLoadedRef.current = false
    questionStatsLoadedRef.current = false
    
    if (activeTab === "overview") {
      fetchMetrics(filters)
    } else if (activeTab === "questions") {
      fetchQuestionStats(filters)
    }
  }, [formId, fetchMetrics, fetchQuestionStats])

  /**
   * Resets the loaded state flags
   * Useful when filters change to force a reload
   */
  const resetLoadedState = useCallback(() => {
    metricsLoadedRef.current = false
    questionStatsLoadedRef.current = false
  }, [])

  return {
    metrics,
    questionStats,
    metricsLoading,
    questionStatsLoading,
    error,
    fetchMetrics,
    fetchQuestionStats,
    refreshData,
    resetLoadedState
  }
}
