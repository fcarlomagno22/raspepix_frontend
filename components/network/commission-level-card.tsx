"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Users, TrendingUp, Percent } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useInfluencerDashboard } from "@/hooks/use-influencer-dashboard"
import { useInfluencerStats } from "@/hooks/use-influencer-stats"
import { useCommissions } from "@/hooks/use-commissions"

interface CommissionLevelCardProps {
  level: 1 | 2 | 3
}

const LEVEL_COLORS = {
  1: "from-green-500/20 to-green-600/20 border-green-500/30",
  2: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  3: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
} as const

const LEVEL_NAMES = {
  1: "Indicações Diretas",
  2: "Rede Secundária",
  3: "Rede Expandida",
} as const

export function CommissionLevelCard({ level }: CommissionLevelCardProps) {
  const { data, isLoading, error } = useInfluencerDashboard()
  const { data: statsData, isLoading: statsLoading, error: statsError } = useInfluencerStats()
  const { getCommissionByLevel, isLoading: commissionsLoading, commissions } = useCommissions()
  
  const nivelData = level === 2 ? data?.niveis.nivel_1 : level === 3 ? data?.niveis.nivel_2 : null
  const isCardLoading = level === 1 ? statsLoading : isLoading || commissionsLoading
  const cardError = level === 1 ? statsError : error

  console.log('Comissões no card:', commissions)
  console.log('Nível:', level)
  console.log('Comissão para o nível:', getCommissionByLevel(level))
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-gradient-to-br ${LEVEL_COLORS[level]} border p-4 relative overflow-hidden`}>
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-white/5 rounded-xl animate-pulse-slow" />
        
        {/* Cabeçalho */}
        <div className="flex flex-col items-center mb-4 relative z-10">
          <h3 className="text-lg font-bold text-white text-center">{LEVEL_NAMES[level]}</h3>
          <p className="text-sm text-gray-400 mb-2">Nível {level}</p>
          <div className="flex items-center bg-white/10 rounded-full px-3 py-1">
            <Percent className="h-4 w-4 text-[#9FFF00] mr-1" />
            <span className="text-[#9FFF00] font-bold">Comissão: {isCardLoading ? "..." : cardError ? "-" : getCommissionByLevel(level)}% do depósito</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
          {/* Membros */}
          <div className="bg-black/20 rounded-lg p-3 flex flex-col items-center">
            <div className="flex flex-col items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400 text-center">{level === 1 ? "Indicados" : "Membros"}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-white">
                {isCardLoading ? "..." : cardError ? "-" : level === 1 ? statsData?.total_indicados : nivelData?.quantidade_membros}
              </span>
              {level !== 1 && (
                <span className="text-xs text-gray-400">{isLoading ? "..." : error ? "-" : nivelData?.membros_ativos} ativos</span>
              )}
            </div>
          </div>

          {/* Comissões */}
          <div className="bg-black/20 rounded-lg p-3 flex flex-col items-center">
            <div className="flex flex-col items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400 text-center">Comissões</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-white">
                {isCardLoading ? "..." : cardError ? "-" : level === 1 ? formatCurrency(statsData?.total_comissoes || 0) : formatCurrency(nivelData?.comissoes_recebidas || 0)}
              </span>
              <span className="text-xs text-gray-400 text-center">
                Total recebido
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 