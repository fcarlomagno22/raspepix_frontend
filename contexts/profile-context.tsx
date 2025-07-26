"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Mock do tipo de perfil
interface UserProfile {
  id: string
  saldo_para_jogar: number
  saldo_sacavel: number
  // Adicione outras propriedades do perfil conforme necessário
}

interface ProfileContextType {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  // Adicione funções para atualizar o perfil, se necessário
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simula o carregamento de dados do perfil
    const fetchProfile = async () => {
      try {
        setLoading(true)
        // Simula um atraso de rede
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Dados mockados do perfil
        const mockProfile: UserProfile = {
          id: "user-123",
          saldo_para_jogar: 1500,
          saldo_sacavel: 250.75,
        }
        setProfile(mockProfile)
      } catch (err) {
        setError("Falha ao carregar o perfil.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return <ProfileContext.Provider value={{ profile, loading, error }}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
