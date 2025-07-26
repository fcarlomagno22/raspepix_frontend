"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { LevelStats } from "@/types/network"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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

interface NetworkOverviewProps {
  stats: LevelStats[]
}

const COLORS = ["#9FFF00", "#00E5FF", "#FF00E5"]

export function NetworkOverview({ stats }: NetworkOverviewProps) {
  const totalMembers = stats.reduce((acc, curr) => acc + curr.totalMembers, 0)
  const totalActiveMembers = stats.reduce((acc, curr) => acc + curr.activeMembers, 0)
  const totalCommissions = stats.reduce((acc, curr) => acc + curr.totalCommissions, 0)
  const monthlyCommissions = stats.reduce((acc, curr) => acc + curr.monthlyCommissions, 0)

  const pieData = stats.map((stat) => ({
    name: `Nível ${stat.level}`,
    value: stat.totalMembers,
  }))

  const barData = stats.map((stat) => ({
    name: `Nível ${stat.level}`,
    "Comissões Totais": stat.totalCommissions,
    "Comissões Mensais": stat.monthlyCommissions,
  }))

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card className="p-4 bg-[#1E2530] border-gray-700">
            <h3 className="text-sm font-medium text-gray-400">Total de Membros</h3>
            <p className="text-2xl font-bold text-white mt-2">{totalMembers}</p>
            <p className="text-sm text-gray-400 mt-1">
              {totalActiveMembers} ativos ({Math.round((totalActiveMembers / totalMembers) * 100)}%)
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-4 bg-[#1E2530] border-gray-700">
            <h3 className="text-sm font-medium text-gray-400">Comissões Totais</h3>
            <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalCommissions)}</p>
            <p className="text-sm text-gray-400 mt-1">
              {formatCurrency(monthlyCommissions)}/mês
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-4 bg-[#1E2530] border-gray-700">
            <h3 className="text-sm font-medium text-gray-400">Média por Membro</h3>
            <p className="text-2xl font-bold text-white mt-2">
              {formatCurrency(totalCommissions / totalMembers)}
            </p>
            <p className="text-sm text-gray-400 mt-1">por membro ativo</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-4 bg-[#1E2530] border-gray-700">
            <h3 className="text-sm font-medium text-gray-400">Taxa de Conversão</h3>
            <p className="text-2xl font-bold text-white mt-2">
              {Math.round(
                stats.reduce((acc, curr) => acc + curr.conversionRate, 0) / stats.length
              )}%
            </p>
            <p className="text-sm text-gray-400 mt-1">média geral</p>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="p-6 bg-[#1E2530] border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Comissões por Nível</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E2530",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="Comissões Totais" fill="#9FFF00" />
                  <Bar dataKey="Comissões Mensais" fill="#00E5FF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Tabela de Níveis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card className="p-6 bg-[#1E2530] border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Detalhamento por Nível</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-400">Nível</th>
                  <th className="text-left py-3 text-gray-400">Membros</th>
                  <th className="text-left py-3 text-gray-400">Ativos</th>
                  <th className="text-left py-3 text-gray-400">Comissões</th>
                  <th className="text-left py-3 text-gray-400">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.level} className="border-b border-gray-700/50">
                    <td className="py-3 text-white">Nível {stat.level}</td>
                    <td className="py-3 text-white">{stat.totalMembers}</td>
                    <td className="py-3 text-white">
                      {stat.activeMembers} ({Math.round((stat.activeMembers / stat.totalMembers) * 100)}%)
                    </td>
                    <td className="py-3 text-white">{formatCurrency(stat.totalCommissions)}</td>
                    <td className="py-3 text-white">{stat.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 