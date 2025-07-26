"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

// Mock Data for Charts
const monthlyRevenueData = [
  { month: "Jan", revenue: 120000 },
  { month: "Fev", revenue: 150000 },
  { month: "Mar", revenue: 130000 },
  { month: "Abr", revenue: 180000 },
  { month: "Mai", revenue: 200000 },
  { month: "Jun", revenue: 220000 },
]

const prizeDistributionData = [
  { edition: "Edição #1", instant: 50000, lottery: 100000 },
  { edition: "Edição #2", instant: 60000, lottery: 120000 },
  { edition: "Edição #3", instant: 70000, lottery: 150000 },
  { edition: "Edição #4", instant: 80000, lottery: 180000 },
]

const userGrowthData = [
  { month: "Jan", users: 1000 },
  { month: "Fev", users: 1200 },
  { month: "Mar", users: 1500 },
  { month: "Abr", users: 1800 },
  { month: "Mai", users: 2200 },
  { month: "Jun", users: 2500 },
]

const profitMarginTrendData = [
  { edition: "Edição #1", margin: 15 },
  { edition: "Edição #2", margin: 18 },
  { edition: "Edição #3", margin: 16 },
  { edition: "Edição #4", margin: 20 },
]

export default function FinanceiroVisualAnalysis() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {/* Faturamento por Mês */}
      <Card className="bg-[#232A34] border-[#366D51] shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Faturamento por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Faturamento",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#366D51" />
                <XAxis dataKey="month" stroke="#9FFF00" />
                <YAxis stroke="#9FFF00" tickFormatter={(value) => formatCurrency(value)} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value: number) => formatCurrency(value)} />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Prêmios Pagos por Edição */}
      <Card className="bg-[#232A34] border-[#366D51] shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Prêmios Pagos por Edição</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              instant: {
                label: "Raspadinhas", // Alterado para "Raspadinhas"
                color: "hsl(var(--chart-2))",
              },
              lottery: {
                label: "Sorteio",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prizeDistributionData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#366D51" />
                <XAxis dataKey="edition" stroke="#9FFF00" />
                <YAxis stroke="#9FFF00" tickFormatter={(value) => formatCurrency(value)} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value: number) => formatCurrency(value)} />} />
                <Legend />
                <Bar dataKey="instant" stackId="a" fill="var(--color-instant)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lottery" stackId="a" fill="var(--color-lottery)" radius={[0, 0, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Crescimento da Base de Usuários Pagantes */}
      <Card className="bg-[#232A34] border-[#366D51] shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Crescimento da Base de Usuários Pagantes</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              users: {
                label: "Usuários",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#366D51" />
                <XAxis dataKey="month" stroke="#9FFF00" />
                <YAxis stroke="#9FFF00" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Linha de Tendência da Margem Líquida por Edição */}
      <Card className="bg-[#232A34] border-[#366D51] shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Linha de Tendência da Margem Líquida por Edição</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              margin: {
                label: "Margem (%)",
                color: "hsl(var(--chart-5))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitMarginTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#366D51" />
                <XAxis dataKey="edition" stroke="#9FFF00" />
                <YAxis stroke="#9FFF00" tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value: number) => `${value}%`} />} />
                <Line type="monotone" dataKey="margin" stroke="var(--color-margin)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
