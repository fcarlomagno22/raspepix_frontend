"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"

// Mock Data
const genderData = [
  { name: "Masculino", value: 6000 },
  { name: "Feminino", value: 4500 },
  { name: "Outro/Não declarado", value: 500 },
]

const ageData = [
  { name: "18-24", users: 2500 },
  { name: "25-34", users: 4000 },
  { name: "35-44", users: 3000 },
  { name: "45-54", users: 1500 },
  { name: "55+", users: 800 },
]

const COLORS = ["#9ffe00", "#6B8E23", "#3D550C", "#A0A0A0", "#708090"] // Cores para os gráficos

export default function UserDemographics() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Análise Demográfica</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Gênero */}
        <Card className="rounded-2xl bg-[#0D1117] border-[#9ffe00]/10 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Distribuição por Gênero</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1A2430", border: "none", borderRadius: "8px" }}
                  itemStyle={{ color: "#9ffe00" }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value: number, name: string) => [`${value.toLocaleString()} usuários`, name]}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Faixa Etária */}
        <Card className="rounded-2xl bg-[#0D1117] border-[#9ffe00]/10 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Distribuição por Faixa Etária</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#9ffe00" tickFormatter={(value) => value.toLocaleString()} />
                <YAxis type="category" dataKey="name" stroke="#9ffe00" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1A2430", border: "none", borderRadius: "8px" }}
                  itemStyle={{ color: "#9ffe00" }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value: number, name: string) => [`${value.toLocaleString()} usuários`, "Usuários"]}
                />
                <Legend />
                <Bar dataKey="users" fill="#9ffe00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
