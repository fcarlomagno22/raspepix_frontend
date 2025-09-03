"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { formatCurrency } from "@/lib/utils"
import { ChevronUp, ChevronDown, Eye, Edit2 } from "lucide-react"
import { addDays } from "date-fns"

const formatCPF = (cpf: string): string => {
  // Remove qualquer caractere que não seja número
  const numbers = cpf.replace(/\D/g, "")
  
  // Aplica a máscara
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

import { Transacao } from "@/services/transacoes"

interface Purchase {
  nome_cliente: string
  cpf: string
  data_compra: string
  valor_pago: number
  nome_edicao: string
  status_pagamento: "pago" | "pendente"
}

interface TransactionResponse {
  depositos: Transacao[]
  saques: Transacao[]
}

interface SortConfig {
  key: keyof Purchase
  direction: "asc" | "desc"
}

export default function FinanceiroPurchasesTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchName, setSearchName] = useState("")
  const [searchCPF, setSearchCPF] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "data_compra",
    direction: "desc",
  })

  const { data: purchases = [], isLoading, error } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      try {
        const response = await api.get("/api/transacoes/admin/todas");
        
        // Log detalhado para debug
        console.log('Resposta completa da API:', {
          data: response.data,
          tipo: typeof response.data,
          estrutura: JSON.stringify(response.data, null, 2)
        });
        
        // Verificar se a resposta tem a estrutura esperada
        if (!response.data) {
          console.error('Resposta da API está vazia');
          return [];
        }
        
        // Mapear os dados para o formato esperado
        const transactions = Array.isArray(response.data) ? response.data : [];
        console.log('Transações para mapear:', transactions);
        
        const mappedTransactions = transactions.map((transaction: any) => {
          console.log('Mapeando transação:', transaction);
          const mapped = {
          nome_cliente: transaction.profiles?.full_name || transaction.nome_cliente || 'N/A',
          cpf: transaction.profiles?.cpf || transaction.cpf || 'N/A',
          data_compra: transaction.data || transaction.data_compra,
          valor_pago: transaction.valor || transaction.valor_pago || 0,
          nome_edicao: transaction.sorteios_edicoes?.nome || transaction.nome_edicao || 'N/A',
          status_pagamento: transaction.status || transaction.status_pagamento || 'pendente',
          id: transaction.id || `${transaction.cpf}-${transaction.data_compra}-${transaction.valor_pago}`
          };
          console.log('Transação mapeada:', mapped);
          return mapped
        });
        
        console.log('Todas as transações mapeadas:', mappedTransactions);
        return mappedTransactions;
      } catch (error: any) {
        console.error("Erro ao buscar transações:", error);
        
        // Se houver uma mensagem específica da API
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        
        // Se for erro de rede
        if (error.request) {
          throw new Error("Erro de conexão com o servidor. Verifique sua internet.");
        }
        
        // Para outros tipos de erro
        throw new Error("Não foi possível carregar as transações. Por favor, tente novamente.");
      }
    }
  })

  const itemsPerPage = 10

  const handleSort = (key: keyof Purchase) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pago":
      case "aprovado":
        return "text-[#9FFF00]"
      case "pendente":
        return "text-yellow-400"
      case "recusado":
      case "cancelado":
        return "text-red-400"
      default:
        return "text-gray-300"
    }
  }

  const filterPurchases = (purchases: Purchase[]) => {
    return purchases.filter((purchase) => {
      const nameMatch = purchase.nome_cliente.toLowerCase().includes(searchName.toLowerCase())
      const cpfMatch = purchase.cpf.includes(searchCPF)
      const purchaseDate = new Date(purchase.data_compra)
      
      // Validação de datas
      let dateMatch = true
      if (dateRange && dateRange.from) {
        dateMatch = dateMatch && purchaseDate >= dateRange.from
      }
      if (dateRange && dateRange.to) {
        dateMatch = dateMatch && purchaseDate <= dateRange.to
      }

      return nameMatch && cpfMatch && dateMatch
    })
  }

  const sortPurchases = (purchases: Purchase[]) => {
    return [...purchases].sort((a, b) => {
      if (sortConfig.key === "valor_pago" || sortConfig.key === "data_compra") {
        const aValue = sortConfig.key === "valor_pago" ? a.valor_pago : new Date(a.data_compra).getTime()
        const bValue = sortConfig.key === "valor_pago" ? b.valor_pago : new Date(b.data_compra).getTime()
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }
      return 0
    })
  }

  const filteredAndSortedPurchases = sortPurchases(filterPurchases(purchases))
  const totalPages = Math.ceil(filteredAndSortedPurchases.length / itemsPerPage)
  const currentPurchases = filteredAndSortedPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const SortIcon = ({ column }: { column: keyof Purchase }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 inline" />
    ) : (
      <ChevronDown className="h-4 w-4 inline" />
    )
  }

  return (
    <Card className="bg-[#232A34] border-[#366D51] shadow-md mb-8">
      <CardHeader>
        <CardTitle className="text-white">Compras Realizadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-4">
              Erro ao carregar as transações. Por favor, tente novamente.
            </div>
          ) : (
          <>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="bg-[#191F26] border-[#366D51] text-white"
            />
            <Input
              placeholder="Buscar por CPF..."
              value={searchCPF}
              onChange={(e) => setSearchCPF(e.target.value)}
              className="bg-[#191F26] border-[#366D51] text-white"
            />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#191F26]">
                <TableRow className="border-[#366D51]">
                  <TableHead className="text-white text-center">Nome do Cliente</TableHead>
                  <TableHead className="text-white text-center">CPF</TableHead>
                  <TableHead
                    className="text-white cursor-pointer text-center"
                    onClick={() => handleSort("data_compra")}
                  >
                    Data da Compra <SortIcon column="data_compra" />
                  </TableHead>
                  <TableHead
                    className="text-white cursor-pointer text-center"
                    onClick={() => handleSort("valor_pago")}
                  >
                    Valor Pago <SortIcon column="valor_pago" />
                  </TableHead>
                  <TableHead className="text-white text-center">Edição</TableHead>
                  <TableHead className="text-white text-center">Status</TableHead>
                  <TableHead className="text-white text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-[#232A34]">
                {currentPurchases.map((purchase) => (
                  <TableRow key={`${purchase.cpf}-${purchase.data_compra}-${purchase.valor_pago}`} className="border-[#366D51] hover:bg-[#191F26]">
                    <TableCell className="font-medium text-white text-center">{purchase.nome_cliente}</TableCell>
                    <TableCell className="text-gray-300 text-center">{formatCPF(purchase.cpf)}</TableCell>
                    <TableCell className="text-gray-300 text-center">{formatDate(purchase.data_compra)}</TableCell>
                    <TableCell className="text-white text-center">{formatCurrency(purchase.valor_pago)}</TableCell>
                    <TableCell className="text-gray-300 text-center">{purchase.nome_edicao}</TableCell>
                    <TableCell className={`${getStatusColor(purchase.status_pagamento)} text-center`}>{purchase.status_pagamento}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-[#366D51]"
                          onClick={() => {
                            // Implementar visualização da compra
                            console.log("Visualizar compra", purchase.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-[#366D51]"
                          onClick={async () => {
                            try {
                              const newStatus = purchase.status_pagamento === 'pago' ? 'pendente' : 'pago';
                              await api.patch(`/api/transacoes/admin/status/${purchase.id}`, {
                                status: newStatus
                              });
                              // Força o recarregamento dos dados
                              window.location.reload();
                            } catch (error) {
                              console.error('Erro ao atualizar status:', error);
                            }
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-400">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedPurchases.length)} de{" "}
              {filteredAndSortedPurchases.length} registros
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-[#191F26] border-[#366D51] text-white hover:bg-[#232A34]"
              >
                Anterior
              </Button>
              
              {/* Números das páginas */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Mostrar primeira página, última página, página atual e páginas adjacentes
                    return page === 1 || 
                           page === totalPages || 
                           Math.abs(page - currentPage) <= 1
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-gray-400 px-2">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 ${
                          currentPage === page 
                            ? "bg-[#366D51] text-white" 
                            : "bg-[#191F26] border-[#366D51] text-white hover:bg-[#232A34]"
                        }`}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-[#191F26] border-[#366D51] text-white hover:bg-[#232A34]"
              >
                Próxima
              </Button>
            </div>
          </div>
          </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 