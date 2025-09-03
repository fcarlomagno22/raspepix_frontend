"use client"

import { useState, useEffect } from "react"
import { api } from "@/services/api"

export function useInfluencerStatus() {
  const [isInfluencer, setIsInfluencer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Verifica se o usuário já é influencer ao carregar o componente
  useEffect(() => {
    const checkInfluencerStatus = async () => {
      try {
        const response = await api.get('/api/influencers/check-status')
        setIsInfluencer(response.data.isInfluencer)
      } catch (error: any) {
        console.error('Erro ao verificar status de influencer:', error)
        setError(error)
        setIsInfluencer(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkInfluencerStatus()
  }, [])

  const acceptTerms = async () => {
    try {
      setIsLoading(true)
      // Chama a rota de aceite dos termos
      const response = await api.post('/api/influencers/accept-terms')
      
      // Verifica novamente o status após aceitar os termos
      const statusResponse = await api.get('/api/influencers/check-status')
      setIsInfluencer(statusResponse.data.isInfluencer)
      
      return response.data
    } catch (error: any) {
      console.error('Erro ao aceitar termos:', error.response?.data || error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isInfluencer,
    isLoading,
    error,
    acceptTerms
  }
}