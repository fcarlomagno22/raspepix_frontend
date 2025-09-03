"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useCarteiraPremios } from "@/hooks/use-carteira-premios"
import Image from "next/image"

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  currentSaldoParaJogar: number
  onTransferSuccess: (amountBRL: number, quantity: number) => void
}

// Custo de um título
const TITULO_COST = 0.59

// Dados dos pacotes de títulos (agora com desconto percentual)
const packages = [
  { id: 1, titles: 10, price: 10 * TITULO_COST, discount_percent: 0.05 }, // 5% de desconto
  { id: 2, titles: 25, price: 25 * TITULO_COST, discount_percent: 0.1 }, // 10% de desconto
  { id: 3, titles: 50, price: 50 * TITULO_COST, discount_percent: 0.15 }, // 15% de desconto
  { id: 4, titles: 100, price: 100 * TITULO_COST, discount_percent: 0.2 }, // 20% de desconto
]

// Helper para formatar valores como moeda BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function TransferModal({
  isOpen,
  onClose,
  currentSaldoParaJogar,
  onTransferSuccess,
}: TransferModalProps) {
  const { saldo: currentSaldoSacavel, isLoading: isLoadingSaldo } = useCarteiraPremios()
  const [currentStep, setCurrentStep] = useState<"selectAmount" | "confirmation">("selectAmount")
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [customQuantity, setCustomQuantity] = useState<number | null>(null)
  const [customQuantityDisplay, setCustomQuantityDisplay] = useState<string>("")
  const [calculatedDetails, setCalculatedDetails] = useState<{
    investedValue: number
    quantity: number
    basePrice: number
    discountAmount: number
    finalPrice: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep("selectAmount")
      setSelectedPackageId(null)
      setCustomQuantity(null)
      setCustomQuantityDisplay("")
      setCalculatedDetails(null)
      setError(null)
    }
  }, [isOpen])

  const calculatePriceAndBonus = (quantity: number, discountPercent: number) => {
    const basePrice = quantity * TITULO_COST
    const discountAmount = basePrice * discountPercent
    const finalPrice = basePrice - discountAmount
    return { basePrice, discountAmount, finalPrice }
  }

  const handlePackageSelect = (pkg: (typeof packages)[0]) => {
    setSelectedPackageId(pkg.id)
    setCustomQuantity(pkg.titles)
    setCustomQuantityDisplay(pkg.titles.toString())
    const { basePrice, discountAmount, finalPrice } = calculatePriceAndBonus(pkg.titles, pkg.discount_percent)
    setCalculatedDetails({
      investedValue: finalPrice,
      quantity: pkg.titles,
      basePrice,
      discountAmount,
      finalPrice,
    })
  }

  const handleCustomQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")

    if (value === "") {
      setCustomQuantity(null)
      setCustomQuantityDisplay("")
      setCalculatedDetails(null)
      setSelectedPackageId(null)
      return
    }

    const quantity = Number.parseInt(value, 10)
    setCustomQuantity(quantity)
    setCustomQuantityDisplay(value)

    let discountPercent = 0
    if (quantity >= 100) discountPercent = 0.2
    else if (quantity >= 50) discountPercent = 0.15
    else if (quantity >= 25) discountPercent = 0.1
    else if (quantity >= 10) discountPercent = 0.05

    const { basePrice, discountAmount, finalPrice } = calculatePriceAndBonus(quantity, discountPercent)

    setCalculatedDetails({
      investedValue: finalPrice,
      quantity: quantity,
      basePrice: basePrice,
      discountAmount: discountAmount,
      finalPrice: finalPrice
    })
    setSelectedPackageId(null)
  }

  const handleProceedToConfirmation = () => {
    const quantity = customQuantity || 0
    if (quantity <= 0) {
      setError("Por favor, insira uma quantidade válida de títulos.")
      return
    }

    if (!calculatedDetails) {
      setError("Por favor, selecione uma quantidade de títulos.")
      return
    }

    if (calculatedDetails.finalPrice > currentSaldoSacavel) {
      setError("Saldo insuficiente para realizar a compra.")
      return
    }

    setError(null)
    setCurrentStep("confirmation")
  }

  const handleConfirmPurchase = () => {
    if (!calculatedDetails) return

    if (calculatedDetails.finalPrice > currentSaldoSacavel) {
      setError("Saldo insuficiente para realizar a compra.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Aqui você chamará a API para processar a compra
      onTransferSuccess(calculatedDetails.finalPrice, calculatedDetails.quantity)
      onClose()
    } catch (err) {
      console.error('Erro ao processar a compra:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar a compra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#191F26] border-[#1a323a] text-white rounded-xl shadow-xl p-6 w-full max-w-[85vw] md:max-w-md max-h-[90vh] h-full overflow-y-auto flex flex-col">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-center text-[#9ffe00]">Comprar Títulos</DialogTitle>
          <DialogDescription className="text-center text-gray-400 mt-2">
            {currentStep === "selectAmount"
              ? "Compre, raspe ou gire e concorra também aos sorteios semanais."
              : "Confirme os detalhes da sua compra."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

        {currentStep === "selectAmount" && (
          <div className="mt-6 space-y-6 flex-grow">
            <div className="grid grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative p-4 pt-8 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${selectedPackageId === pkg.id ? "border-[#9ffe00] shadow-glow" : "border-[#1a323a] hover:border-[#9ffe00]/50"}
                  bg-[#1a323a] flex flex-col items-center text-center`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  {pkg.discount_percent > 0 && (
                    <span className="absolute top-0 right-0 bg-[#9ffe00] text-[#191F26] text-xs font-bold px-2 py-1 rounded-bl-lg">
                      {pkg.discount_percent * 100}% OFF
                    </span>
                  )}
                  <Image
                    src="/images/raspepix-gold-bar-new.png"
                    alt="Ícone de Título"
                    width={40}
                    height={40}
                    className="mb-2"
                  />
                  <p className="text-lg font-bold text-white">{pkg.titles} Títulos</p>
                  <p className="text-sm text-gray-400">Por {formatCurrency(pkg.price * (1 - pkg.discount_percent))}</p>
                </div>
              ))}
            </div>

            <div className="relative flex items-center justify-center">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OU</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit-quantity" className="text-gray-300">
                Quantidade Personalizada de Títulos
              </Label>
              <Input
                id="deposit-quantity"
                type="number"
                placeholder="0"
                value={customQuantityDisplay}
                onChange={handleCustomQuantityChange}
                className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
              />
            </div>

            {calculatedDetails && calculatedDetails.quantity > 0 && (
              <div className="bg-[#1a323a] p-4 rounded-lg space-y-2 border border-[#9ffe00]/20">
                <h3 className="text-lg font-bold text-[#9ffe00]">Resumo do Investimento</h3>
                <div className="text-sm text-gray-300">
                  <p>Quantidade de Títulos: {calculatedDetails.quantity}</p>
                  <p>Preço Base: {formatCurrency(calculatedDetails.basePrice)}</p>
                  <p>Desconto: {formatCurrency(calculatedDetails.discountAmount)}</p>
                  <p className="font-bold text-white">Preço Final: {formatCurrency(calculatedDetails.finalPrice)}</p>
                  <p className="mt-2 pt-2 border-t border-white/10">
                    Saldo Disponível: <span className="font-bold text-white">{formatCurrency(currentSaldoSacavel)}</span>
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleProceedToConfirmation}
              className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow"
              disabled={!calculatedDetails || calculatedDetails.finalPrice > currentSaldoSacavel || isLoading}
            >
              {isLoading ? "Processando..." : "Comprar Títulos"}
            </Button>
          </div>
        )}

        {currentStep === "confirmation" && calculatedDetails && (
          <div className="mt-6 space-y-6 flex-grow">
            <div className="bg-[#1a323a] p-4 rounded-lg space-y-3">
              <h3 className="text-lg font-bold text-[#9ffe00]">Resumo da Compra</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Quantidade de títulos:</span>
                  <span className="text-white font-medium">{calculatedDetails.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Valor total:</span>
                  <span className="text-white font-bold">{formatCurrency(calculatedDetails.finalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-gray-400">Saldo após a compra:</span>
                  <span className="text-white font-medium">
                    {formatCurrency(currentSaldoSacavel - calculatedDetails.finalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleConfirmPurchase}
                className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Confirmar Compra"}
              </Button>
              <Button
                onClick={() => setCurrentStep("selectAmount")}
                variant="ghost"
                className="w-full text-gray-400 hover:bg-[#1a323a] hover:text-white"
              >
                Voltar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}