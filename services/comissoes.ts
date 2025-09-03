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

interface ComissaoPayload {
  nivel: "direto" | "secundario" | "expandido"
  percentual: number
}

export async function atualizarComissoesGlobais(comissoes: ComissaoPayload[]) {
  const response = await api.put("/api/admin/influencers/comissoes/globais", { comissoes })
  return response.data
}

export async function atualizarComissoesInfluencer(influencerId: string, comissoes: ComissaoPayload[]) {
  const response = await api.put(`/api/admin/influencers/${influencerId}/comissoes`, { comissoes })
  return response.data
}