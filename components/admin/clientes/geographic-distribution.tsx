"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock Data para distribuição por estado e cidades associadas
const stateData = [
  { uf: "SP", name: "São Paulo", users: 15000, percentage: 25 },
  { uf: "RJ", name: "Rio de Janeiro", users: 8000, percentage: 13 },
  { uf: "MG", name: "Minas Gerais", users: 7000, percentage: 11 },
  { uf: "BA", name: "Bahia", users: 5000, percentage: 8 },
  { uf: "RS", name: "Rio Grande do Sul", users: 4000, percentage: 7 },
  { uf: "PR", name: "Paraná", users: 3500, percentage: 6 },
  { uf: "SC", name: "Santa Catarina", users: 2500, percentage: 4 },
  { uf: "DF", name: "Distrito Federal", users: 2000, percentage: 3 },
  { uf: "PE", name: "Pernambuco", users: 1800, percentage: 3 },
  { uf: "CE", name: "Ceará", users: 1500, percentage: 2.5 },
]

interface GeographicDistributionProps {
  onSelectState: (uf: string | null) => void
  selectedStateUF: string | null
}

export default function GeographicDistribution({ onSelectState, selectedStateUF }: GeographicDistributionProps) {
  // Ordenar estados por número de usuários para o Top 5
  const sortedStates = [...stateData].sort((a, b) => b.users - a.users)
  const top5States = sortedStates.slice(0, 5)

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Distribuição por Estado</h2>
      <Card className="rounded-2xl bg-[#0D1117] border-[#9ffe00]/10 text-white shadow-lg p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Top 5 Estados e Seleção</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Top 5 Estados */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-[#9ffe00]">Top 5 Estados por Usuários</h3>
            <ul className="space-y-2">
              {top5States.map((state) => (
                <li key={state.uf} className="flex justify-between items-center text-gray-300">
                  <span>
                    {state.name} ({state.uf})
                  </span>
                  <span className="font-semibold">{state.users.toLocaleString()} usuários</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dropdown de Seleção de Estado */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-[#9ffe00]">Selecionar Estado para Detalhes</h3>
            <Select onValueChange={onSelectState} value={selectedStateUF || "default"}>
              <SelectTrigger className="w-full bg-[#1A2430] border-[#9FFF00]/20 text-white h-12">
                <SelectValue placeholder="Selecione um Estado" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2430] text-white border-[#9FFF00]/20">
                <SelectItem value="default">Todos os Estados</SelectItem> {/* Opção para limpar a seleção */}
                {sortedStates.map((state) => (
                  <SelectItem key={state.uf} value={state.uf}>
                    {state.name} ({state.uf})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
