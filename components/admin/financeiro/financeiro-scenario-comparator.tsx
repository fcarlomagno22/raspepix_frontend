"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2 } from "lucide-react"
import { formatPercentage } from "@/lib/utils"

interface Scenario {
  id: string
  name: string
  faturamento: number // Stored in cents
  premios: number // Stored in cents
  custos: number // Stored in cents
  margemLiquida: number
  lucroOperacao: number // NEW: Stored in cents
}

// Helper function to format a number (in cents) to BRL string
const formatBRL = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

// Helper function to parse a BRL string to a number (in cents)
const parseBRL = (value: string): number => {
  const numeric = value.replace(/\D/g, "") // Remove non-digits
  return Number.parseInt(numeric, 10) || 0
}

export default function FinanceiroScenarioComparator() {
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    const initialScenarios = [
      {
        id: "1",
        name: "Cenário Otimista",
        faturamento: 100000000, // R$ 1.000.000,00 in cents
        premios: 30000000, // R$ 300.000,00 in cents
        custos: 40000000, // R$ 400.000,00 in cents
        margemLiquida: 0,
        lucroOperacao: 0,
      },
      {
        id: "2",
        name: "Cenário Conservador",
        faturamento: 70000000,
        premios: 25000000,
        custos: 30000000,
        margemLiquida: 0,
        lucroOperacao: 0,
      },
      {
        id: "3",
        name: "Cenário Pessimista",
        faturamento: 40000000,
        premios: 20000000,
        custos: 15000000,
        margemLiquida: 0,
        lucroOperacao: 0,
      },
    ]

    return initialScenarios.map((s) => {
      const netRevenueCents = s.faturamento - s.premios - s.custos
      const margin = s.faturamento > 0 ? (netRevenueCents / s.faturamento) * 100 : 0
      return {
        ...s,
        lucroOperacao: netRevenueCents,
        margemLiquida: margin,
      }
    })
  })

  const handleAddScenario = () => {
    if (scenarios.length < 3) {
      setScenarios((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: `Novo Cenário ${prev.length + 1}`,
          faturamento: 0,
          premios: 0,
          custos: 0,
          margemLiquida: 0,
          lucroOperacao: 0,
        },
      ])
    } else {
      alert("Você pode comparar no máximo 3 cenários.")
    }
  }

  const handleRemoveScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id))
  }

  const handleScenarioChange = (id: string, field: keyof Scenario, value: string | number) => {
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updatedScenario = { ...s }
          if (field === "name") {
            updatedScenario.name = value as string
          } else if (field === "faturamento" || field === "premios" || field === "custos") {
            const centsValue = parseBRL(value as string)
            updatedScenario[field] = centsValue
          } else {
            // Should not happen for these fields
            updatedScenario[field] = value as number
          }

          // Recalculate net margin and profit if a monetary field changed
          if (field === "faturamento" || field === "premios" || field === "custos") {
            const netRevenueCents = updatedScenario.faturamento - updatedScenario.premios - updatedScenario.custos
            updatedScenario.lucroOperacao = netRevenueCents // Update profit in cents
            updatedScenario.margemLiquida =
              updatedScenario.faturamento > 0 ? (netRevenueCents / updatedScenario.faturamento) * 100 : 0
          }
          return updatedScenario
        }
        return s
      }),
    )
  }

  return (
    <Card className="bg-[#232A34] border-[#366D51] shadow-md mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Comparador de Cenários</CardTitle>
        {scenarios.length < 3 && (
          <Button onClick={handleAddScenario} className="bg-[#366D51] hover:bg-[#2e5a43] text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cenário
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="bg-[#191F26] border-[#366D51] p-4 relative">
              <div className="flex justify-between items-center mb-4">
                <Input
                  value={scenario.name}
                  onChange={(e) => handleScenarioChange(scenario.id, "name", e.target.value)}
                  className="bg-transparent border-b border-[#366D51] text-white text-lg font-semibold focus:outline-none focus:border-[#9FFF00]"
                />
                {scenarios.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveScenario(scenario.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 items-center">
                  <Label className="text-gray-300">Faturamento:</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatBRL(scenario.faturamento)}
                    onChange={(e) => handleScenarioChange(scenario.id, "faturamento", e.target.value)}
                    className="bg-transparent border-b border-[#366D51] text-white text-right focus:outline-none focus:border-[#9FFF00]"
                  />
                </div>
                <div className="grid grid-cols-2 items-center">
                  <Label className="text-gray-300">Prêmios:</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatBRL(scenario.premios)}
                    onChange={(e) => handleScenarioChange(scenario.id, "premios", e.target.value)}
                    className="bg-transparent border-b border-[#366D51] text-white text-right focus:outline-none focus:border-[#9FFF00]"
                  />
                </div>
                <div className="grid grid-cols-2 items-center">
                  <Label className="text-gray-300">Custos:</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatBRL(scenario.custos)}
                    onChange={(e) => handleScenarioChange(scenario.id, "custos", e.target.value)}
                    className="bg-transparent border-b border-[#366D51] text-white text-right focus:outline-none focus:border-[#9FFF00]"
                  />
                </div>
                {/* NEW: Lucro da Operação */}
                <div className="grid grid-cols-2 items-center pt-2 border-t border-[#366D51] mt-2">
                  <Label className="text-gray-300 font-bold">Lucro da Operação:</Label>
                  <span
                    className={`font-bold text-right ${
                      scenario.lucroOperacao >= 0 ? "text-[#9FFF00]" : "text-red-500"
                    }`}
                  >
                    {formatBRL(scenario.lucroOperacao)}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <Label className="text-gray-300 font-bold">Margem Líquida:</Label>
                  <span
                    className={`font-bold text-right ${
                      scenario.margemLiquida >= 0 ? "text-[#9FFF00]" : "text-red-500"
                    }`}
                  >
                    {formatPercentage(scenario.margemLiquida)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
