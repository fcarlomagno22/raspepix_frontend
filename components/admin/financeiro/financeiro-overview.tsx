"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Trophy, Wallet, Hash, TrendingUp, Percent } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface FinanceiroOverviewProps {
  editionId: string
}

export default function FinanceiroOverview({ editionId }: FinanceiroOverviewProps) {
  // Mock data for demonstration
  const mockData = {
    receitaBruta: 1500000,
    totalNumerosVendidos: 150000,
    totalPremiosDistribuidos: 800000,
    custoOperacional: 350000,
  }

  // Calculations
  const resultadoLiquido = mockData.receitaBruta - mockData.totalPremiosDistribuídos - mockData.custoOperacional
  const margemLucro = mockData.receitaBruta > 0 ? (resultadoLiquido / mockData.receitaBruta) * 100 : 0

  if (!editionId) {
    return <div className="text-white text-center py-8">Carregando dados da edição...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Faturamento Bruto</CardTitle>
          <DollarSign className="h-4 w-4 text-[#9FFF00]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(mockData.receitaBruta)}</div>
          <p className="text-xs text-gray-400">Soma de todos os valores arrecadados</p>
        </CardContent>
      </Card>

      <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Prêmios Distribuídos</CardTitle>
          <Trophy className="h-4 w-4 text-[#9FFF00]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(mockData.totalPremiosDistribuídos)}</div>
          <p className="text-xs text-gray-400">Soma dos prêmios instantâneos + sorteio</p>
        </CardContent>
      </Card>

      <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Custo Operacional</CardTitle>
          <Wallet className="h-4 w-4 text-[#9FFF00]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(mockData.custoOperacional)}</div>
          <p className="text-xs text-gray-400">Soma de todas as despesas operacionais</p>
        </CardContent>
      </Card>

      <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Números Vendidos</CardTitle>
          <Hash className="h-4 w-4 text-[#9FFF00]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{mockData.totalNumerosVendidos.toLocaleString("pt-BR")}</div>
          <p className="text-xs text-gray-400">Quantidade total de números da sorte</p>
        </CardContent>
      </Card>

      <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Resultado Líquido</CardTitle>
          <TrendingUp className="h-4 w-4 text-[#9FFF00]" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${resultadoLiquido >= 0 ? "text-[#9FFF00]" : "text-[#ef4444]"}`}>
            {formatCurrency(resultadoLiquido)}
          </div>
          <p className="text-xs text-gray-400">Faturamento - Prêmios - Despesas</p>
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
          <p className="text-xs text-gray-400">(Lucro Líquido / Faturamento) * 100</p>
        </CardContent>
      </Card>
    </div>
  )
}
