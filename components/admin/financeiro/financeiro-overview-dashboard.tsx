"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Trophy, TrendingUp, Percent } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"

export default function FinanceiroOverviewDashboard() {
  // Mock data for demonstration
  const mockData = {
    faturamentoBrutoTotal: 2500000,
    totalPremiosPagos: 1200000,
    custosOperacionaisTotais: 500000,
    impostosTotais: 300000,
  }

  const receitaLiquida =
    mockData.faturamentoBrutoTotal -
    mockData.totalPremiosPagos -
    mockData.custosOperacionaisTotais -
    mockData.impostosTotais
  const margemLucro = mockData.faturamentoBrutoTotal > 0 ? (receitaLiquida / mockData.faturamentoBrutoTotal) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Faturamento Bruto Total</CardTitle>
          <DollarSign className="h-4 w-4 text-[#9FFF00]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(mockData.faturamentoBrutoTotal)}</div>
          <p className="text-xs text-gray-400">Receita total de vendas</p>
        </CardContent>
      </Card>

      <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total de Prêmios Pagos</CardTitle>
          <Trophy className="h-4 w-4 text-[#9FFF00]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(mockData.totalPremiosPagos)}</div>
          <p className="text-xs text-gray-400">Instantâneos + Sorteios</p>
        </CardContent>
      </Card>

      <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Receita Líquida</CardTitle>
          <TrendingUp className="h-4 w-4 text-[#9FFF00]" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${receitaLiquida >= 0 ? "text-[#9FFF00]" : "text-[#ef4444]"}`}>
            {formatCurrency(receitaLiquida)}
          </div>
          <p className="text-xs text-gray-400">Faturamento - Prêmios - Custos - Impostos</p>
        </CardContent>
      </Card>

      <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Margem de Lucro</CardTitle>
          <Percent className="h-4 w-4 text-[#9FFF00]" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${margemLucro >= 0 ? "text-[#9FFF00]" : "text-[#ef4444]"}`}>
            {formatPercentage(margemLucro)}
          </div>
          <p className="text-xs text-gray-400">(Receita Líquida / Faturamento Bruto) * 100</p>
        </CardContent>
      </Card>
    </div>
  )
}
