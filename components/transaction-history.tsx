"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react" // Importar os ícones

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils" // Assumindo que cn está em lib/utils

interface Transaction {
  id: string
  type: "deposit" | "withdraw" | "purchase" | "prize"
  amount: number
  date: string
  description: string
  luckyNumbersGenerated?: number // Agora pode ser para compra também
  bonus?: number // Para depósitos, mas não será exibido com os filtros atuais
}

interface TransactionHistoryProps {
  type?: "all" | "purchase" | "prize" // Tipos de filtro atualizados
  userId: string
  itemsPerPage?: number
  showLuckyNumbers?: boolean
}

const mockTransactions: Transaction[] = [
  {
    id: "2",
    type: "purchase",
    amount: 50.0,
    date: "2024-06-14T15:30:00Z",
    description: "Compra de Título #12345",
    luckyNumbersGenerated: 10,
  },
  {
    id: "4",
    type: "prize",
    amount: 200.0,
    date: "2024-06-12T11:45:00Z",
    description: "Prêmio do Sorteio Semanal",
  },
  {
    id: "6",
    type: "purchase",
    amount: 25.0,
    date: "2024-06-10T10:00:00Z",
    description: "Compra de Título #67890",
    luckyNumbersGenerated: 5,
  },
  {
    id: "11",
    type: "prize",
    amount: 150.0,
    date: "2024-06-05T14:00:00Z",
    description: "Prêmio Instantâneo",
  },
  {
    id: "12",
    type: "purchase",
    amount: 75.0,
    date: "2024-06-04T09:00:00Z",
    description: "Compra de Título #98765",
    luckyNumbersGenerated: 15,
  },
  {
    id: "13",
    type: "prize",
    amount: 300.0,
    date: "2024-06-03T16:00:00Z",
    description: "Prêmio do Sorteio Semanal",
  },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function TransactionHistory({
  type = "all",
  userId,
  itemsPerPage = 5,
  showLuckyNumbers = false,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Simula a busca de transações com base no userId e type
    const filteredTransactions = mockTransactions.filter((t) => {
      if (type === "all") return true
      // Only return purchase or prize transactions based on the selected filter
      return t.type === type
    })
    setTransactions(filteredTransactions)
    setLoading(false)
    setCurrentPage(1) // Reset page on filter change
  }, [type, userId])

  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentTransactions = transactions.slice(startIndex, startIndex + itemsPerPage)

  const getTransactionTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit": // These cases will no longer be reached with the new mock data/filters
        return "Depósito"
      case "withdraw": // These cases will no longer be reached with the new mock data/filters
        return "Saque"
      case "purchase":
        return "Compra de Título"
      case "prize":
        return "Pagamento de Prêmio" // Updated label
      default:
        return "Transação"
    }
  }

  const getAmountColor = (type: Transaction["type"]) => {
    if (type === "deposit" || type === "prize") {
      return "text-[#9FFF00]" // Verde para entradas
    }
    return "text-red-400" // Vermelho para saídas/compras
  }

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Carregando histórico...</div>
  }

  if (transactions.length === 0) {
    return <div className="text-gray-400 text-center py-8">Nenhuma transação encontrada.</div>
  }

  return (
    <div className="space-y-3">
      {currentTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-[#1E2530] rounded-lg p-3 border border-gray-700 flex flex-col gap-1" // Alterado para flex-col para melhor controle das linhas
        >
          {/* Primeira linha: Tipo e Valor */}
          <div className="flex justify-between items-center">
            <p className="text-white font-medium text-sm">{getTransactionTypeLabel(transaction.type)}</p>
            <p className={cn("font-bold text-sm", getAmountColor(transaction.type))}>
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Segunda linha: Descrição/Detalhes e Data/Hora */}
          <div className="flex justify-between items-center text-gray-400 text-xs">
            {transaction.type === "purchase" && transaction.luckyNumbersGenerated !== undefined ? (
              <p>Números da Sorte Gerados: {transaction.luckyNumbersGenerated}</p>
            ) : (
              <p>{transaction.description}</p>
            )}
            <p>{format(new Date(transaction.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="border-t border-gray-800 flex justify-between items-center p-3 bg-[#1E2530] rounded-xl shadow-lg mt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="text-gray-400 hover:bg-[#1a323a] hover:text-white"
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
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="text-gray-400 hover:bg-[#1a323a] hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Próximo</span>
          </Button>
        </div>
      )}
    </div>
  )
}
