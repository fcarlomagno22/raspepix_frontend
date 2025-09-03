"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useRef } from "react" // Importar useRef
import Image from "next/image"
import { Copy, Check } from "lucide-react"
import { api } from '@/services/api';

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onDepositSuccess: (data: { 
    numerosCapitalizadora: string[], 
    numerosPremiosInstantaneos: string[] 
  }) => void
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

export default function DepositModal({ isOpen, onClose, onDepositSuccess }: DepositModalProps) {
  const [currentStep, setCurrentStep] = useState<"selectAmount" | "showQrCode">("selectAmount")
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [customQuantity, setCustomQuantity] = useState<number | null>(null) // Quantidade de títulos
  const [customQuantityDisplay, setCustomQuantityDisplay] = useState<string>("") // Quantidade formatada para o input
  const [calculatedDetails, setCalculatedDetails] = useState<{
    investedValue: number // Preço final pago
    quantity: number
    basePrice: number
    discountAmount: number
    finalPrice: number
  } | null>(null)
  const [pixCode, setPixCode] = useState(
    "00020126580014BR.GOV.BCB.PIX0136a6b8d29c-2d7e-4f8a-9b0c-1e2f3g4h5i6j0259RaspePix S.A.53039865802BR5925RaspePix Pagamentos S.A.6008BRASILIA62070503***6304B1A2"
  )
  const [copied, setCopied] = useState(false) // Estado para o feedback de cópia
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchasedNumbers, setPurchasedNumbers] = useState<{
    numerosCapitalizadora: string[]
    numerosPremiosInstantaneos: string[]
  } | null>(null)

  // Timer states
  const INITIAL_TIMER_SECONDS = 3 * 60 // 3 minutos em segundos
  const [remainingTime, setRemainingTime] = useState(INITIAL_TIMER_SECONDS)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep("selectAmount")
      setSelectedPackageId(null)
      setCustomQuantity(null)
      setCustomQuantityDisplay("")
      setCalculatedDetails(null)
      setCopied(false)
      setError(null)
      setPurchasedNumbers(null) // Resetar números comprados
      // Clear timer when modal closes
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      setRemainingTime(INITIAL_TIMER_SECONDS) // Reset timer
    }
  }, [isOpen])

  // Timer logic
  useEffect(() => {
    if (currentStep === "showQrCode" && isOpen) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current) // Clear any existing interval
      }
      setRemainingTime(INITIAL_TIMER_SECONDS) // Start timer from initial value
      timerIntervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current)
              timerIntervalRef.current = null
            }
            // Optionally, handle timer expiration (e.g., show message, close modal)
            console.log("Tempo esgotado para o PIX!")
            // onClose(); // Auto-fecha o modal quando o tempo acaba
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [currentStep, isOpen])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getProgressBarColor = () => {
    if (remainingTime <= 30) {
      return "bg-red-500 shadow-red-glow" // Vermelho neon
    } else if (remainingTime <= 60) {
      return "bg-yellow-400 shadow-yellow-glow" // Amarelo
    }
    return "bg-[#9ffe00]" // Verde padrão
  }

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
    else if (quantity >= 25) discountPercent = 0.1 // Novo limite de desconto

    const { basePrice, discountAmount, finalPrice } = calculatePriceAndBonus(quantity, discountPercent)

    setCalculatedDetails({
      investedValue: finalPrice,
      quantity: quantity,
      basePrice: basePrice,
      discountAmount: discountAmount,
      finalPrice: finalPrice,
    })
    setSelectedPackageId(null)
  }

  const handleGenerateQrCode = () => {
    const quantity = customQuantity || 0
    if (quantity <= 0) {
      setError("Por favor, insira uma quantidade válida de títulos.")
      return
    }

    setError(null)
    setCurrentStep("showQrCode")
  }

  const handleConfirmPayment = async () => {
    if (!calculatedDetails) {
      setError("Detalhes do pagamento não encontrados.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post('/api/sorteio/comprar', {
        quantidade_numeros: calculatedDetails.quantity,
        valor_unitario: TITULO_COST,
        edicao_sorteio_id: null
      });

      const data = response.data;

      // Armazena os números retornados
      setPurchasedNumbers(data.data)
      
      // Chama o callback de sucesso com os números
      onDepositSuccess(data.data)
      
      // Fecha o modal
      onClose()
    } catch (err) {
      console.error('Erro completo:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar a compra')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const progressBarWidth = (remainingTime / INITIAL_TIMER_SECONDS) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#191F26] border-[#1a323a] text-white rounded-xl shadow-xl p-6 w-full max-w-[85vw] md:max-w-md max-h-[90vh] h-full overflow-y-auto flex flex-col">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-center text-[#9ffe00]">Comprar Títulos</DialogTitle>
          <DialogDescription className="text-center text-gray-400 mt-2">
            {currentStep === "selectAmount"
              ? "Compre, raspe ou gire e concorra também aos sorteios semanais."
              : "Escaneie o QR Code ou use o código PIX para pagar."}
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
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerateQrCode}
              className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow"
              disabled={!calculatedDetails || isLoading}
            >
              {isLoading ? "Processando..." : "Comprar Títulos"}
            </Button>
          </div>
        )}

        {currentStep === "showQrCode" && calculatedDetails && (
          <div className="mt-6 space-y-6 flex-grow flex flex-col items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <Image
                src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//qr_code.png"
                alt="PIX QR Code"
                width={200}
                height={200}
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-sm text-gray-400 text-center">Escaneie o QR Code acima com o aplicativo do seu banco.</p>

            {/* Timer e Barra de Progresso */}
            <div className="w-full mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span>Tempo Restante:</span>
                <span className="font-bold text-[#9ffe00]">{formatTime(remainingTime)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ease-linear ${getProgressBarColor()}`}
                  style={{ width: `${progressBarWidth}%` }}
                ></div>
              </div>
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="pix-code" className="text-gray-300 text-center block">
                PIX Copia e Cola
              </Label>
              <div className="relative">
                <Input
                  id="pix-code"
                  type="text"
                  value={pixCode}
                  readOnly
                  className="bg-[#1a323a] border-[#1a323a] text-white pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 text-[#9ffe00] hover:bg-[#9ffe00]/10"
                  onClick={handleCopyPixCode}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="sr-only">{copied ? "Copiado!" : "Copiar código PIX"}</span>
                </Button>
              </div>
            </div>
            <div className="w-full space-y-2 mt-4">
              <Button
                onClick={handleConfirmPayment}
                className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow"
                disabled={remainingTime === 0}
              >
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
