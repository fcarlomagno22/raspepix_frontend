"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { NetworkStats } from "@/types/network"
import { Users, TrendingUp, DollarSign, CalendarIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getInfluencerDashboard, InfluencerDashboardData } from "@/services/influencers"
import { DateRange } from "@/types/date-range"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { addDays, subDays } from "date-fns"

interface NetworkOverviewAdminProps {
  stats: NetworkStats[]
}

export function NetworkOverviewAdmin({ stats }: NetworkOverviewAdminProps) {
  const [dashboardData, setDashboardData] = useState<InfluencerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        // Aqui você pode passar o range de datas para a API
        const data = await getInfluencerDashboard()
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
        console.error('Erro ao buscar dados do dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [dateRange]) // Adiciona dateRange como dependência

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end mb-6">
          <div className="w-72 animate-pulse">
            <div className="h-10 bg-gray-600 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[#232A34] border-[#366D51] p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-600 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-500 text-red-200 p-4 rounded-lg">
          Erro ao carregar dados: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Data */}
      <div className="flex justify-end mb-6">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="bg-[#232A34] border-[#366D51] text-white"
        />
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#232A34] border-[#366D51] p-6 h-[240px]">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users className="h-12 w-12 text-[#9FFF00] mb-4" />
            <p className="text-lg text-gray-400 mb-2">Total de Membros</p>
            <h3 className="text-4xl font-bold text-white">{dashboardData?.total_influencers || 0}</h3>
          </div>
        </Card>

        <Card className="bg-[#232A34] border-[#366D51] p-6 h-[240px]">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <DollarSign className="h-12 w-12 text-[#9FFF00] mb-4" />
            <p className="text-lg text-gray-400 mb-2">Receita Total</p>
            <h3 className="text-4xl font-bold text-white">
              {dashboardData?.receita_total ? formatCurrency(parseFloat(dashboardData.receita_total)) : 'R$ 0,00'}
            </h3>
          </div>
        </Card>

        <Card className="bg-[#232A34] border-[#366D51] p-6 h-[240px]">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <DollarSign className="h-12 w-12 text-[#9FFF00] mb-4" />
            <p className="text-lg text-gray-400 mb-2">Comissões</p>
            <h3 className="text-4xl font-bold text-white">
              {dashboardData?.total_comissoes?.pagas ? formatCurrency(parseFloat(dashboardData.total_comissoes.pagas)) : 'R$ 0,00'}
            </h3>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-1">A Pagar</p>
              <p className="text-xl text-[#9FFF00]">
                {dashboardData?.total_comissoes?.pendentes ? formatCurrency(parseFloat(dashboardData.total_comissoes.pendentes)) : 'R$ 0,00'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-[#232A34] border-[#366D51] p-6 h-[240px]">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <TrendingUp className="h-12 w-12 text-[#9FFF00] mb-4" />
            <p className="text-lg text-gray-400 mb-2">Taxa Média de Comissão</p>
            <h3 className="text-4xl font-bold text-white">
              {dashboardData?.taxa_media_comissao ? `${dashboardData.taxa_media_comissao}%` : '0%'}
            </h3>
          </div>
        </Card>
      </div>
    </div>
  )
} 