import { Activity, Ticket, Gift, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DashboardActivityProps {
  tokensGenerated: number
  tokensUsed: number
  scratchCardsPlayed: number
  prizesDelivered: number
  prizesRemainingCount: number
}

export default function DashboardActivity({
  tokensGenerated,
  tokensUsed,
  scratchCardsPlayed,
  prizesDelivered,
  prizesRemainingCount,
}: DashboardActivityProps) {
  const tokensUsedPercentage = (tokensUsed / tokensGenerated) * 100
  const prizesDeliveredPercentage = (prizesDelivered / scratchCardsPlayed) * 100
  const prizesRemainingPercentage = (prizesRemainingCount / (prizesDelivered + prizesRemainingCount)) * 100 || 0

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Activity className="h-6 w-6 text-blue-400" />
        Atividade da Plataforma
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Fichas Geradas */}
        <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Fichas Geradas</CardTitle>
            <Ticket className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{tokensGenerated.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-gray-500 mt-1">
              {tokensUsed.toLocaleString("pt-BR")} utilizadas (
              {tokensUsedPercentage ? tokensUsedPercentage.toFixed(1) : 0}%)
            </p>
            <Progress value={tokensUsedPercentage} className="mt-3 h-2 bg-gray-700" indicatorClassName="bg-blue-500" />
          </CardContent>
        </Card>

        {/* Raspadinhas Jogadas */}
        <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Raspadinhas Jogadas</CardTitle>
            <Gift className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{scratchCardsPlayed.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-gray-500 mt-1">
              {prizesDelivered.toLocaleString("pt-BR")} prêmios entregues (
              {prizesDeliveredPercentage ? prizesDeliveredPercentage.toFixed(1) : 0}%)
            </p>
            <Progress
              value={prizesDeliveredPercentage}
              className="mt-3 h-2 bg-gray-700"
              indicatorClassName="bg-purple-500"
            />
          </CardContent>
        </Card>

        {/* Prêmios Restantes */}
        <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Prêmios Restantes</CardTitle>
            <Clock className="h-5 w-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{prizesRemainingCount.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-gray-500 mt-1">Aguardando liberação</p>
            <Progress
              value={prizesRemainingPercentage}
              className="mt-3 h-2 bg-gray-700"
              indicatorClassName="bg-yellow-500"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
