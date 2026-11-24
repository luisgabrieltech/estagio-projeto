import { useState, useCallback, useRef, useEffect } from 'react'

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  status: AsyncStatus
  data: T | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  isIdle: boolean
}

export interface UseAsyncOptions<T> {
  initialData?: T | null
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onSettled?: (data: T | null, error: Error | null) => void
  immediate?: boolean
  resetOnExecute?: boolean
}

export interface UseAsyncReturn<T, Args extends any[]> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T | null>
  reset: () => void
  setData: (data: T | null) => void
  setError: (error: Error | null) => void
}

export function useAsync<T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  const {
    initialData = null,
    onSuccess,
    onError,
    onSettled,
    immediate = false,
    resetOnExecute = true
  } = options

  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [data, setData] = useState<T | null>(initialData)
  const [error, setError] = useState<Error | null>(null)

  const isMountedRef = useRef(true)
  const asyncFunctionRef = useRef(asyncFunction)

  useEffect(() => {
    asyncFunctionRef.current = asyncFunction
  }, [asyncFunction])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    if (resetOnExecute) {
      setError(null)
    }

    setStatus('loading')

    try {
      const result = await asyncFunctionRef.current(...args)

      if (isMountedRef.current) {
        setData(result)
        setStatus('success')
        onSuccess?.(result)
        onSettled?.(result, null)
      }

      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))

      if (isMountedRef.current) {
        setError(error)
        setStatus('error')
        onError?.(error)
        onSettled?.(null, error)
      }

      return null
    }
  }, [resetOnExecute, onSuccess, onError, onSettled])

  const reset = useCallback(() => {
    setStatus('idle')
    setData(initialData)
    setError(null)
  }, [initialData])

  const setDataManually = useCallback((newData: T | null) => {
    setData(newData)
    if (newData !== null) {
      setStatus('success')
      setError(null)
    }
  }, [])

  const setErrorManually = useCallback((newError: Error | null) => {
    setError(newError)
    if (newError !== null) {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args))
    }
  }, [])

  return {
    status,
    data,
    error,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle',
    execute,
    reset,
    setData: setDataManually,
    setError: setErrorManually
  }
}
