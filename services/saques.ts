import { api } from "./api"

export interface WithdrawRequest {
  id: string
  influencer_id: string
  profile_id: string
  chave_pix: string
  valor: number
  status: "pendente" | "aprovado" | "reprovado" | "cancelado"
  justificativa_reprovacao: string | null
  aprovado_por: string | null
  data_solicitacao: string
  data_aprovacao: string | null
  data_reprovacao: string | null
  data_pagamento: string | null
  criado_em: string
  atualizado_em: string
  cnpj: string
  razao_social: string
  nota_fiscal_url: string
  valor_minimo_saque: number
  influencer: {
    codigo_influencer: string
  }
}

export interface WithdrawRequestsResponse {
  data: WithdrawRequest[]
  total: number
}

export const fetchWithdrawRequests = async (): Promise<WithdrawRequestsResponse> => {
  const response = await api.get<WithdrawRequestsResponse>("/api/influencer/solicitacoes-saque")
  return response.data
}

interface CancelWithdrawResponse {
  message: string
}

export const cancelWithdrawRequest = async (id: string): Promise<CancelWithdrawResponse> => {
  const response = await api.put<CancelWithdrawResponse>(`/api/influencer/solicitacoes-saque/${id}/cancelar`)
  return response.data
}
