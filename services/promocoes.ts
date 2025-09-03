import { api } from "./api"

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface Promocao {
  id: string
  titulo: string
  descricao: string
  tipo_premiacao: "bonus_dinheiro" | "premio_fisico" | "recompensa_especial"
  premio_descricao: string
  meta_vendas: number
  inicio_em: string
  fim_em: string
  is_ativa: boolean
  criado_em: string
  atualizado_em: string
}

interface CriarPromocaoDTO {
  titulo: string
  descricao: string
  tipo_premiacao: "bonus_dinheiro" | "premio_fisico" | "recompensa_especial"
  premio_descricao: string
  meta_vendas: number
  inicio_em: string
  fim_em: string
}

interface InfluencerPromocao {
  id: string
  nome: string
  codigo_influencer: string
  instagram: string | null
  meta_vendas: number
  progresso_vendas: number
  percentual_progresso: number
  valor_faltante: number
  status: string
  status_premio: "pendente" | "recebido"
}

async function criar(data: CriarPromocaoDTO): Promise<ApiResponse<any>> {
  try {
    const response = await api.post("/api/admin/promocoes", data)
    return response.data
  } catch (error) {
    console.error("Erro ao criar promoção:", error)
    return {
      success: false,
      error: "Erro ao criar promoção"
    }
  }
}

async function excluir(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await api.delete(`/api/admin/promocoes/${id}`)
    return response.data
  } catch (error) {
    console.error("Erro ao excluir promoção:", error)
    return {
      success: false,
      error: "Erro ao excluir promoção"
    }
  }
}

async function buscarInfluencers(id: string): Promise<ApiResponse<InfluencerPromocao[]>> {
  try {
    const response = await api.get(`/api/admin/promocoes/${id}/influencers`)
    return response.data
  } catch (error) {
    console.error("Erro ao buscar influencers da promoção:", error)
    return {
      success: false,
      error: "Erro ao buscar influencers da promoção"
    }
  }
}

export const promocoesService = {
  criar,
  excluir,
  buscarInfluencers,
}