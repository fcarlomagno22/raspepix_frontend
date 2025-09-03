"use client"

import { useState, useEffect } from 'react'
import { api } from '@/services/api'

interface InfluencerStats {
  total_indicados: number
  total_comissoes: number
}

export function useInfluencerStats() {
  const [data, setData] = useState<InfluencerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        const response = await api.get('/api/influencers/estatisticas')
        setData(response.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return {
    data,
    isLoading,
    error
  }
} 