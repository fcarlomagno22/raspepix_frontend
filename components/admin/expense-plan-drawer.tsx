"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PlusCircle, XCircle } from "lucide-react"
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
    afiliados: { type: "fixed" | "percentage"; value: number } // NEW
    trafegoPago: { type: "fixed" | "percentage"; value: number }
  }
  extraCosts: { name: string; value: number }[]
  createdAt: string
}

interface ExpensePlanDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: ExpensePlan) => void
  initialData?: ExpensePlan
}

export default function ExpensePlanDrawer({ isOpen, onClose, onSave, initialData }: ExpensePlanDrawerProps) {
  const [name, setName] = useState("")
  const [sellingPrice, setSellingPrice] = useState(0)
  const [numberOfTicketsSold, setNumberOfTicketsSold] = useState(0)
  const [operationalCosts, setOperationalCosts] = useState({
    capitalizadora: { type: "percentage", value: 0 },
    pix: { type: "fixed", value: 0 },
    doacaoFilantropica: { type: "fixed", value: 0 },
    influencer: { type: "fixed", value: 0 },
    afiliados: { type: "fixed", value: 0 }, // NEW
    trafegoPago: { type: "fixed", value: 0 },
  })
  const [extraCosts, setExtraCosts] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setSellingPrice(initialData.sellingPrice)
      setNumberOfTicketsSold(initialData.numberOfTicketsSold)
      setOperationalCosts(initialData.operationalCosts)
      setExtraCosts(initialData.extraCosts)
    } else {
      // Reset form for new plan
      setName("")
      setSellingPrice(0)
      setNumberOfTicketsSold(0)
      setOperationalCosts({
        capitalizadora: { type: "percentage", value: 0 },
        pix: { type: "fixed", value: 0 },
        doacaoFilantropica: { type: "fixed", value: 0 },
        influencer: { type: "fixed", value: 0 },
        afiliados: { type: "fixed", value: 0 }, // NEW
        trafegoPago: { type: "fixed", value: 0 },
      })
      setExtraCosts([])
    }
  }, [initialData, isOpen])

  const handleOperationalCostChange = useCallback(
    (key: keyof typeof operationalCosts, field: "type" | "value", val: string | number) => {
      setOperationalCosts((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [field]: field === "value" ? Number.parseFloat(val as string) || 0 : val,
        },
      }))
    },
    [],
  )

  const handleAddExtraCost = useCallback(() => {
    setExtraCosts((prev) => [...prev, { name: "", value: 0 }])
  }, [])

  const handleRemoveExtraCost = useCallback((index: number) => {
    setExtraCosts((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleExtraCostChange = useCallback((index: number, field: "name" | "value", val: string) => {
    setExtraCosts((prev) =>
      prev.map((cost, i) =>
        i === index ? { ...cost, [field]: field === "value" ? Number.parseFloat(val) || 0 : val } : cost,
      ),
    )
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const newPlan: ExpensePlan = {
        id: initialData?.id || Date.now().toString(), // Simple ID generation
        name,
        sellingPrice,
        numberOfTicketsSold,
        operationalCosts,
        extraCosts,
        createdAt: initialData?.createdAt || new Date().toISOString().split("T")[0],
      }
      onSave(newPlan)
      onClose()
    },
    [name, sellingPrice, numberOfTicketsSold, operationalCosts, extraCosts, onSave, onClose, initialData],
  )

  // Financial Calculations
  const {
    faturamentoEstimado,
    irpj,
    adicionalIrpj,
    csll,
    pis,
    cofins,
    iss,
    totalImpostos,
    totalOperationalCosts,
    totalDespesas,
    lucroLiquido,
    margemLucro,
  } = useMemo(() => {
    const estimatedRevenue = sellingPrice * numberOfTicketsSold

    // Operational Costs Calculation
    const calculateOperationalCost = (costType: { type: "fixed" | "percentage"; value: number }, base: number) => {
      return costType.type === "percentage" ? base * (costType.value / 100) : costType.value
    }

    const opCapitalizadora = calculateOperationalCost(operationalCosts.capitalizadora, estimatedRevenue)
    const opPix = calculateOperationalCost(operationalCosts.pix, estimatedRevenue)
    const opDoacaoFilantropica = calculateOperationalCost(operationalCosts.doacaoFilantropica, estimatedRevenue)
    const opInfluencer = calculateOperationalCost(operationalCosts.influencer, estimatedRevenue)
    const opAfiliados = calculateOperationalCost(operationalCosts.afiliados, estimatedRevenue) // NEW
    const opTrafegoPago = calculateOperationalCost(operationalCosts.trafegoPago, estimatedRevenue)

    const totalOperational =
      opCapitalizadora +
      opPix +
      opDoacaoFilantropica +
      opInfluencer +
      opAfiliados + // NEW
      opTrafegoPago

    // Tax Calculations (Presumed Profit)
    const baseCalculoIRPJCSLL = estimatedRevenue * 0.32 // 32% of revenue
    const irpjCalc = baseCalculoIRPJCSLL * 0.15 // 15%
    const adicionalIrpjCalc = baseCalculoIRPJCSLL > 20000 ? (baseCalculoIRPJCSLL - 20000) * 0.1 : 0 // 10% over R$20.000
    const csllCalc = baseCalculoIRPJCSLL * 0.09 // 9%
    const pisCalc = estimatedRevenue * 0.0065 // 0.65%
    const cofinsCalc = estimatedRevenue * 0.03 // 3%
    const issCalc = estimatedRevenue * 0.05 // 5%

    const totalTaxes = irpjCalc + adicionalIrpjCalc + csllCalc + pisCalc + cofinsCalc + issCalc

    const totalExtraCosts = extraCosts.reduce((sum, cost) => sum + cost.value, 0)

    const totalExpenses = totalOperational + totalTaxes + totalExtraCosts
    const netProfit = estimatedRevenue - totalExpenses
    const profitMargin = estimatedRevenue > 0 ? (netProfit / estimatedRevenue) * 100 : 0

    return {
      faturamentoEstimado: estimatedRevenue,
      irpj: irpjCalc,
      adicionalIrpj: adicionalIrpjCalc,
      csll: csllCalc,
      pis: pisCalc,
      cofins: cofinsCalc,
      iss: issCalc,
      totalImpostos: totalTaxes,
      totalOperationalCosts: totalOperational,
      totalDespesas: totalExpenses,
      lucroLiquido: netProfit,
      margemLucro: profitMargin,
    }
  }, [sellingPrice, numberOfTicketsSold, operationalCosts, extraCosts])

  const formatCurrencyInput = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const parseCurrencyInput = (value: string) => {
    const cleaned = value.replace(/\./g, "").replace(",", ".")
    return Number.parseFloat(cleaned) || 0
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:w-[600px] bg-[#191F26] text-white border-[#366D51] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">
            {initialData ? "Editar Plano de Despesas" : "Criar Novo Plano de Despesas"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Preencha os detalhes para simular e gerenciar seu plano financeiro.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-white">
              Nome do Plano
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#232A34] border-[#366D51] text-white"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sellingPrice" className="text-white">
              Preço de Venda (por título)
            </Label>
            <Input
              id="sellingPrice"
              type="text"
              inputMode="numeric"
              value={formatCurrencyInput(sellingPrice)}
              onChange={(e) => setSellingPrice(parseCurrencyInput(e.target.value))}
              className="bg-[#232A34] border-[#366D51] text-white"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="numberOfTicketsSold" className="text-white">
              Vendas (Número de Títulos Vendidos)
            </Label>
            <Input
              id="numberOfTicketsSold"
              type="number"
              value={numberOfTicketsSold}
              onChange={(e) => setNumberOfTicketsSold(Number.parseInt(e.target.value) || 0)}
              className="bg-[#232A34] border-[#366D51] text-white"
              required
            />
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-white">Custos Operacionais</h3>

            {Object.entries(operationalCosts).map(([key, cost]) => (
              <div key={key} className="grid gap-2">
                <Label htmlFor={key} className="capitalize text-white">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </Label>
                <RadioGroup
                  value={cost.type}
                  onValueChange={(val: "fixed" | "percentage") =>
                    handleOperationalCostChange(key as keyof typeof operationalCosts, "type", val)
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id={`${key}-fixed`} className="text-[#9FFF00]" />
                    <Label htmlFor={`${key}-fixed`} className="text-gray-300">
                      Valor Fixo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="percentage"
                      id={`${key}-percentage`}
                      className="text-[#9FFF00]"
                      disabled={key === "capitalizadora"} // Capitalizadora is always percentage
                    />
                    <Label htmlFor={`${key}-percentage`} className="text-gray-300">
                      Percentual
                    </Label>
                  </div>
                </RadioGroup>
                <Input
                  id={key}
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyInput(cost.value)}
                  onChange={(e) =>
                    handleOperationalCostChange(
                      key as keyof typeof operationalCosts,
                      "value",
                      parseCurrencyInput(e.target.value),
                    )
                  }
                  className="bg-[#232A34] border-[#366D51] text-white"
                  placeholder={cost.type === "percentage" ? "Ex: 10 (para 10%)" : "Ex: 1000,00"}
                />
              </div>
            ))}
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-white">Impostos (Estimativa)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-gray-300">Faturamento Estimado</Label>
                <Input
                  value={formatCurrency(faturamentoEstimado)}
                  readOnly
                  className="bg-[#232A34] border-[#366D51] text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">IRPJ (15%)</Label>
                <Input value={formatCurrency(irpj)} readOnly className="bg-[#232A34] border-[#366D51] text-white" />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">Adicional IRPJ (10%)</Label>
                <Input
                  value={formatCurrency(adicionalIrpj)}
                  readOnly
                  className="bg-[#232A34] border-[#366D51] text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">CSLL (9%)</Label>
                <Input value={formatCurrency(csll)} readOnly className="bg-[#232A34] border-[#366D51] text-white" />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">PIS (0,65%)</Label>
                <Input value={formatCurrency(pis)} readOnly className="bg-[#232A34] border-[#366D51] text-white" />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">COFINS (3%)</Label>
                <Input value={formatCurrency(cofins)} readOnly className="bg-[#232A34] border-[#366D51] text-white" />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">ISS (5%)</Label>
                <Input value={formatCurrency(iss)} readOnly className="bg-[#232A34] border-[#366D51] text-white" />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">Total de Impostos</Label>
                <Input
                  value={formatCurrency(totalImpostos)}
                  readOnly
                  className="bg-[#232A34] border-[#366D51] text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-white">Custos Extras</h3>
            {extraCosts.map((cost, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor={`extra-cost-name-${index}`} className="sr-only">
                    Nome do Custo
                  </Label>
                  <Input
                    id={`extra-cost-name-${index}`}
                    value={cost.name}
                    onChange={(e) => handleExtraCostChange(index, "name", e.target.value)}
                    className="bg-[#232A34] border-[#366D51] text-white"
                    placeholder="Nome do Custo"
                  />
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor={`extra-cost-value-${index}`} className="sr-only">
                    Valor (R$)
                  </Label>
                  <Input
                    id={`extra-cost-value-${index}`}
                    type="text"
                    inputMode="numeric"
                    value={formatCurrencyInput(cost.value)}
                    onChange={(e) => handleExtraCostChange(index, "value", e.target.value)}
                    className="bg-[#232A34] border-[#366D51] text-white"
                    placeholder="Valor (R$)"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveExtraCost(index)}
                  className="text-gray-400 hover:text-red-500 hover:bg-transparent"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" onClick={handleAddExtraCost} className="bg-[#9FFF00] text-black hover:bg-[#7acc00]">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Custo Extra
            </Button>
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-white">Simulação Financeira</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-gray-300">Faturamento Bruto</Label>
                <Input
                  value={formatCurrency(faturamentoEstimado)}
                  readOnly
                  className="bg-[#232A34] border-[#366D51] text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">Total de Despesas</Label>
                <Input
                  value={formatCurrency(totalDespesas)}
                  readOnly
                  className="bg-[#232A34] border-[#366D51] text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">Lucro Líquido</Label>
                <Input
                  value={formatCurrency(lucroLiquido)}
                  readOnly
                  className={`bg-[#232A34] border-[#366D51] ${lucroLiquido >= 0 ? "text-[#9FFF00]" : "text-[#ef4444]"} font-bold`}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">Margem de Lucro (%)</Label>
                <Input
                  value={`${margemLucro.toFixed(2)}%`}
                  readOnly
                  className={`bg-[#232A34] border-[#366D51] ${margemLucro >= 0 ? "text-[#9FFF00]" : "text-[#ef4444]"} font-bold`}
                />
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button type="submit" className="bg-[#9FFF00] hover:bg-[#7acc00] text-black w-full">
              Salvar Plano
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
