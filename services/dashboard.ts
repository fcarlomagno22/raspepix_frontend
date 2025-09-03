import { api } from '@/services/api'

export interface Edicao {
  id: string
  nome: string
  data_inicio: string
  data_fim: string
  status: string
}

export interface DashboardMetrics {
  titulos_vendidos: number
  receita_total: number
  premio_total_distribuido: number
  premios_a_distribuir: number
  total_participantes: number
  receita_diaria: Array<{
    data: string
    quantidade: number
    receita: number
  }>
  vendas_por_horario: Array<{
    hora: number
    quantidade: number
    receita: number
  }>
}

export const dashboardService = {
  getEdicoes: async (): Promise<Edicao[]> => {
    const response = await api.get('/api/admin/dashboard-metrics/edicoes')
    return response.data
  },

  getMetricas: async (edicaoId: string): Promise<DashboardMetrics> => {
    const response = await api.get(`/api/admin/dashboard-metrics/metricas/${edicaoId}`)
    return response.data
  }
}
