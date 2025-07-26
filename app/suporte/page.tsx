"use client"

import type React from "react"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useMemo } from "react"
import { PlusCircle, Clock, ChevronLeft, ChevronRight, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type SupportTicket, formatDate, renderStatusIndicator } from "@/lib/utils"
import NewTicketModal from "@/components/new-ticket-modal"
import TicketDetailDrawer from "@/components/ticket-detail-drawer"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { suporteService, type Ticket } from "@/services/suporte"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"

const ITEMS_PER_PAGE = 5 // Itens por página

const renderStatusIndicator = (status: string) => {
  const statusConfig = {
    aberto: {
      color: "bg-yellow-500/10",
      textColor: "text-yellow-500",
      borderColor: "border-yellow-500/20",
      label: "Aberto"
    },
    em_atendimento: {
      color: "bg-blue-500/10",
      textColor: "text-blue-500",
      borderColor: "border-blue-500/20",
      label: "Em Atendimento"
    },
    resolvido: {
      color: "bg-[#9FFF00]/10",
      textColor: "text-[#9FFF00]",
      borderColor: "border-[#9FFF00]/20",
      label: "Resolvido"
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aberto

  return (
    <div className={`px-4 py-1 rounded-full ${config.color} ${config.borderColor} border min-w-[120px] text-center`}>
      <span className={`text-xs font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  )
}

export default function SuportePage() {
  // Verifica autenticação
  useAuth();

  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showTicketDetailDrawer, setShowTicketDetailDrawer] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const { toast } = useToast()

  const loadTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await suporteService.listarTickets({
        status: statusFilter !== "todos" ? statusFilter : undefined,
        page: currentPage,
        per_page: ITEMS_PER_PAGE
      });

      console.log('Tickets carregados:', response);
      setTickets(response.data)
      setTotalItems(response.total)
      setTotalPages(response.total_pages)
    } catch (error: any) {
      console.error('Erro ao carregar tickets:', error)
      
      if (error.message === "Não autorizado") {
        // Será tratado pelo hook useAuth
        return;
      }

      setError(error.message || "Ocorreu um erro ao carregar os tickets")
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao carregar os tickets",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [currentPage, statusFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset para primeira página ao mudar filtro
  }

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowTicketDetailDrawer(true)
  }

  const handleNewTicketSuccess = () => {
    setShowNewTicketForm(false)
    loadTickets() // Recarrega a lista após criar novo ticket
    toast({
      title: "Sucesso",
      description: "Ticket criado com sucesso!",
    })
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-4 lg:p-8 min-h-screen bg-[#0D1117]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#9FFF00]/10">
                <Headphones className="h-7 w-7 text-[#9FFF00]" />
              </div>
              Central de Suporte
            </h1>
            <p className="text-gray-400 mt-2">Acompanhe seus chamados e tire suas dúvidas</p>
          </div>
          <Button
            onClick={() => setShowNewTicketForm(true)}
            className="bg-[#9FFF00] text-black hover:bg-lime-400 px-6 py-2 font-semibold flex items-center rounded-xl shadow-lg shadow-[#9FFF00]/10 hover:shadow-[#9FFF00]/20 transition-all duration-200"
          >
            <PlusCircle size={20} className="mr-2" />
            Novo Chamado
          </Button>
        </div>

        <div className="bg-[#1A2430] rounded-xl p-6 shadow-xl border border-[#9FFF00]/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Label className="text-xl font-semibold text-white flex items-center gap-2">
              Seus Chamados
              {!loading && !error && (
                <span className="text-sm font-normal text-gray-400">
                  ({totalItems} {totalItems === 1 ? 'ticket' : 'tickets'})
                </span>
              )}
            </Label>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[180px] bg-[#232D3F] border-[#9FFF00]/10 text-white hover:border-[#9FFF00]/30 transition-colors">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#232D3F] text-white border-[#9FFF00]/10">
                <SelectItem value="todos" className="hover:bg-[#2A3441] hover:text-[#9FFF00]">Todos</SelectItem>
                <SelectItem value="aberto" className="hover:bg-[#2A3441] hover:text-[#9FFF00]">Abertos</SelectItem>
                <SelectItem value="em_atendimento" className="hover:bg-[#2A3441] hover:text-[#9FFF00]">Em Atendimento</SelectItem>
                <SelectItem value="resolvido" className="hover:bg-[#2A3441] hover:text-[#9FFF00]">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#9FFF00] border-t-transparent"></div>
              <p className="text-gray-400 mt-4">Carregando tickets...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={loadTickets} variant="outline" className="border-[#9FFF00]/30 text-[#9FFF00] hover:bg-[#9FFF00]/10">
                Tentar Novamente
              </Button>
            </div>
          ) : (Array.isArray(tickets) && tickets.length === 0) ? (
            <div className="text-center py-8 text-gray-400">
              <p>Nenhum ticket encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket)}
                  className="bg-[#232D3F] p-6 rounded-xl cursor-pointer hover:bg-[#2A3441] transition-all duration-200 border border-[#9FFF00]/5 hover:border-[#9FFF00]/20 shadow-lg hover:shadow-[#9FFF00]/5 group"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white text-lg group-hover:text-[#9FFF00] transition-colors mb-2">
                          {ticket.titulo}
                        </h3>
                        {renderStatusIndicator(ticket.status)}
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 group-hover:text-gray-300 transition-colors">
                        {ticket.ultima_mensagem}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span className="group-hover:text-gray-400 transition-colors">
                          {formatDate(ticket.criado_em)}
                        </span>
                        {ticket.atendente && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-[#9FFF00]/70">
                              Atendente: {ticket.atendente}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1A2430] group-hover:bg-[#9FFF00]/10 transition-colors">
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#9FFF00] transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 border-t border-[#9FFF00]/5 pt-6">
              <span className="text-sm text-gray-400">
                Exibindo {tickets.length} de {totalItems} tickets
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative h-9 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10 hover:border-[#9FFF00] disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={
                      currentPage === page
                        ? "bg-[#9FFF00] text-black hover:bg-lime-400 h-9 min-w-[36px] px-3"
                        : "relative h-9 min-w-[36px] px-3 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10 hover:border-[#9FFF00]"
                    }
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative h-9 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10 hover:border-[#9FFF00] disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewTicketModal
        isOpen={showNewTicketForm}
        onClose={() => setShowNewTicketForm(false)}
        onSuccess={handleNewTicketSuccess}
      />

      {selectedTicket && (
        <TicketDetailDrawer
          isOpen={showTicketDetailDrawer}
          onClose={() => setShowTicketDetailDrawer(false)}
          ticket={selectedTicket}
        />
      )}
    </AuthenticatedLayout>
  )
}
