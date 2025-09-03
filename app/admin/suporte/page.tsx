"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { formatDate, renderStatusIndicator } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { adminSuporteService, type AdminTicket } from "@/services/suporte"
import { useQuery } from "@tanstack/react-query"
import debounce from "lodash/debounce"
import { Dialog } from "@/components/ui/dialog"
import AdminTicketDetailDrawer from "@/components/admin/ticket-detail-drawer"

type TicketStatus = AdminTicket["status"] | "all"

const ITEMS_PER_PAGE = 25

export default function AdminSupportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Estado dos filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [activeTab, setActiveTab] = useState<TicketStatus>((searchParams.get("status") as TicketStatus) || "all")
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1)
  const [mounted, setMounted] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Atualizar URL com filtros
  const updateUrlParams = useCallback((params: { search?: string; status?: string; page?: number }) => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    if (params.search !== undefined) {
      if (params.search) newParams.set("search", params.search)
      else newParams.delete("search")
    }
    
    if (params.status !== undefined) {
      if (params.status !== "all") newParams.set("status", params.status)
      else newParams.delete("status")
    }
    
    if (params.page !== undefined) {
      if (params.page > 1) newParams.set("page", params.page.toString())
      else newParams.delete("page")
    }

    router.push(`?${newParams.toString()}`)
  }, [searchParams, router])

  // Query para buscar tickets
  const { data, isLoading: queryLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-tickets", activeTab, searchTerm, currentPage],
    queryFn: () => adminSuporteService.listarTickets({
      status: activeTab,
      searchTerm: searchTerm,
      page: currentPage,
      limit: ITEMS_PER_PAGE
    }),
    keepPreviousData: true,
    retry: 1,
    enabled: mounted // Só executa a query após o componente montar
  })

  // Debounce para busca
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setCurrentPage(1)
      updateUrlParams({ search: term, page: 1 })
    }, 500),
    [updateUrlParams]
  )

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    debouncedSearch(term)
  }

  const handleTabChange = (status: TicketStatus) => {
    setActiveTab(status)
    setCurrentPage(1)
    updateUrlParams({ status, page: 1 })
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (data?.totalPages || 1)) {
      setCurrentPage(page)
      updateUrlParams({ page })
    }
  }

  const handleTicketClick = (ticket: AdminTicket) => {
    setSelectedTicket(ticket)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedTicket(null)
  }

  const handleMessageSent = () => {
    // Recarrega a lista de tickets para atualizar status/última mensagem
    refetch()
  }

  // Tratamento de erros
  useEffect(() => {
    if (isError && error instanceof Error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })

      if (error.message.includes("Sessão expirada")) {
        router.push("/admin/login")
      }
    }
  }, [isError, error, toast, router])

  // Determina o estado de loading real
  const isLoading = !mounted || queryLoading

  return (
    <div className="flex min-h-screen text-white">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:ml-64">
        <h1 className="text-2xl font-bold text-white mb-6">Suporte</h1>

        <Card className="bg-[#1A2430] border border-[#9FFF00]/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Tickets</h2>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent border border-[#9FFF00] text-[#9FFF00] hover:bg-[#9FFF00]/10"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 text-[#9FFF00] ${isLoading ? "animate-spin" : ""}`} />
                <span className="sr-only">Atualizar</span>
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 bg-[#111827] border-[#9FFF00]/20 text-white"
              />
            </div>

            <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as TicketStatus)}>
              <TabsList className="grid grid-cols-4 mb-4 bg-[#111827]">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#9FFF00]/20 data-[state=active]:text-[#9FFF00]"
                >
                  Todos
                </TabsTrigger>
                <TabsTrigger
                  value="aberto"
                  className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
                >
                  Aguardando
                </TabsTrigger>
                <TabsTrigger
                  value="em_atendimento"
                  className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                >
                  Atendendo
                </TabsTrigger>
                <TabsTrigger
                  value="resolvido"
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  Encerrado
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                {!mounted ? null : isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-[#9FFF00]" />
                  </div>
                ) : isError ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p>{error instanceof Error ? error.message : "Erro ao carregar tickets"}</p>
                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      className="mt-4 border-[#9FFF00]/30 text-[#9FFF00] hover:bg-[#9FFF00]/10"
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                ) : !data?.tickets.length ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum ticket encontrado</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {data.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => handleTicketClick(ticket)}
                          className="bg-[#232D3F] p-4 rounded-lg cursor-pointer hover:bg-[#2A3441] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white">{ticket.titulo}</h3>
                                {renderStatusIndicator(ticket.status)}
                              </div>
                              <div className="flex items-center text-sm text-gray-400 gap-4">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatDate(ticket.criado_em)}
                                </div>
                                <div className="flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  {ticket.usuario.full_name}
                                </div>
                                {ticket.atendente && (
                                  <div className="flex items-center text-[#9FFF00]/70">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {ticket.atendente.nome_completo}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {data.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <span className="text-sm text-gray-400">
                          Página {currentPage} de {data.totalPages}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="relative h-9 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10 hover:border-[#9FFF00] disabled:opacity-50 disabled:hover:bg-transparent"
                          >
                            <ChevronLeft className="h-4 w-4" /> Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === data.totalPages || isLoading}
                            className="relative h-9 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10 hover:border-[#9FFF00] disabled:opacity-50 disabled:hover:bg-transparent"
                          >
                            Próxima <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Admin Ticket Detail Drawer */}
        {selectedTicket && (
          <AdminTicketDetailDrawer
            isOpen={isDrawerOpen}
            onClose={handleDrawerClose}
            ticket={selectedTicket}
            onMessageSent={handleMessageSent}
          />
        )}
      </main>
    </div>
  )
}
