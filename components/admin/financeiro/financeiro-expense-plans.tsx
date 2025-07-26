"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import ExpensePlanDrawer from "@/components/admin/expense-plan-drawer"
import { formatCurrency } from "@/lib/utils"

interface ExpensePlan {
  id: string
  name: string
  sellingPrice: number
  numberOfTicketsSold: number
  operationalCosts: {
    capitalizadora: { type: "percentage"; value: number }
    pix: { type: "fixed" | "percentage"; value: number }
    doacaoFilantropica: { type: "fixed" | "percentage"; value: number }
    influencer: { type: "fixed" | "percentage"; value: number }
    afiliados: { type: "fixed" | "percentage"; value: number }
    trafegoPago: { type: "fixed" | "percentage"; value: number }
  }
  extraCosts: { name: string; value: number }[]
  createdAt: string
}

export default function FinanceiroExpensePlans() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ExpensePlan | undefined>(undefined)
  const [expensePlans, setExpensePlans] = useState<ExpensePlan[]>([
    {
      id: "1",
      name: "Plano Padrão Edição #5",
      sellingPrice: 10.0,
      numberOfTicketsSold: 100000,
      operationalCosts: {
        capitalizadora: { type: "percentage", value: 10 },
        pix: { type: "percentage", value: 1.5 },
        doacaoFilantropica: { type: "percentage", value: 5 },
        influencer: { type: "fixed", value: 50000 },
        afiliados: { type: "percentage", value: 2 },
        trafegoPago: { type: "fixed", value: 100000 },
      },
      extraCosts: [{ name: "Marketing Digital", value: 20000 }],
      createdAt: "2024-01-20",
    },
    {
      id: "2",
      name: "Plano Promocional Edição #6",
      sellingPrice: 5.0,
      numberOfTicketsSold: 200000,
      operationalCosts: {
        capitalizadora: { type: "percentage", value: 12 },
        pix: { type: "fixed", value: 0.5 },
        doacaoFilantropica: { type: "percentage", value: 3 },
        influencer: { type: "fixed", value: 75000 },
        afiliados: { type: "percentage", value: 3 },
        trafegoPago: { type: "fixed", value: 120000 },
      },
      extraCosts: [{ name: "Eventos", value: 15000 }],
      createdAt: "2024-02-15",
    },
  ])

  const handleCreateNewPlan = () => {
    setEditingPlan(undefined)
    setIsDrawerOpen(true)
  }

  const handleEditPlan = (plan: ExpensePlan) => {
    setEditingPlan(plan)
    setIsDrawerOpen(true)
  }

  const handleDeletePlan = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este plano de despesas?")) {
      setExpensePlans((prev) => prev.filter((plan) => plan.id !== id))
    }
  }

  const handleSavePlan = (plan: ExpensePlan) => {
    if (plan.id) {
      setExpensePlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)))
    } else {
      setExpensePlans((prev) => [...prev, { ...plan, id: Date.now().toString() }])
    }
  }

  const calculateSummary = (plan: ExpensePlan) => {
    const faturamentoEstimado = plan.sellingPrice * plan.numberOfTicketsSold

    const calculateOperationalCost = (costType: { type: "fixed" | "percentage"; value: number }, base: number) => {
      return costType.type === "percentage" ? base * (costType.value / 100) : costType.value
    }

    const totalOperational =
      calculateOperationalCost(plan.operationalCosts.capitalizadora, faturamentoEstimado) +
      calculateOperationalCost(plan.operationalCosts.pix, faturamentoEstimado) +
      calculateOperationalCost(plan.operationalCosts.doacaoFilantropica, faturamentoEstimado) +
      calculateOperationalCost(plan.operationalCosts.influencer, faturamentoEstimado) +
      calculateOperationalCost(plan.operationalCosts.afiliados, faturamentoEstimado) +
      calculateOperationalCost(plan.operationalCosts.trafegoPago, faturamentoEstimado)

    const totalExtraCosts = plan.extraCosts.reduce((sum, cost) => sum + cost.value, 0)

    // Simplified tax calculation for summary display
    const baseCalculoIRPJCSLL = faturamentoEstimado * 0.32
    const irpjCalc = baseCalculoIRPJCSLL * 0.15
    const adicionalIrpjCalc = baseCalculoIRPJCSLL > 20000 ? (baseCalculoIRPJCSLL - 20000) * 0.1 : 0
    const csllCalc = baseCalculoIRPJCSLL * 0.09
    const pisCalc = faturamentoEstimado * 0.0065
    const cofinsCalc = faturamentoEstimado * 0.03
    const issCalc = faturamentoEstimado * 0.05
    const totalTaxes = irpjCalc + adicionalIrpjCalc + csllCalc + pisCalc + cofinsCalc + issCalc

    const totalExpenses = totalOperational + totalTaxes + totalExtraCosts
    const lucroLiquido = faturamentoEstimado - totalExpenses
    const margemLucro = faturamentoEstimado > 0 ? (lucroLiquido / faturamentoEstimado) * 100 : 0

    return {
      sellingPrice: plan.sellingPrice,
      costPerTicket: totalExpenses / plan.numberOfTicketsSold, // Simplified cost per ticket
      profitPerTicket: lucroLiquido / plan.numberOfTicketsSold, // Simplified profit per ticket
      lucroLiquido: lucroLiquido,
      margemLucro: margemLucro,
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreateNewPlan} className="bg-[#366D51] hover:bg-[#2e5a43] text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Plano
        </Button>
      </div>

      <div className="rounded-lg border border-[#366D51] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#232A34]">
            <TableRow className="border-[#366D51]">
              <TableHead className="text-white">Nome do Plano</TableHead>
              <TableHead className="text-white text-center">Resumo dos Custos</TableHead>
              <TableHead className="text-white">Data de Criação</TableHead>
              <TableHead className="text-white text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#191F26]">
            {expensePlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                  Nenhum plano de despesas encontrado.
                </TableCell>
              </TableRow>
            ) : (
              expensePlans.map((plan) => {
                const summary = calculateSummary(plan)
                return (
                  <TableRow key={plan.id} className="border-[#366D51] hover:bg-[#232A34]">
                    <TableCell className="font-medium text-white">{plan.name}</TableCell>
                    <TableCell className="text-gray-300 text-center">
                      <p>Preço de Venda: {formatCurrency(summary.sellingPrice)}</p>
                      <p>Custo por Título: {formatCurrency(summary.costPerTicket)}</p>
                      <p>Margem por Título: {formatCurrency(summary.profitPerTicket)}</p>
                      <p className={`${summary.lucroLiquido >= 0 ? "text-[#9FFF00]" : "text-red-500"}`}>
                        Lucro Líquido: {formatCurrency(summary.lucroLiquido)} ({summary.margemLucro.toFixed(2)}%)
                      </p>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(plan.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditPlan(plan)}
                        className="text-gray-400 hover:text-[#9FFF00] hover:bg-transparent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ExpensePlanDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSavePlan}
        initialData={editingPlan}
      />
    </div>
  )
}
