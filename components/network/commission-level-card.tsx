"use client"

import { motion } from "framer-motion"
import { LevelStats, NetworkLevel } from "@/types/network"
import { Card } from "@/components/ui/card"
import { Users, TrendingUp, Percent } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CommissionLevelCardProps {
  stats: LevelStats
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

export function CommissionLevelCard({ stats }: CommissionLevelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-gradient-to-br ${LEVEL_COLORS[stats.level]} border p-4 relative overflow-hidden`}>
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-white/5 rounded-xl animate-pulse-slow" />
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-white">{LEVEL_NAMES[stats.level]}</h3>
            <p className="text-sm text-gray-400">Nível {stats.level}</p>
          </div>
          <div className="flex items-center bg-white/10 rounded-full px-3 py-1">
            <Percent className="h-4 w-4 text-[#9FFF00] mr-1" />
            <span className="text-[#9FFF00] font-bold">{stats.percentage}%</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
          {/* Membros */}
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Membros</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">{stats.totalMembers}</span>
              <span className="text-xs text-gray-400">{stats.activeMembers} ativos</span>
            </div>
          </div>

          {/* Comissões */}
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Comissões</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">{formatCurrency(stats.totalCommissions)}</span>
              <span className="text-xs text-gray-400">
                {formatCurrency(stats.monthlyCommissions)}/mês
              </span>
            </div>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-black/20 rounded-lg p-3 relative z-10">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Taxa de Conversão</span>
            <span className="text-sm font-bold text-[#9FFF00]">{stats.conversionRate}%</span>
          </div>
          <div className="w-full h-2 bg-black/20 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-[#9FFF00] rounded-full transition-all duration-500"
              style={{ width: `${stats.conversionRate}%` }}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 