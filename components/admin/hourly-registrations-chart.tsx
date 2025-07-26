"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface HourlyRegistrationsData {
  time: string // Ex: "00h-03h"
  registrations: number
}

interface HourlyRegistrationsChartProps {
  data: HourlyRegistrationsData[]
}

export default function HourlyRegistrationsChart({ data }: HourlyRegistrationsChartProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Clock className="h-6 w-6 text-blue-400" />
        Tendência de Cadastros por Horário
      </h2>
      <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">Novos Cadastros ao Longo do Dia</CardTitle>
          <p className="text-sm text-gray-400">Identifique os períodos do dia com maior volume de novos cadastros.</p>
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
                padding={{ left: 30, right: 30 }}
                interval={0}
              />
              <YAxis stroke="#9FFF00" tickLine={false} axisLine={false} width={60} />
              <Tooltip
                cursor={{ fill: "#9FFF00", opacity: 0.1 }}
                contentStyle={{
                  backgroundColor: "#1A2430",
                  borderColor: "#9FFF00",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                }}
                labelStyle={{ color: "#9FFF00" }}
                formatter={(value: number) => [value.toLocaleString("pt-BR"), "Cadastros"]}
              />
              <Bar dataKey="registrations" fill="#9FFF00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  )
}
