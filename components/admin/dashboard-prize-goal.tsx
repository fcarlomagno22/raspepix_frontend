import { Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Helper para formatar valores como moeda BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

interface PrizeGoalProps {
  totalRevenue: number
}

const prizeTiers = [
  {
    range: "R$ 0 - R$ 10.000",
    prizes: "Prêmios de até R$ 500",
    threshold: 10000,
  },
  {
    range: "R$ 10.001 - R$ 50.000",
    prizes: "Prêmios de até R$ 2.500",
    threshold: 50000,
  },
  {
    range: "R$ 50.001 - R$ 100.000",
    prizes: "Prêmios de até R$ 10.000",
    threshold: 100000,
  },
  {
    range: "Acima de R$ 100.000",
    prizes: "Prêmios de até R$ 50.000",
    threshold: Number.POSITIVE_INFINITY,
  },
]

export default function DashboardPrizeGoal({ totalRevenue }: PrizeGoalProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Target className="h-6 w-6 text-yellow-400" />
        Meta de Premiação
      </h2>
      <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">Estrutura de Liberação de Prêmios</CardTitle>
          <p className="text-sm text-gray-400">
            Valor arrecadado: <span className="font-bold text-[#9FFF00]">{formatCurrency(totalRevenue)}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {prizeTiers.map((tier, index) => {
            const isUnlocked = totalRevenue >= tier.threshold || (index === 0 && totalRevenue >= 0)
            const isPartial = !isUnlocked && totalRevenue > (prizeTiers[index - 1]?.threshold || 0)
            const statusText = isUnlocked ? "Liberado" : isPartial ? "Parcial" : "Pendente"
            const statusColor = isUnlocked
              ? "bg-[#9FFF00]/10 border border-[#9FFF00]/30 text-[#9FFF00]"
              : isPartial
                ? "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400"
                : "bg-gray-500 text-white"

            let progressValue = 0
            if (index === 0) {
              progressValue = Math.min((totalRevenue / tier.threshold) * 100, 100)
            } else if (tier.threshold !== Number.POSITIVE_INFINITY) {
              const prevThreshold = prizeTiers[index - 1]?.threshold || 0
              progressValue = Math.min(((totalRevenue - prevThreshold) / (tier.threshold - prevThreshold)) * 100, 100)
            } else if (totalRevenue > (prizeTiers[index - 1]?.threshold || 0)) {
              progressValue = 100 // For the "above X" tier, if reached, it's 100%
            }

            return (
              <div
                key={index}
                className="bg-[#374151] hover:bg-[#4B5563] transition-colors p-4 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-2"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{tier.range}</p>
                  <p className="text-xs text-gray-300">{tier.prizes}</p>
                </div>
                <div className="flex items-center gap-2 md:ml-4">
                  <Progress
                    value={progressValue}
                    className="w-24 h-2 bg-gray-600"
                    indicatorClassName={statusColor.split(" ")[0]}
                  />{" "}
                  {/* Apenas a primeira classe para o indicador */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{statusText}</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </section>
  )
}
