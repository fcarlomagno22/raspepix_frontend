"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Loader2, ArrowRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "@/lib/utils"

const formatCPF = (cpf: string | null) => {
  if (!cpf) return "-"
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}
import { Badge } from "@/components/ui/badge"
import { listarNumerosCapitalizadora, buscarTotalTitulosPagos, buscarTotalTitulosPendentes, atualizarStatusPagamentoTitulo, type NumeroCapitalizadora } from "@/services/sorteio"
import { useToast } from "@/components/ui/use-toast"
import { debounce } from "lodash"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface LotteryTicketsModalProps {
  isOpen: boolean
  onClose: () => void
  editionName: string
  editionId: string
  editionStatus: "futuro" | "ativo" | "encerrado"
}

interface SelectedTitle {
  id: string
  currentStatus: string
}

const ITEMS_PER_PAGE = 100

export default function LotteryTicketsModal({
  isOpen,
  onClose,
  editionName,
  editionId,
  editionStatus,
}: LotteryTicketsModalProps) {
  const { toast } = useToast()
  const [titles, setTitles] = useState<NumeroCapitalizadora[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [totalFilteredCount, setTotalFilteredCount] = useState(0)
  const [totalTitulosPagos, setTotalTitulosPagos] = useState(0)
  const [totalSoldCount, setTotalSoldCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [selectedTitles, setSelectedTitles] = useState<SelectedTitle[]>([])
  const [selectedTitle, setSelectedTitle] = useState<SelectedTitle | null>(null)

  const fetchTitles = useCallback(
    async () => {
      setIsLoading(true)
      try {
        console.log('Buscando com parâmetros:', {
          editionId,
          currentPage,
          ITEMS_PER_PAGE,
          searchTerm,
          statusFilter
        });

        const response = await listarNumerosCapitalizadora(
          editionId,
          currentPage,
          ITEMS_PER_PAGE,
          searchTerm,
          statusFilter
        )

        console.log('Dados recebidos:', {
          total: response.total,
          registros: response.data.length,
          filtros: {
            busca: searchTerm,
            status: statusFilter
          }
        });

        // Não precisa mais filtrar localmente, pois a API já retorna filtrado
        setTitles(response.data)
        setTotalFilteredCount(response.total)
        setTotalPages(response.total_pages)

      } catch (error) {
        console.error('Erro ao carregar títulos:', error)
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao carregar títulos",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    },
    [editionId, currentPage, searchTerm, statusFilter, toast]
  )

  const fetchTotalTitulosPagos = useCallback(async () => {
    try {
      const total = await buscarTotalTitulosPagos(editionId)
      setTotalTitulosPagos(total)
    } catch (error) {
      console.error('Erro ao buscar total de títulos pagos:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o total de títulos pagos",
        variant: "destructive"
      })
    }
  }, [editionId, toast])

  const fetchTotalTitulosPendentes = useCallback(async () => {
    try {
      const total = await buscarTotalTitulosPendentes(editionId)
      setTotalSoldCount(total)
    } catch (error) {
      console.error('Erro ao buscar total de títulos pendentes:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o total de títulos pendentes",
        variant: "destructive"
      })
    }
  }, [editionId, toast])

  // Debounce para pesquisa
  const debouncedFetch = useCallback(
    debounce(() => {
      fetchTitles()
    }, 300),
    [fetchTitles]
  )

  // Handler para mudança na pesquisa
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setCurrentPage(1) // Volta para primeira página ao pesquisar
    debouncedFetch() // Chama a busca com debounce
  }

  // Handler para mudança no filtro de status
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Volta para primeira página ao filtrar
    fetchTitles() // Busca imediatamente ao mudar o status
  }

  const handleStatusChange = async (tituloId: string, currentStatus: string) => {
    setSelectedTitle({ id: tituloId, currentStatus })
    setShowStatusDialog(true)
  }

  const handleConfirmStatusChange = async () => {
    if (!selectedTitle && selectedTitles.length === 0) return

    setIsLoading(true)
    try {
      if (selectedTitle) {
        // Caso de título único
        const novoStatus = selectedTitle.currentStatus === "PAGO" ? "PENDENTE" : "PAGO"
        await atualizarStatusPagamentoTitulo(selectedTitle.id, novoStatus)
      } else {
        // Caso de múltiplos títulos
        const novoStatus = selectedTitles[0].currentStatus === "PAGO" ? "PENDENTE" : "PAGO"
        for (const title of selectedTitles) {
          await atualizarStatusPagamentoTitulo(title.id, novoStatus)
        }
      }
      
      toast({
        title: "Status atualizado",
        description: "O status do pagamento foi atualizado com sucesso.",
        variant: "default",
      })

      // Recarrega os dados
      await fetchTitles()
      await fetchTotalTitulosPagos()
      await fetchTotalTitulosPendentes()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pagamento.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowStatusDialog(false)
      setSelectedTitle(null)
      setSelectedTitles([])
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchTitles()
      fetchTotalTitulosPagos()
      fetchTotalTitulosPendentes()
    } else {
      // Limpa todos os estados ao fechar
      setTitles([])
      setCurrentPage(1)
      setSearchTerm("")
      setStatusFilter("todos")
      setTotalFilteredCount(0)
      setTotalTitulosPagos(0)
      setTotalSoldCount(0)
      setSelectedTitles([])
    }
  }, [isOpen, fetchTitles, fetchTotalTitulosPagos, fetchTotalTitulosPendentes])

  // Atualiza a lista quando mudar a página
  useEffect(() => {
    if (isOpen) {
      fetchTitles()
    }
  }, [currentPage, isOpen, fetchTitles])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  const totalColSpan = 7

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col bg-[#0D1117] border-[#9FFF00]/10 text-white p-6">
          <DialogHeader className="pb-4 border-b border-[#9FFF00]/10">
            <DialogTitle className="text-2xl font-bold text-[#9FFF00]">Títulos da Edição: {editionName}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Visualização dos títulos gerados para esta edição, incluindo status de compra e informações de prêmio.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-4 py-4 border-b border-[#9FFF00]/10">
            <Input
              placeholder="Pesquisar por número, nome ou CPF..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-1 bg-[#1A2430] border-[#9FFF00]/30 text-white placeholder:text-gray-500 focus:border-[#9FFF00]"
            />
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[180px] bg-[#1A2430] border-[#9FFF00]/30 text-white focus:border-[#9FFF00]">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2430] border-[#9FFF00]/30 text-white">
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="PAGO">Pago</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center py-2 text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span>
                Total de Títulos Filtrados:{" "}
                <span className="font-bold text-[#9FFF00]">{totalFilteredCount.toLocaleString("pt-BR")}</span>
              </span>
              <span>
                Títulos Pagos:{" "}
                <span className="font-bold text-[#9FFF00]">{totalTitulosPagos.toLocaleString("pt-BR")}</span>
              </span>
              <span>
                Pagamentos Pendentes: <span className="font-bold text-[#9FFF00]">{totalSoldCount.toLocaleString("pt-BR")}</span>
              </span>
            </div>
            {selectedTitles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[#9FFF00]">{selectedTitles.length} títulos selecionados</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTitle(null)
                    setShowStatusDialog(true)
                  }}
                  className="border-[#9FFF00]/30 text-[#9FFF00] hover:bg-[#9FFF00]/10"
                >
                  Alterar Status
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-[#9FFF00]" />
                <span className="ml-2 text-gray-400">Carregando títulos...</span>
              </div>
            ) : (
              <Table className="min-w-full">
                <TableHeader className="sticky top-0 bg-[#1A2430] z-10">
                  <TableRow className="border-[#9FFF00]/10">
                    <TableHead className="text-gray-300 text-center w-10">
                      <Checkbox
                        checked={titles.length > 0 && selectedTitles.length === titles.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            const allTitles = titles.map(title => ({
                              id: title.id,
                              currentStatus: title.status_pagamento || ""
                            }))
                            setSelectedTitles(allTitles)
                          } else {
                            setSelectedTitles([])
                          }
                        }}
                        className="border-[#9FFF00]/30"
                      />
                    </TableHead>
                    <TableHead className="text-gray-300 text-center">Número do Título</TableHead>
                    <TableHead className="text-gray-300 text-center">Status</TableHead>
                    <TableHead className="text-gray-300 text-center">Comprador</TableHead>
                    <TableHead className="text-gray-300 text-center">CPF do Comprador</TableHead>
                    <TableHead className="text-gray-300 text-center">Status Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-[#191F26] divide-y divide-[#232A34]">
                  {titles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-white py-4">
                        Nenhum título encontrado com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    titles.map((title) => (
                      <TableRow key={title.numero} className="border-[#9FFF00]/10 hover:bg-[#1A2430]">
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedTitles.some(selected => selected.id === title.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTitles([...selectedTitles, {
                                  id: title.id,
                                  currentStatus: title.status_pagamento || ""
                                }])
                              } else {
                                setSelectedTitles(selectedTitles.filter(selected => selected.id !== title.id))
                              }
                            }}
                            className="border-[#9FFF00]/30"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-white text-center">
                          {title.numero}
                        </TableCell>
                        <TableCell className={`text-center ${title.comprador_nome ? "text-gray-400" : "text-green-400"}`}>
                          {title.comprador_nome ? "Indisponível" : "Disponível"}
                        </TableCell>
                        <TableCell className="text-gray-300 text-center">
                          {title.comprador_nome || "-"}
                        </TableCell>
                        <TableCell className="text-gray-300 text-center">
                          {formatCPF(title.comprador_cpf)}
                        </TableCell>
                        <TableCell className="text-center">
                          {title.status_pagamento ? (
                            <Badge 
                              className={
                                title.status_pagamento === "PAGO" 
                                  ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 text-xs py-1 px-2 flex justify-center cursor-pointer"
                                  : "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30 flex items-center justify-center gap-1 text-xs py-1 px-2 whitespace-nowrap cursor-pointer"
                              }
                              onClick={() => handleStatusChange(title.id, title.status_pagamento || "")}
                            >
                              {title.status_pagamento === "PAGO" ? "Pago" : (
                                <>
                                  Pendente
                                  <ArrowRight className="h-3 w-3" />
                                </>
                              )}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#9FFF00]/10">
            <span className="text-sm text-gray-400">
              Página {currentPage} de {totalPages} ({totalFilteredCount.toLocaleString("pt-BR")} títulos filtrados)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isLoading}
                className="relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00]"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              {(() => {
                let pages = [];
                const maxVisiblePages = 5;
                let startPage = 1;
                let endPage = totalPages;

                if (totalPages > maxVisiblePages) {
                  // Sempre mostrar a primeira página
                  if (currentPage <= 3) {
                    endPage = maxVisiblePages;
                  } else if (currentPage >= totalPages - 2) {
                    startPage = totalPages - maxVisiblePages + 1;
                  } else {
                    startPage = currentPage - 2;
                    endPage = currentPage + 2;
                  }
                }

                // Adicionar primeira página
                if (startPage > 1) {
                  pages.push(
                    <Button
                      key={1}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageClick(1)}
                      disabled={isLoading}
                      className="relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00]"
                    >
                      1
                    </Button>
                  );
                  if (startPage > 2) {
                    pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
                  }
                }

                // Adicionar páginas do meio
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageClick(i)}
                      disabled={isLoading}
                      className={
                        currentPage === i
                          ? "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black"
                          : "relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00]"
                      }
                    >
                      {i}
                    </Button>
                  );
                }

                // Adicionar última página
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
                  }
                  pages.push(
                    <Button
                      key={totalPages}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageClick(totalPages)}
                      disabled={isLoading}
                      className="relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00]"
                    >
                      {totalPages}
                    </Button>
                  );
                }

                return pages;
              })()}
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoading}
                className="relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00]"
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent className="bg-[#1A2430] border-[#9FFF00]/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#9FFF00]">Confirmar alteração de status</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {selectedTitle ? (
                selectedTitle.currentStatus === "PAGO" 
                  ? "Deseja realmente alterar o status do pagamento para Pendente?"
                  : "Deseja realmente alterar o status do pagamento para Pago?"
              ) : (
                selectedTitles[0]?.currentStatus === "PAGO"
                  ? `Deseja realmente alterar o status de ${selectedTitles.length} títulos para Pendente?`
                  : `Deseja realmente alterar o status de ${selectedTitles.length} títulos para Pago?`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-600 text-white hover:bg-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              className="bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black hover:from-[#8AE000] hover:to-[#7AC000]"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
