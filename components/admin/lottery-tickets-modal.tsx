"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { getFilteredAndPaginatedMockTickets, type Ticket, type TicketStatus } from "@/lib/mock-ticket-data"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface LotteryTicketsModalProps {
  isOpen: boolean
  onClose: () => void
  editionName: string
  editionId: string
  editionStatus: "futuro" | "ativo" | "encerrado"
}

const ITEMS_PER_PAGE = 100

export default function LotteryTicketsModal({
  isOpen,
  onClose,
  editionName,
  editionId,
  editionStatus,
}: LotteryTicketsModalProps) {
  const [titles, setTitles] = useState<Ticket[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "todos">("todos")
  const [onlyPremiados, setOnlyPremiados] = useState(false)
  const [totalFilteredCount, setTotalFilteredCount] = useState(0)
  const [totalPremiadosCount, setTotalPremiadosCount] = useState(0)
  const [totalSoldCount, setTotalSoldCount] = useState(0)

  const totalPages = Math.ceil(totalFilteredCount / ITEMS_PER_PAGE)

  const fetchTitles = useCallback(
    async (page: number) => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve(null), 500))
      let {
        tickets: fetchedTitles,
        totalCount,
        totalPremiados,
        totalSold,
      } = getFilteredAndPaginatedMockTickets(page, ITEMS_PER_PAGE, searchTerm, statusFilter, onlyPremiados)

      // Aplica a lógica para edições "encerrado":
      // Todos os títulos premiados devem ser marcados como "comprado" e "pago".
      if (editionStatus === "encerrado") {
        fetchedTitles = fetchedTitles.map((ticket) => {
          if (ticket.prizeType) {
            // Se for um título premiado, garante que o status é "comprado" e o pagamento é "pago"
            // E assume que o buyerName e buyerCpf já estão presentes no mock data para tickets premiados
            return {
              ...ticket,
              status: "comprado",
              paymentStatus: "pago",
            }
          }
          return ticket
        })
        // Nota: As contagens totais (totalFilteredCount, totalPremiadosCount, totalSoldCount)
        // são baseadas nos dados mockados originais antes desta sobrescrita visual.
        // Para dados reais, o backend já retornaria o estado correto.
      }

      setTitles(fetchedTitles)
      setTotalFilteredCount(totalCount)
      setTotalPremiadosCount(totalPremiados)
      setTotalSoldCount(totalSold)
      setIsLoading(false)
    },
    [searchTerm, statusFilter, onlyPremiados, editionStatus],
  )

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1)
      fetchTitles(1)
    } else {
      setTitles([])
      setCurrentPage(1)
      setSearchTerm("")
      setStatusFilter("todos")
      setOnlyPremiados(false)
      setTotalFilteredCount(0)
      setTotalPremiadosCount(0)
      setTotalSoldCount(0)
    }
  }, [isOpen, searchTerm, statusFilter, onlyPremiados, fetchTitles])

  useEffect(() => {
    if (isOpen) {
      fetchTitles(currentPage)
    }
  }, [currentPage, isOpen, fetchTitles])

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  const handlePaymentStatusChange = (ticketNumber: string) => {
    setTitles((prevTitles) =>
      prevTitles.map((title) => (title.number === ticketNumber ? { ...title, paymentStatus: "pago" } : title)),
    )
  }

  const totalColSpan = 7

  return (
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-[#1A2430] border-[#9FFF00]/30 text-white placeholder:text-gray-500 focus:border-[#9FFF00]"
          />
          <Select value={statusFilter} onValueChange={(value: TicketStatus | "todos") => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px] bg-[#1A2430] border-[#9FFF00]/30 text-white focus:border-[#9FFF00]">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A2430] border-[#9FFF00]/30 text-white">
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="comprado">Comprado</SelectItem>
              <SelectItem value="disponivel">Disponível</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="only-premiados"
              checked={onlyPremiados}
              onCheckedChange={(checked: boolean) => setOnlyPremiados(checked)}
              className="border-[#9FFF00] data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-black"
            />
            <label htmlFor="only-premiados" className="text-sm font-medium leading-none text-gray-300">
              Apenas Premiados
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center py-2 text-sm text-gray-400">
          <span>
            Total de Títulos Filtrados:{" "}
            <span className="font-bold text-[#9FFF00]">{totalFilteredCount.toLocaleString("pt-BR")}</span>
          </span>
          <span>
            Títulos Premiados:{" "}
            <span className="font-bold text-[#9FFF00]">{totalPremiadosCount.toLocaleString("pt-BR")}</span>
          </span>
          <span>
            Títulos Vendidos: <span className="font-bold text-[#9FFF00]">{totalSoldCount.toLocaleString("pt-BR")}</span>
          </span>
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
                  <TableHead className="text-gray-300 text-center">Número do Título</TableHead>
                  <TableHead className="text-gray-300 text-center">Status</TableHead>
                  <TableHead className="text-gray-300 text-center">Comprador</TableHead>
                  <TableHead className="text-gray-300 text-center">CPF do Comprador</TableHead>
                  <TableHead className="text-gray-300 text-center">Status Pagamento</TableHead>
                  <TableHead className="text-gray-300 text-center">Tipo de Prêmio</TableHead>
                  <TableHead className="text-gray-300 text-center">Valor do Prêmio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-[#191F26] divide-y divide-[#232A34]">
                {titles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={totalColSpan} className="text-center text-white py-4">
                      Nenhum título encontrado com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  titles.map((title) => {
                    // Determina o status e status de pagamento a serem exibidos
                    // Se a edição estiver encerrada e o título for premiado, sobrescreve o status e pagamento
                    const currentTicketStatus =
                      editionStatus === "encerrado" && title.prizeType ? "comprado" : title.status

                    const currentPaymentStatus =
                      editionStatus === "encerrado" && title.prizeType ? "pago" : title.paymentStatus

                    return (
                      <TableRow key={title.number} className="border-[#9FFF00]/10 hover:bg-[#1A2430]">
                        <TableCell className="font-medium text-white text-center">{title.number}</TableCell>
                        <TableCell
                          className={`text-center ${currentTicketStatus === "comprado" ? "text-green-400" : "text-gray-400"}`}
                        >
                          {currentTicketStatus === "comprado" ? "Comprado" : "Disponível"}
                        </TableCell>
                        <TableCell className="text-gray-300 text-center">
                          {/* Exibe o nome do comprador se o status for "comprado" */}
                          {currentTicketStatus === "comprado" ? title.buyerName || "-" : "-"}
                        </TableCell>
                        <TableCell className="text-gray-300 text-center">
                          {/* Exibe o CPF do comprador se o status for "comprado" */}
                          {currentTicketStatus === "comprado" ? title.buyerCpf || "-" : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {currentTicketStatus === "comprado" ? (
                            currentPaymentStatus === "pendente" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePaymentStatusChange(title.number)}
                                className="h-7 px-2 text-xs border-orange-500 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
                              >
                                Pendente (Marcar como Pago)
                              </Button>
                            ) : (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Pago</Badge>
                            )
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300 text-center">
                          {title.prizeType === "raspadinha"
                            ? "Raspadinha"
                            : title.prizeType === "sorteio"
                              ? "Sorteio"
                              : "-"}
                        </TableCell>
                        <TableCell className="text-gray-300 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {title.prizeValue
                              ? typeof title.prizeValue === "number"
                                ? formatCurrency(title.prizeValue)
                                : title.prizeValue
                              : "-"}
                            {title.prizeType && editionStatus === "encerrado" && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                Contemplado
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1
              if (currentPage > 3 && totalPages > 5) {
                if (currentPage + 1 < totalPages) {
                  pageNum = currentPage - 2 + i
                } else {
                  pageNum = totalPages - 4 + i
                }
              }
              if (pageNum < 1) pageNum = 1
              if (pageNum > totalPages) pageNum = totalPages

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(pageNum)}
                  disabled={isLoading}
                  className={
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black"
                      : "relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00]"
                  }
                >
                  {pageNum}
                </Button>
              )
            })}
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
  )
}
