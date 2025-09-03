"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react" // Importar os ícones

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils" // Assumindo que cn está em lib/utils

import { Transacao, getTransacoes } from "@/services/transacoes"
import { getErrorMessage } from "@/services/api"

interface Transaction extends Omit<Transacao, "tipo"> {
  type: "purchase" | "prize"
}

interface TransactionHistoryProps {
  type?: "all" | "purchase" | "prize"
  userId: string
  itemsPerPage?: number
}

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
  itemsPerPage = 25,
  showLuckyNumbers = false,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const data = await getTransacoes()
        
        // Converte o tipo da API para o tipo interno do componente
        const mappedTransactions: Transaction[] = data.map(t => ({
          type: t.tipo === "saque" ? "prize" : "purchase",
          data: t.data,
          valor: t.valor
        }))

        // Filtra as transações se necessário
        const filteredTransactions = type === "all" 
          ? mappedTransactions
          : mappedTransactions.filter(t => t.type === type)

        setTransactions(filteredTransactions)
        setCurrentPage(1) // Reset page on filter change
      } catch (error) {
        console.error("Erro ao buscar transações:", error)
        // Você pode adicionar um toast ou outra notificação de erro aqui se desejar
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [type])

  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentTransactions = transactions.slice(startIndex, startIndex + itemsPerPage)

  const getTransactionTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "purchase":
        return "Compra de Título"
      case "prize":
        return "Pagamento de Prêmio"
      default:
        return "Transação"
    }
  }

  const getAmountColor = (type: Transaction["type"]) => {
    if (type === "prize") {
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
          key={`${transaction.data}-${transaction.valor}-${transaction.type}`}
          className="group bg-gradient-to-r from-[#1E2530] to-[#1a323a] rounded-lg p-4 border border-gray-800/30 flex items-center justify-between hover:shadow-lg hover:shadow-[#9FFF00]/5 transition-all duration-300 relative overflow-hidden"
        >
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="text-sm text-gray-400 font-medium">
                {format(new Date(transaction.data), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(transaction.data), "HH:mm", { locale: ptBR })}
              </div>
            </div>
            <div className={cn(
              "text-sm font-medium px-3 py-1 rounded-md",
              transaction.type === "prize" 
                ? "bg-[#9FFF00]/10 text-[#9FFF00] border border-[#9FFF00]/20" 
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            )}>
              {getTransactionTypeLabel(transaction.type)}
            </div>
          </div>
          <div className={cn(
            "font-bold text-lg tracking-tight",
            getAmountColor(transaction.type)
          )}>
            {formatCurrency(transaction.valor)}
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="bg-[#1E2530] border-gray-800 text-gray-400 hover:bg-[#1a323a] hover:text-white hover:border-[#9FFF00]/30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <div className="px-4 py-2 rounded-lg bg-[#1E2530] border border-gray-800 text-sm text-gray-400">
            Página {currentPage} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="bg-[#1E2530] border-gray-800 text-gray-400 hover:bg-[#1a323a] hover:text-white hover:border-[#9FFF00]/30 transition-colors"
          >
            Próximo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
