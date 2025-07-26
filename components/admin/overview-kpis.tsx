"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, Ticket, Gift, Clock, DollarSign, Trophy, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils" // Importar formatCurrency

interface OverviewKPIsProps {
  totalUsers: number
  newUsers: number
  activeUsers: number
  totalTokensGenerated: number
  totalTokensUsed: number
  activeTokensPercentage: number
  averageTicket: number
  prizeWinnersPercentage: number
  totalPrizesDistributed: number
  withdrawalPercentage: number
}

export default function OverviewKPIs({
  totalUsers,
  newUsers,
  activeUsers,
  totalTokensGenerated,
  totalTokensUsed,
  activeTokensPercentage,
  averageTicket,
  prizeWinnersPercentage,
  totalPrizesDistributed,
  withdrawalPercentage,
}: OverviewKPIsProps) {
  const kpis = [
    {
      title: "Total de Usuários Cadastrados",
      value: totalUsers.toLocaleString("pt-BR"),
      description: "Todos os usuários da plataforma",
      icon: Users,
      color: "text-[#9FFF00]",
    },
    {
      title: "Novos Usuários no Período",
      value: newUsers.toLocaleString("pt-BR"),
      description: "Cadastrados no período selecionado",
      icon: Users,
      color: "text-[#9FFF00]",
    },
    {
      title: "Usuários Ativos no Período",
      value: activeUsers.toLocaleString("pt-BR"),
      description: "Interagiram com fichas/raspadinhas",
      icon: CheckCircle,
      color: "text-[#9FFF00]",
    },
    {
      title: "Total de Fichas Geradas",
      value: totalTokensGenerated.toLocaleString("pt-BR"),
      description: "Compra de números + bônus",
      icon: Ticket,
      color: "text-[#9FFF00]",
    },
    {
      title: "Total de Fichas Utilizadas",
      value: totalTokensUsed.toLocaleString("pt-BR"),
      description: "Em raspadinhas",
      icon: Gift,
      color: "text-[#9FFF00]",
    },
    {
      title: "% Usuários com Fichas Ativas",
      value: `${activeTokensPercentage.toFixed(1)}%`,
      description: "Fichas não utilizadas e válidas",
      icon: Clock,
      color: "text-[#9FFF00]",
    },
    {
      title: "Ticket Médio por Compra",
      value: formatCurrency(averageTicket),
      description: "Números da sorte",
      icon: DollarSign,
      color: "text-[#9FFF00]",
    },
    {
      title: "% Usuários Premiados",
      value: `${prizeWinnersPercentage.toFixed(1)}%`,
      description: "Raspadinhas e sorteios",
      icon: Trophy,
      color: "text-[#9FFF00]",
    },
    {
      title: "Prêmios Distribuídos",
      value: formatCurrency(totalPrizesDistributed),
      description: "No período selecionado",
      icon: Gift,
      color: "text-[#9FFF00]",
    },
    {
      title: "% Usuários com Saques",
      value: `${withdrawalPercentage.toFixed(1)}%`,
      description: "Realizaram saques",
      icon: Wallet,
      color: "text-[#9FFF00]",
    },
  ]

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-col items-center justify-center pb-2 text-center">
            <CardTitle className="text-sm font-medium text-white text-center">{kpi.title}</CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color} mt-1`} />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-white text-center">{kpi.value}</div>
            <p className="text-xs text-gray-400 text-center">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
