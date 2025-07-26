"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

// Helper para formatar valores como moeda BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

interface HourlySalesData {
  time: string // Ex: "08h-09h"
  averageSales: number
}

interface HourlySalesChartProps {
  data: HourlySalesData[]
}

export default function HourlySalesChart({ data }: HourlySalesChartProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Clock className="h-6 w-6 text-orange-400" />
        Média de Vendas por Horário
      </h2>
      <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">Horários de Pico de Vendas</CardTitle>
          <p className="text-sm text-gray-400">Identifique os períodos com maior volume de vendas.</p>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#9FFF00"
                tickLine={false}
                axisLine={false}
                padding={{ left: 30, right: 30 }} // Adiciona padding nas extremidades
                interval={0} // Garante que todos os rótulos sejam exibidos
              />
              <YAxis stroke="#9FFF00" tickFormatter={formatCurrency} tickLine={false} axisLine={false} width={80} />
              <Tooltip
                cursor={{ fill: "#9FFF00", opacity: 0.1 }}
                contentStyle={{
                  backgroundColor: "#1A2430",
                  borderColor: "#9FFF00",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                }}
                labelStyle={{ color: "#9FFF00" }}
                formatter={(value: number) => [formatCurrency(value), "Média de Vendas"]}
              />
              <Bar dataKey="averageSales" fill="#9FFF00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  )
}
