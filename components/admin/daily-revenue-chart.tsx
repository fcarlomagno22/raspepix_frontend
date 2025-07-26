"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

// Helper para formatar valores como moeda BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

interface DailyRevenueData {
  day: string
  revenue: number
}

interface DailyRevenueChartProps {
  data: DailyRevenueData[]
}

export default function DailyRevenueChart({ data }: DailyRevenueChartProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <DollarSign className="h-6 w-6 text-[#9FFF00]" />
        Evolução da Receita Diária
      </h2>
      <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">Receita por Dia da Semana</CardTitle>
          <p className="text-sm text-gray-400">Desempenho financeiro diário da edição atual.</p>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9FFF00" tickLine={false} axisLine={false} />
              <YAxis stroke="#9FFF00" tickFormatter={formatCurrency} tickLine={false} axisLine={false} width={80} />
              <Tooltip
                cursor={{ stroke: "#9FFF00", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "#1A2430",
                  borderColor: "#9FFF00",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                }}
                labelStyle={{ color: "#9FFF00" }}
                formatter={(value: number) => [formatCurrency(value), "Receita"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#9FFF00"
                strokeWidth={2}
                dot={{ stroke: "#9FFF00", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#9FFF00", strokeWidth: 2, fill: "#9FFF00" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  )
}
