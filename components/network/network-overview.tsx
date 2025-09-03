"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useInfluencerDashboard } from "@/hooks/use-influencer-dashboard"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#9FFF00", "#00E5FF", "#FF00E5"]

export function NetworkOverview() {
  const { data, isLoading, error } = useInfluencerDashboard()

  const pieData = data ? [
    { name: "Nível 1", value: data.niveis.nivel_1.quantidade_membros },
    { name: "Nível 2", value: data.niveis.nivel_2.quantidade_membros }
  ] : []

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card className="p-3 bg-[#1E2530] border-gray-700 flex flex-col items-center text-center">
            <h3 className="text-xs font-medium text-gray-400">Total de Influencers</h3>
            <p className="text-lg font-bold text-white mt-1">{isLoading ? "..." : error ? "-" : data?.total_rede}</p>
            <p className="text-xs text-gray-400 mt-1">
              Total da rede
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-3 bg-[#1E2530] border-gray-700 flex flex-col items-center text-center">
            <h3 className="text-xs font-medium text-gray-400">Comissões Totais</h3>
            <p className="text-lg font-bold text-white mt-1">{isLoading ? "..." : error ? "-" : formatCurrency(data?.total_comissoes_recebidas || 0)}</p>
            <p className="text-xs text-gray-400 mt-1">
              Total recebido
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Gráfico de Distribuição */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="p-6 bg-[#1E2530] border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Distribuição da Rede</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 