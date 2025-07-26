import { DollarSign, Trophy, Clock, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Helper para formatar valores como moeda BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

interface DashboardMetricsProps {
  totalRevenue: number
  totalPrizeValue: number
  prizesRemaining: number
  weeklyParticipants: number
}

export default function DashboardMetrics({
  totalRevenue,
  totalPrizeValue,
  prizesRemaining,
  weeklyParticipants,
}: DashboardMetricsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <DollarSign className="h-6 w-6 text-[#9FFF00]" />
        Métricas Financeiras
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Receita Total */}
        <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Receita Total</CardTitle>
            <DollarSign className="h-5 w-5 text-[#9FFF00]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">do período selecionado</p>
          </CardContent>
        </Card>

        {/* Prêmio Total */}
        <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Prêmio Total</CardTitle>
            <Trophy className="h-5 w-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalPrizeValue)}</div>
            <p className="text-xs text-gray-500 mt-1">distribuído até agora</p>
          </CardContent>
        </Card>

        {/* Prêmios a Distribuir */}
        <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Prêmios a Distribuir</CardTitle>
            <Clock className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(prizesRemaining)}</div>
            <p className="text-xs text-gray-500 mt-1">aguardando liberação</p>
          </CardContent>
        </Card>

        {/* Participantes Sorteio */}
        <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Participantes Sorteio</CardTitle>
            <Users className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{weeklyParticipants.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-gray-500 mt-1">nesta edição</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
