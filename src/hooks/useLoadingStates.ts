import { useState, useCallback } from 'react'

interface LoadingStates {
  [key: string]: boolean
}

export function useLoadingStates(initialStates: LoadingStates = {}) {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>(initialStates)

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }))
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates
  }
}
