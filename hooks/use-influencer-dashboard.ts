"use client"

import { useState, useEffect } from 'react'
import { api } from '@/services/api'

interface NivelInfo {
  percentual: number
  quantidade_membros: number
  membros_ativos: number
  comissoes_recebidas: number
}

interface DashboardData {
  saldo_disponivel: number
  niveis: {
    nivel_1: NivelInfo
    nivel_2: NivelInfo
  }
  total_rede: number
  total_comissoes_recebidas: number
}

export function useInfluencerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setIsLoading(true)
        const response = await api.get('/api/influencers/dashboard')
        
        // Log detalhado dos dados e da resposta completa
        console.log('API Response completa:', response)
        console.log('API Response Headers:', response.headers)
        console.log('API Response Status:', response.status)
        console.log('API Response Data:', response.data)
        
        // Verificando o tipo e valor do saldo_disponivel
        const saldoOriginal = response.data.saldo_disponivel
        console.log('Saldo original:', saldoOriginal)
        console.log('Tipo do saldo:', typeof saldoOriginal)
        console.log('Saldo é número?', !isNaN(saldoOriginal))
        console.log('Saldo convertido para string:', String(saldoOriginal))
        
        // Tentando diferentes formas de converter
        const saldoFloat = parseFloat(String(saldoOriginal))
        const saldoNumber = Number(saldoOriginal)
        
        console.log('Saldo após parseFloat:', saldoFloat)
        console.log('Saldo após Number:', saldoNumber)
        
        // Arredonda para cima com 2 casas decimais
        const saldoArredondado = Math.ceil(response.data.saldo_disponivel * 100) / 100
        
        const formattedData = {
          ...response.data,
          saldo_disponivel: saldoArredondado
        }
        
        console.log('Dados formatados:', formattedData)
        setData(formattedData)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  return {
    data,
    isLoading,
    error
  }
}