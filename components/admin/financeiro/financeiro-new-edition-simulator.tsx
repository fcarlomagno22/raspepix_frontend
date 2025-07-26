"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PlusCircle, XCircle } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface CostItem {
  name: string
  type: "fixed" | "percentage"
  value: number // Stored in cents for fixed, raw percentage for percentage
}

// Helper function for BRL mask
const applyBRLMask = (rawValue: string) => {
  // Remove tudo que não for número
  const numeros = rawValue.replace(/\D/g, "")

  // Impede que valores vazios travem o campo
  if (numeros.length === 0) {
    return { formatted: "R$ 0,00", numeric: 0 }
  }

  // Converte para número em centavos
  const valorCentavos = Number.parseInt(numeros, 10)

  // Formata para BRL (divide por 100 para reais)
  const formatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorCentavos / 100)

  return { formatted: formatado, numeric: valorCentavos }
}

export default function FinanceiroNewEditionSimulator() {
  const [editionName, setEditionName] = useState("")
  const [mainPrizeValue, setMainPrizeValue] = useState(0) // Stored in cents
  const [instantPrizesTotalValue, setInstantPrizesTotalValue] = useState(0) // NEW: Stored in cents
  const [instantPrizesQty, setInstantPrizesQty] = useState(0) // This input remains for quantity, but value is now from instantPrizesTotalValue
  const [estimatedSales, setEstimatedSales] = useState(0)
  const [pricePerTicket, setPricePerTicket] = useState(0) // Stored in cents

  const [capitalizadora, setCapitalizadora] = useState<CostItem>({ type: "percentage", value: 0 })
  const [influencers, setInfluencers] = useState<CostItem>({ type: "fixed", value: 0 }) // Value in cents when fixed
  const [afiliados, setAfiliados] = useState<CostItem>({ type: "percentage", value: 0 })
  const [donations, setDonations] = useState<CostItem>({ type: "percentage", value: 0 })
  const [paidTraffic, setPaidTraffic] = useState<CostItem>({ type: "fixed", value: 0 }) // Value in cents when fixed
  const [pixFees, setPixFees] = useState<CostItem>({ type: "percentage", value: 0 })
  const [extraCosts, setExtraCosts] = useState<{ name: string; value: number }[]>([]) // Value in cents

  const handleAddExtraCost = () => {
    setExtraCosts((prev) => [...prev, { name: "", value: 0 }]) // Initial value 0 cents
  }

  const handleRemoveExtraCost = (index: number) => {
    setExtraCosts((prev) => prev.filter((_, i) => i !== index))
  }

  const handleExtraCostChange = (index: number, field: "name" | "value", val: string) => {
    setExtraCosts((prev) =>
      prev.map((cost, i) =>
        i === index
          ? {
              ...cost,
              [field]: field === "value" ? applyBRLMask(val).numeric : val, // Store numeric cents
            }
          : cost,
      ),
    )
  }

  const simulationResult = useMemo(() => {
    // Convert all relevant input values from cents to Reais for calculations
    const mainPrizeValueReais = mainPrizeValue / 100
    const instantPrizesTotalValueReais = instantPrizesTotalValue / 100 // NEW: Convert to Reais
    const pricePerTicketReais = pricePerTicket / 100

    const estimatedRevenue = estimatedSales * pricePerTicketReais
    const totalPrizes = mainPrizeValueReais + instantPrizesTotalValueReais // NEW: Use the direct input value for instant prizes

    // Helper to calculate cost, converting fixed values from cents to Reais
    const calculateCostInReais = (costType: { type: "fixed" | "percentage"; value: number }, base: number) => {
      return costType.type === "percentage" ? base * (costType.value / 100) : costType.value / 100 // Divide by 100 if fixed
    }

    const opCapitalizadora = calculateCostInReais(capitalizadora, estimatedRevenue)
    const opInfluencers = calculateCostInReais(influencers, estimatedRevenue)
    const opAfiliados = calculateCostInReais(afiliados, estimatedRevenue)
    const opDonations = calculateCostInReais(donations, estimatedRevenue)
    const opPaidTraffic = calculateCostInReais(paidTraffic, estimatedRevenue)
    const opPixFees = calculateCostInReais(pixFees, estimatedRevenue)

    const totalOperationalCosts =
      opCapitalizadora + opInfluencers + opAfiliados + opDonations + opPaidTraffic + opPixFees

    const totalExtraCosts = extraCosts.reduce((sum, cost) => sum + cost.value / 100, 0) // extraCosts.value is in cents

    // Simplified Tax Calculations (Presumed Profit) - these are based on estimatedRevenue (in Reais)
    const baseCalculoIRPJCSLL = estimatedRevenue * 0.32
    const irpjCalc = baseCalculoIRPJCSLL * 0.15
    const adicionalIrpjCalc = baseCalculoIRPJCSLL > 20000 ? (baseCalculoIRPJCSLL - 20000) * 0.1 : 0
    const csllCalc = baseCalculoIRPJCSLL * 0.09
    const pisCalc = estimatedRevenue * 0.0065
    const cofinsCalc = estimatedRevenue * 0.03
    const issCalc = estimatedRevenue * 0.05
    const totalTaxes = irpjCalc + adicionalIrpjCalc + csllCalc + pisCalc + cofinsCalc + issCalc

    const totalExpenses = totalPrizes + totalOperationalCosts + totalExtraCosts + totalTaxes
    const netRevenue = estimatedRevenue - totalExpenses
    const margin = estimatedRevenue > 0 ? (netRevenue / estimatedRevenue) * 100 : 0

    return {
      estimatedRevenue,
      totalPrizes,
      totalOperationalCosts,
      totalExtraCosts,
      totalTaxes,
      totalExpenses,
      netRevenue,
      margin,
      detailedCosts: {
        opCapitalizadora,
        opInfluencers,
        opAfiliados,
        opDonations,
        opPaidTraffic,
        opPixFees,
        irpjCalc,
        adicionalIrpjCalc,
        csllCalc,
        pisCalc,
        cofinsCalc,
        issCalc,
      },
    }
  }, [
    mainPrizeValue,
    instantPrizesTotalValue, // NEW: Add to dependency array
    instantPrizesQty, // Still in dependency array, but not used for value calculation
    estimatedSales,
    pricePerTicket,
    capitalizadora,
    influencers,
    afiliados,
    donations,
    paidTraffic,
    pixFees,
    extraCosts,
  ])

  const handleSavePreview = () => {
    // Logic to save the simulation as a preview
    console.log("Simulação salva como prévia:", simulationResult)
    alert("Simulação salva como prévia da edição!")
  }

  const renderCostInput = (
    label: string,
    costState: CostItem,
    setCostState: React.Dispatch<React.SetStateAction<CostItem>>,
    isPercentageOnly = false,
  ) => (
    <div className="grid gap-2">
      <Label htmlFor={label.toLowerCase().replace(/\s/g, "-")} className="text-white">
        {label}
      </Label>
      {!isPercentageOnly && (
        <RadioGroup
          value={costState.type}
          onValueChange={(val: "fixed" | "percentage") => {
            // Reset value to 0 cents or 0 percentage when changing type
            setCostState({ ...costState, type: val, value: 0 })
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="fixed"
              id={`${label.toLowerCase().replace(/\s/g, "-")}-fixed`}
              className="text-[#9FFF00]"
            />
            <Label htmlFor={`${label.toLowerCase().replace(/\s/g, "-")}-fixed`} className="text-gray-300">
              Valor Fixo
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="percentage"
              id={`${label.toLowerCase().replace(/\s/g, "-")}-percentage`}
              className="text-[#9FFF00]"
            />
            <Label htmlFor={`${label.toLowerCase().replace(/\s/g, "-")}-percentage`} className="text-gray-300">
              Percentual
            </Label>
          </div>
        </RadioGroup>
      )}
      <Input
        id={label.toLowerCase().replace(/\s/g, "-")}
        type="text" // Always text for masking
        inputMode="numeric"
        value={
          costState.type === "percentage"
            ? costState.value.toString()
            : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(costState.value / 100)
        }
        onChange={(e) => {
          if (costState.type === "percentage") {
            setCostState({ ...costState, value: Number.parseFloat(e.target.value) || 0 })
          } else {
            const { numeric } = applyBRLMask(e.target.value)
            setCostState({ ...costState, value: numeric })
          }
        }}
        className="bg-[#232A34] border-[#366D51] text-white"
        placeholder={costState.type === "percentage" ? "Ex: 10 (para 10%)" : "Ex: R$ 1.000,00"}
      />
    </div>
  )

  return (
    <Card className="bg-[#232A34] border-[#366D51] shadow-md mb-8">
      <CardHeader>
        <CardTitle className="text-white">Simulador de Nova Edição</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Dados da Edição</h3>
          <div className="grid gap-2">
            <Label htmlFor="editionName" className="text-white">
              Nome da Edição
            </Label>
            <Input
              id="editionName"
              value={editionName}
              onChange={(e) => setEditionName(e.target.value)}
              className="bg-[#191F26] border-[#366D51] text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mainPrizeValue" className="text-white">
              Valor do Prêmio Principal (R$)
            </Label>
            <Input
              id="mainPrizeValue"
              type="text" // Changed to text for masking
              inputMode="numeric"
              value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                mainPrizeValue / 100,
              )}
              onChange={(e) => {
                const { numeric } = applyBRLMask(e.target.value)
                setMainPrizeValue(numeric)
              }}
              className="bg-[#191F26] border-[#366D51] text-white"
              placeholder="Ex: R$ 10.000,00" // Updated placeholder
            />
          </div>
          {/* NEW INPUT FIELD */}
          <div className="grid gap-2">
            <Label htmlFor="instantPrizesTotalValue" className="text-white">
              Valor em Prêmios Instantâneos (R$)
            </Label>
            <Input
              id="instantPrizesTotalValue"
              type="text"
              inputMode="numeric"
              value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                instantPrizesTotalValue / 100,
              )}
              onChange={(e) => {
                const { numeric } = applyBRLMask(e.target.value)
                setInstantPrizesTotalValue(numeric)
              }}
              className="bg-[#191F26] border-[#366D51] text-white"
              placeholder="Ex: R$ 500,00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="instantPrizesQty" className="text-white">
              Quantidade de Prêmios Instantâneos
            </Label>
            <Input
              id="instantPrizesQty"
              type="number"
              value={instantPrizesQty}
              onChange={(e) => setInstantPrizesQty(Number.parseInt(e.target.value) || 0)}
              className="bg-[#191F26] border-[#366D51] text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estimatedSales" className="text-white">
              Estimativa de Vendas (Números de Sorte)
            </Label>
            <Input
              id="estimatedSales"
              type="number"
              value={estimatedSales}
              onChange={(e) => setEstimatedSales(Number.parseInt(e.target.value) || 0)}
              className="bg-[#191F26] border-[#366D51] text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pricePerTicket" className="text-white">
              Preço por Número de Sorte (R$)
            </Label>
            <Input
              id="pricePerTicket"
              type="text" // Changed to text for masking
              inputMode="numeric"
              value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                pricePerTicket / 100,
              )}
              onChange={(e) => {
                const { numeric } = applyBRLMask(e.target.value)
                setPricePerTicket(numeric)
              }}
              className="bg-[#191F26] border-[#366D51] text-white"
              placeholder="Ex: R$ 5,00" // Updated placeholder
            />
          </div>

          <h3 className="text-lg font-semibold text-white mt-6">Percentuais e Custos</h3>
          {renderCostInput("Capitalizadora (%)", capitalizadora, setCapitalizadora, true)}
          {renderCostInput("Influenciadores", influencers, setInfluencers)}
          {renderCostInput("Afiliados (%)", afiliados, setAfiliados)}
          {renderCostInput("Doações (%)", donations, setDonations)}
          {renderCostInput("Tráfego Pago", paidTraffic, setPaidTraffic)}
          {renderCostInput("Taxas PIX (%)", pixFees, setPixFees)}

          <h3 className="text-lg font-semibold text-white mt-6">Custos Extras</h3>
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
                  className="bg-[#191F26] border-[#366D51] text-white"
                  placeholder="Nome do Custo"
                />
              </div>
              <div className="grid gap-2 flex-1">
                <Label htmlFor={`extra-cost-value-${index}`} className="sr-only">
                  Valor (R$)
                </Label>
                <Input
                  id={`extra-cost-value-${index}`}
                  type="text" // Changed to text for masking
                  inputMode="numeric"
                  value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    cost.value / 100,
                  )}
                  onChange={(e) => handleExtraCostChange(index, "value", e.target.value)}
                  className="bg-[#191F26] border-[#366D51] text-white"
                  placeholder="Ex: R$ 500,00" // Updated placeholder
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

        {/* Simulation Output */}
        <div className="space-y-4 bg-[#191F26] p-6 rounded-lg border border-[#366D51]">
          <h3 className="text-lg font-semibold text-white">Resultado da Simulação</h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Label className="text-gray-300">Faturamento Estimado:</Label>
              <span className="text-white font-bold text-right">
                {formatCurrency(simulationResult.estimatedRevenue)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Label className="text-gray-300">Total de Prêmios:</Label>
              <span className="text-white text-right">{formatCurrency(simulationResult.totalPrizes)}</span>
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-300">Custos Operacionais Detalhados:</Label>
              <ul className="list-disc list-inside text-gray-400 ml-4">
                <li>Capitalizadora: {formatCurrency(simulationResult.detailedCosts.opCapitalizadora)}</li>
                <li>Influenciadores: {formatCurrency(simulationResult.detailedCosts.opInfluencers)}</li>
                <li>Afiliados: {formatCurrency(simulationResult.detailedCosts.opAfiliados)}</li>
                <li>Doações: {formatCurrency(simulationResult.detailedCosts.opDonations)}</li>
                <li>Tráfego Pago: {formatCurrency(simulationResult.detailedCosts.opPaidTraffic)}</li>
                <li>Taxas PIX: {formatCurrency(simulationResult.detailedCosts.opPixFees)}</li>
              </ul>
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-300">Impostos Detalhados:</Label>
              <ul className="list-disc list-inside text-gray-400 ml-4">
                <li>IRPJ: {formatCurrency(simulationResult.detailedCosts.irpjCalc)}</li>
                <li>Adicional IRPJ: {formatCurrency(simulationResult.detailedCosts.adicionalIrpjCalc)}</li>
                <li>CSLL: {formatCurrency(simulationResult.detailedCosts.csllCalc)}</li>
                <li>PIS: {formatCurrency(simulationResult.detailedCosts.pisCalc)}</li>
                <li>COFINS: {formatCurrency(simulationResult.detailedCosts.cofinsCalc)}</li>
                <li>ISS: {formatCurrency(simulationResult.detailedCosts.issCalc)}</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Label className="text-gray-300">Total de Custos Extras:</Label>
              <span className="text-white text-right">{formatCurrency(simulationResult.totalExtraCosts)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Label className="text-gray-300">Total de Despesas:</Label>
              <span className="text-white font-bold text-right">{formatCurrency(simulationResult.totalExpenses)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Label className="text-gray-300">Receita Líquida:</Label>
              <span
                className={`font-bold text-right ${simulationResult.netRevenue >= 0 ? "text-[#9FFF00]" : "text-red-500"}`}
              >
                {formatCurrency(simulationResult.netRevenue)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Label className="text-gray-300">Margem de Lucro:</Label>
              <span
                className={`font-bold text-right ${simulationResult.margin >= 0 ? "text-[#9FFF00]" : "text-red-500"}`}
              >
                {formatPercentage(simulationResult.margin)}
              </span>
            </div>
          </div>
          <Button onClick={handleSavePreview} className="bg-[#9FFF00] text-black hover:bg-[#7acc00] w-full mt-4">
            Salvar como prévia da edição
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
