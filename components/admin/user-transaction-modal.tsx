"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { formatCPF, formatCurrency } from "@/lib/utils"
import { getClientTransactions } from "@/services/transacoes"
import { useToast } from "@/components/ui/use-toast"

// Função de utilidade para formatar data com segurança
function formatDateSafely(dateString: string | undefined | null, includeTime: boolean = false): string {
  if (!dateString) return "Data não disponível"
  try {
    // A data vem no formato "2025-07-23T00:53:28.916271+00:00"
    // Podemos usar diretamente no construtor do Date
    const date = new Date(dateString)
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      console.error("Data inválida:", dateString)
      return "Data inválida"
    }
    
    return format(
      date,
      includeTime ? "dd/MM/yyyy 'às' HH:mm" : "dd/MM/yyyy",
      { locale: ptBR }
    )
  } catch (error) {
    console.error("Erro ao formatar data:", error, dateString)
    return "Data inválida"
  }
}
import type { User } from "./user-table"
import { DateRange } from "react-day-picker"

interface ApiTransaction {
  id: string
  profile_id: string
  edicao_id: string | null
  tipo: "deposito" | "saque"
  valor: number
  data: string
  status: "pago" | "pendente"
  profiles: {
    cpf: string
    full_name: string
  }
}

interface Transaction {
  id: string
  type: "deposit" | "withdrawal"
  date: string
  value: number
  status: "paid" | "pending"
}

interface UserTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

const ITEMS_PER_PAGE = 5

export function UserTransactionModal({ isOpen, onClose, user }: UserTransactionModalProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [currentPage, setCurrentPage] = useState(1)

  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    async function loadTransactions() {
      if (!user?.id || !isOpen) return
      
      setIsLoading(true)
      try {
        const response = await getClientTransactions(user.id)
        
        // A resposta é um array direto de transações
        const allTransactions: Transaction[] = response.map((t: ApiTransaction) => ({
          id: t.id,
          type: t.tipo === "deposito" ? "deposit" : "withdrawal",
          date: t.data,
          value: t.valor,
          status: t.status === "pago" ? "paid" : "pending"
        }))

        // Ordena por data, mais recente primeiro
        allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        setTransactions(allTransactions)
      } catch (error: any) {
        console.error("Erro ao carregar transações:", error)
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar as transações. Tente novamente mais tarde.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [user?.id, isOpen, toast])

  // Filtra transações por data
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!dateRange.from && !dateRange.to) return true
      const transactionDate = new Date(transaction.date)
      if (dateRange.from && dateRange.to) {
        return transactionDate >= dateRange.from && transactionDate <= dateRange.to
      }
      if (dateRange.from) {
        return transactionDate >= dateRange.from
      }
      if (dateRange.to) {
        return transactionDate <= dateRange.to
      }
      return true
    })
  }, [transactions, dateRange])

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredTransactions, currentPage])

  // Calcula totais
  const totals = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "deposit") {
        acc.deposits += transaction.value
      } else {
        acc.withdrawals += transaction.value
      }
      return acc
    },
    { deposits: 0, withdrawals: 0 }
  )

  if (!user) return null

  // Debug para ver o formato da data
  console.log("Data de cadastro:", user.created_at)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] max-h-[80vh] bg-[#232A34] border-[#366D51] text-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Extrato de Transações</DialogTitle>
        </DialogHeader>

        {/* Informações do Usuário */}
        <div className="bg-[#1A2430] p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-400 text-sm">Nome Completo</span>
              <p className="text-white font-medium">{user.full_name}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">CPF</span>
              <p className="text-white font-medium">{formatCPF(user.cpf)}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">E-mail</span>
              <p className="text-white font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Data de Cadastro</span>
              <p className="text-white font-medium">
                {formatDateSafely(user.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Filtro de Data e Resumo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="bg-[#1A2430] text-white"
            align="start"
            locale={ptBR}
          />
          <div className="flex gap-6">
            <div className="text-right">
              <span className="text-gray-400 text-sm">Total Depósitos</span>
              <p className="text-green-400 font-bold">{formatCurrency(totals.deposits)}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-sm">Total Saques</span>
              <p className="text-red-400 font-bold">{formatCurrency(totals.withdrawals)}</p>
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9FFF00]"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhuma transação encontrada no período selecionado.</p>
          ) : (
            <>
              {paginatedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-[#1A2430] p-4 rounded-lg border border-[#366D51] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {transaction.type === "deposit" ? (
                    <ArrowDownCircle className="h-6 w-6 text-green-400" />
                  ) : (
                    <ArrowUpCircle className="h-6 w-6 text-red-400" />
                  )}
                  <div>
                    <p className="font-medium">
                      {transaction.type === "deposit" ? "Compra de Título" : "Pagamento de Prêmio"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDateSafely(transaction.date, true)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      transaction.type === "deposit" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {transaction.type === "deposit" ? "+" : "-"} {formatCurrency(transaction.value)}
                  </p>
                  <span
                    className={`text-sm ${
                      transaction.status === "paid" ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {transaction.status === "paid" ? "Pago" : "Pendente"}
                  </span>
                </div>
              </div>
                          ))}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-[#1A2430] p-4 rounded-lg">
                  <span className="text-sm text-gray-400">
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:bg-[#9FFF00]/10 hover:text-[#9FFF00]"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="sr-only">Anterior</span>
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 rounded-md ${
                          currentPage === page
                            ? "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-[#191F26] font-bold"
                            : "text-gray-400 hover:bg-[#9FFF00]/10 hover:text-[#9FFF00]"
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:bg-[#9FFF00]/10 hover:text-[#9FFF00]"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-5 w-5" />
                      <span className="sr-only">Próximo</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}