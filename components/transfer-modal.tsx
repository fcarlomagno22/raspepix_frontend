"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  currentSaldoParaJogar: number
  currentSaldoSacavel: number
  onTransferSuccess: (amountBRL: number, chipsQuantity: number) => void // Atualizado para passar valor em BRL e quantidade de fichas
}

// Custo de uma ficha em BRL
const CHIP_COST = 0.4
const CHIP_COST_CENTS = 40 // 0.40 BRL em centavos

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
  currentSaldoSacavel,
  onTransferSuccess,
}: TransferModalProps) {
  const [transferAmountDisplay, setTransferAmountDisplay] = useState("") // Valor formatado para o input
  const [transferAmountCents, setTransferAmountCents] = useState<number | null>(null) // Valor em centavos
  const [transferError, setTransferError] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTransferAmountDisplay("")
      setTransferAmountCents(null)
      setTransferError(null)
    }
  }, [isOpen])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "") // Remove todos os não-dígitos

    if (value === "") {
      setTransferAmountCents(null)
      setTransferAmountDisplay("")
      setTransferError(null)
      return
    }

    const cents = Number.parseInt(value, 10) // Converte para inteiro (centavos)
    setTransferAmountCents(cents)

    // Formata para exibição como moeda BRL
    const formatted = (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    setTransferAmountDisplay(formatted)

    // Validação de múltiplos de R$ 0,40
    if (cents % CHIP_COST_CENTS !== 0) {
      setTransferError("O valor deve ser múltiplo de R$ 0,40.")
    } else {
      setTransferError(null)
    }
  }

  const handleTransfer = () => {
    setTransferError(null)
    const amountInCents = transferAmountCents || 0

    // Re-valida o múltiplo de R$ 0,40 antes de prosseguir
    if (amountInCents % CHIP_COST_CENTS !== 0) {
      setTransferError("O valor deve ser múltiplo de R$ 0,40.")
      return
    }

    const amountInBRL = amountInCents / 100

    if (amountInBRL <= 0) {
      setTransferError("Por favor, insira um valor válido para transferir.")
      return
    }

    if (amountInBRL > currentSaldoSacavel) {
      setTransferError("Saldo insuficiente para realizar a transferência.")
      return
    }

    const chipsToTransfer = amountInCents / CHIP_COST_CENTS // Calcula a quantidade de fichas

    // Simula a transferência
    console.log("Transferindo:", amountInBRL, "BRL para", chipsToTransfer, "fichas.")
    onTransferSuccess(amountInBRL, chipsToTransfer) // Chama o callback com valor em BRL e fichas
  }

  // Calcula os saldos projetados após a transferência
  const amountToTransferBRL = transferAmountCents ? transferAmountCents / 100 : 0
  const chipsToTransfer = transferAmountCents ? transferAmountCents / CHIP_COST_CENTS : 0
  const projectedSaldoParaJogar = currentSaldoParaJogar + chipsToTransfer
  const projectedSaldoSacavel = currentSaldoSacavel - amountToTransferBRL

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#191F26] border-[#1a323a] text-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-[#9ffe00]">
            Transferir para Saldo de Jogo
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 mt-2">
            Mova fundos do seu saldo para sacar para o saldo de jogo.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          {transferError && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm text-center">{transferError}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="transfer-amount" className="text-gray-300">
              Valor da Transferência
            </Label>
            <Input
              id="transfer-amount"
              type="text" // Alterado para text para permitir formatação manual
              placeholder="R$ 0,00"
              value={transferAmountDisplay}
              onChange={handleAmountChange}
              className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
            />
            <p className="text-sm text-gray-400">
              Saldo disponível para sacar: <span className="font-bold">{formatCurrency(currentSaldoSacavel)}</span>
            </p>
          </div>

          <div className="bg-[#1a323a] p-4 rounded-lg space-y-2 border border-[#9ffe00]/20">
            <h3 className="text-lg font-bold text-[#9ffe00]">Resumo dos Saldos Após Transferência</h3>
            <div className="text-sm text-gray-300">
              <p>
                Fichas a Receber:{" "}
                <span className="font-bold text-white">{Math.floor(chipsToTransfer).toLocaleString("pt-BR")}</span>
              </p>
              <p>
                Fichas para Jogar (Total):{" "}
                <span className="font-bold text-white">
                  {Math.floor(projectedSaldoParaJogar).toLocaleString("pt-BR")}
                </span>
              </p>
              <p>
                Saldo para Sacar (Restante):{" "}
                <span className="font-bold text-white">{formatCurrency(projectedSaldoSacavel)}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={handleTransfer}
            className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow"
            disabled={
              !transferAmountCents ||
              transferAmountCents <= 0 ||
              transferAmountCents / 100 > currentSaldoSacavel ||
              transferAmountCents % CHIP_COST_CENTS !== 0 // Desabilita se não for múltiplo
            }
          >
            Transferir
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-400 hover:bg-[#1a323a] hover:text-white"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
