"use client"

import { Button } from "@/components/ui/button"

import { useState, useMemo } from "react"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Helper para formatar valores como moeda BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

interface ExtractEntry {
  id: number
  commission_amount: number
  deposit_amount: number
  created_at: string // ISO string
  status: "completed" | "pending" | "cancelled" // Mantido no tipo, mas não será exibido
  transferred: boolean
}

interface AffiliateExtractTabProps {
  transactions: ExtractEntry[]
  selectedRange: string
  setSelectedRange: (range: string) => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

const ITEMS_PER_PAGE = 10

export default function AffiliateExtractTab({
  transactions,
  selectedRange,
  setSelectedRange,
  currentPage,
  setCurrentPage,
}: AffiliateExtractTabProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Função para filtrar transações com base no range selecionado
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    let startDate: Date | null = null

    switch (selectedRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "last7days":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case "last30days":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case "last90days":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case "all":
      default:
        startDate = null // No date filter
        break
    }

    return transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.created_at)
        return startDate ? transactionDate >= startDate : true
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by date descending
  }, [transactions, selectedRange])

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredTransactions.slice(startIndex, endIndex)
  }, [filteredTransactions, currentPage])

  const handlePageChange = (page: number) => {
    setIsLoading(true)
    setTimeout(() => {
      setCurrentPage(page)
      setIsLoading(false)
    }, 300) // Simulate loading
  }

  const handleRangeChange = (value: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setSelectedRange(value)
      setCurrentPage(1) // Reset to first page on filter change
      setIsLoading(false)
    }, 300) // Simulate loading
  }

  return (
    <div className="space-y-6">
      {/* Filtros de Data */}
      <div className="bg-[#1E2530] rounded-xl p-4 mb-4 shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Filtros</h2>
        <Select value={selectedRange} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-full bg-[#191F26] text-white border-gray-700 focus:ring-[#9FFF00] focus:border-[#9FFF00]">
            <SelectValue placeholder="Selecionar período" />
          </SelectTrigger>
          <SelectContent className="bg-[#191F26] text-white border-gray-700">
            <SelectItem value="all">Todos os períodos</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="last7days">Últimos 7 dias</SelectItem>
            <SelectItem value="last30days">Últimos 30 dias</SelectItem>
            <SelectItem value="last90days">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Extrato de Comissões */}
      <div className="bg-[#1E2530] rounded-xl p-4 mb-4 shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4 text-center">Extrato de Comissões</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-[#9FFF00]" />
          </div>
        ) : paginatedTransactions.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Nenhuma transação encontrada para o período selecionado.
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedTransactions.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex justify-between items-center p-3 bg-[#1a323a] rounded-lg
                  ${index < paginatedTransactions.length - 1 ? "border-b border-gray-800 pb-3" : ""}
                `}
              >
                {/* Lado Esquerdo */}
                <div>
                  <p className="text-sm font-medium text-white">Comissão de depósito</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-gray-400">Depósito: {formatCurrency(entry.deposit_amount)}</p>
                  {entry.transferred && <p className="text-xs text-[#9FFF00]">Transferido para saque</p>}
                </div>

                {/* Lado Direito */}
                <div className="text-right">
                  <p className="text-sm font-medium text-[#9FFF00]">+{formatCurrency(entry.commission_amount)}</p>
                  {/* Status removido */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="border-t border-gray-800 flex justify-between items-center p-3 bg-[#1E2530] rounded-xl shadow-lg mb-36">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:bg-[#1a323a] hover:text-white"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Anterior</span>
          </Button>
          <span className="text-sm text-gray-400">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:bg-[#1a323a] hover:text-white"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Próximo</span>
          </Button>
        </div>
      )}
    </div>
  )
}
