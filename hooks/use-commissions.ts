"use client"

import { useState, useEffect } from 'react'
import { api } from '@/services/api'

interface Commission {
  nivel: string
  percentual: number
}

export function useCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/api/influencers/comissoes')
        console.log('Comissões recebidas:', response.data)
        setCommissions(response.data)
      } catch (err) {
        console.error('Erro ao buscar comissões:', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommissions()
  }, [])

  const getCommissionByLevel = (level: number): number => {
    console.log('Buscando comissão para nível:', level)
    console.log('Comissões disponíveis:', commissions)
    
    let commission
    if (level === 1) {
      commission = commissions.find(c => c.nivel === 'direto')
    } else if (level === 2) {
      commission = commissions.find(c => c.nivel === 'secundario')
    } else {
      commission = commissions.find(c => c.nivel === 'expandido')
    }
    
    console.log('Comissão encontrada:', commission)
    return commission?.percentual ?? 0
  }

  return {
    commissions,
    isLoading,
    error,
    getCommissionByLevel
  }
}