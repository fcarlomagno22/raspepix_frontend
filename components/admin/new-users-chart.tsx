"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus } from "lucide-react"

interface NewUsersData {
  date: string
  newUsers: number
}

interface NewUsersChartProps {
  data: NewUsersData[]
}

export default function NewUsersChart({ data }: NewUsersChartProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <UserPlus className="h-6 w-6 text-[#9FFF00]" />
        Novos Usuários por Período
      </h2>
      <Card className="bg-[#1A2430] border-[#9FFF00]/20 p-6 rounded-lg shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">Tendência de Cadastros</CardTitle>
          <p className="text-sm text-gray-400">Número de novos usuários registrados ao longo do tempo.</p>
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
              <XAxis dataKey="date" stroke="#9FFF00" tickLine={false} axisLine={false} />
              <YAxis stroke="#9FFF00" tickLine={false} axisLine={false} width={60} />
              <Tooltip
                cursor={{ stroke: "#9FFF00", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "#1A2430",
                  borderColor: "#9FFF00",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                }}
                labelStyle={{ color: "#9FFF00" }}
                formatter={(value: number) => [value.toLocaleString("pt-BR"), "Novos Usuários"]}
              />
              <Line
                type="monotone"
                dataKey="newUsers"
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
