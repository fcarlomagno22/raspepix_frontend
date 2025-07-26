"use client"

import { DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  type LotteryEdition,
  type ExpensePlanForLottery,
  type ScratchCardForLottery,
  calculateFinancials,
} from "@/lib/mock-lottery-data"
import { cn } from "@/lib/utils"

interface LotteryFinancialSummaryProps {
  editions: LotteryEdition[]
  expensePlans: ExpensePlanForLottery[]
  scratchCards: ScratchCardForLottery[]
  filterStatus: "Todos" | LotteryEdition["status"]
}

export default function LotteryFinancialSummary({
  editions,
  expensePlans,
  scratchCards,
  filterStatus,
}: LotteryFinancialSummaryProps) {
  if (editions.length === 0) {
    return null // Don't show summary if no editions are filtered
  }

  let totalEstimatedGrossRevenue = 0
  let totalPrizes = 0
  let totalExpenses = 0
  let totalEstimatedResult = 0

  editions.forEach((edition) => {
    const financials = calculateFinancials(edition, expensePlans, scratchCards)
    totalEstimatedGrossRevenue += financials.estimatedGrossRevenue
    totalPrizes += financials.totalPrizes
    totalExpenses += financials.totalExpenses
    totalEstimatedResult += financials.estimatedResult
  })

  const getStatusText = (status: "Todos" | LotteryEdition["status"]) => {
    switch (status) {
      case "Todos":
        return "Todas as Edições"
      case "ativo":
        return "Edições Ativas"
      case "encerrado":
        return "Edições Encerradas"
      case "futuro":
        return "Edições Futuras"
      default:
        return "Edições"
    }
  }

  return (
    <div className="mt-8 p-6 bg-[#0D1117] rounded-lg shadow-md border border-[#9FFF00]/10">
      <h2 className="text-xl font-bold text-[#9FFF00] mb-4">Resumo Financeiro Geral ({getStatusText(filterStatus)})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-300">
        <Card className="flex flex-col items-center p-3 bg-[#1A2430] rounded-md border border-[#9FFF00]/10">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Receita Bruta Estimada</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex items-center">
            <DollarSign className="h-5 w-5 text-[#9FFF00] mr-2" />
            <span className="text-lg font-bold text-white">{formatCurrency(totalEstimatedGrossRevenue)}</span>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center p-3 bg-[#1A2430] rounded-md border border-[#9FFF00]/10">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total de Prêmios</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex items-center">
            <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-lg font-bold text-white">{formatCurrency(totalPrizes)}</span>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center p-3 bg-[#1A2430] rounded-md border border-[#9FFF00]/10">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex items-center">
            <DollarSign className="h-5 w-5 text-orange-400 mr-2" />
            <span className="text-lg font-bold text-white">{formatCurrency(totalExpenses)}</span>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center p-3 bg-[#1A2430] rounded-md border border-[#9FFF00]/10">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Lucro/Prejuízo Estimado</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex items-center">
            {totalEstimatedResult >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className={cn("text-lg font-bold", totalEstimatedResult >= 0 ? "text-green-500" : "text-red-500")}>
              {formatCurrency(totalEstimatedResult)}
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
