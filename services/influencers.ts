import axios from "axios"
import { API_CONFIG } from "@/config/api"

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
})

// Função para pegar o valor de um cookie
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  const token = getCookie("admin_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Influencer {
  id: string
  nome: string
  codigo_influencer: string
  status: string
}

export interface InfluencerDashboardData {
  total_influencers: number
  receita_total: string
  total_comissoes: {
    pagas: string
    pendentes: string
  }
  taxa_media_comissao: string
  valor_medio_deposito: string
}

export async function listInfluencers(): Promise<Influencer[]> {
  const response = await api.get("/api/influencers/listar")
  // Garante que sempre retornará um array
  return Array.isArray(response.data) ? response.data : (response.data?.data || [])
}

export async function getInfluencerDashboard(dateRange?: { from: Date; to: Date }): Promise<InfluencerDashboardData> {
  const params = dateRange ? {
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString()
  } : {}
  
  const response = await api.get("/api/admin/dashboard/influencers", { params })
  return response.data
}