import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { AxiosError } from 'axios'

interface ReferralLinkResponse {
  code: string
  referralLink: string
}

export function useReferralLink(isInfluencer: boolean) {
  const [referralLink, setReferralLink] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchReferralLink() {
      if (!isInfluencer) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await api.get<ReferralLinkResponse>('/api/influencers/referral-link')
        
        if (!isMounted) return

        if (!response.data?.referralLink) {
          throw new Error('Link de divulgação não encontrado')
        }
        
        setReferralLink(response.data.referralLink)
      } catch (err) {
        if (!isMounted) return

        console.error('Erro ao buscar link de divulgação:', err)
        
        if ((err as AxiosError)?.response?.status === 401) {
          setError('Sua sessão expirou. Por favor, faça login novamente')
        } else if ((err as AxiosError)?.response?.data?.error) {
          setError((err as AxiosError).response?.data?.error)
        } else if ((err as AxiosError)?.request) {
          setError('Erro de conexão com o servidor. Por favor, tente novamente')
        } else {
          setError('Não foi possível carregar seu link de divulgação. Por favor, tente novamente')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchReferralLink()

    return () => {
      isMounted = false
    }
  }, [isInfluencer])

  return { referralLink, isLoading, error }
}