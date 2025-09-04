"use client"

import { useState, useEffect } from 'react'
import { api } from '@/services/api'

interface UserProfile {
  id: string
  name: string
  email: string
  cpf: string
  phone: string | null
  document: string | null
  affiliate_code: string | null
  is_influencer: boolean
  status: string
  saldo_sacavel: number
  chances_instantaneas: number
  created_at: string
  last_login: string
  profile_picture?: string
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Tentar buscar o perfil do usuário
        const response = await api.get('/api/profile/me')
        setProfile(response.data)
      } catch (err: any) {
        console.error('Erro ao buscar perfil do usuário:', err)
        setError(err.response?.data?.message || 'Erro ao carregar dados do usuário')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return {
    profile,
    loading,
    error,
    refetch: () => {
      setLoading(true)
      setError(null)
      // Recarregar os dados
      const fetchProfile = async () => {
        try {
          const response = await api.get('/api/profile/me')
          setProfile(response.data)
        } catch (err: any) {
          console.error('Erro ao buscar perfil do usuário:', err)
          setError(err.response?.data?.message || 'Erro ao carregar dados do usuário')
        } finally {
          setLoading(false)
        }
      }
      fetchProfile()
    }
  }
}
