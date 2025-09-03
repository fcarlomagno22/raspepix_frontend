"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Calendar, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import { api } from "@/services/api"

interface Winner {
  id: string
  nome: string
  email: string
  cpf: string
  tipo: "instantaneo" | "sorteio"
  valor_premio: number
  status: "Pendente" | "Aprovado" | "Recusado"
  data_premiacao: string
  numero_titulo: string
  edicao: string
}



// Funções de formatação
const formatCPF = (cpf: string) => {
  if (!cpf) return "-"
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export default function PortalDoSorteadoPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Estados para o gerenciamento de sessão
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(3600) // 1 hora em segundos
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Estados para a aba de Ganhadores
  const [winners, setWinners] = useState<Winner[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [prizeTypeFilter, setPrizeTypeFilter] = useState("Todos")
  const [dateRange, setDateRange] = useState<Date[] | undefined>(undefined) // [start, end]
  const [currentPageWinners, setCurrentPageWinners] = useState(1)
  const itemsPerPageWinners = 10
  const [isApproving, setIsApproving] = useState<string | null>(null)
  const [isRejecting, setIsRejecting] = useState<string | null>(null)
  const [isLoadingWinners, setIsLoadingWinners] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados dos ganhadores
  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setIsLoadingWinners(true)
        setError(null)
        const response = await api.get('/api/ganhadores')
        
        if (!response.data || !response.data.data) {
          throw new Error('Formato de resposta inválido')
        }
        
        // Adicionar status padrão aos ganhadores
        const winnersWithStatus = response.data.data.map((winner: any) => ({
          ...winner,
          id: winner.numero_titulo, // Usando número do título como ID temporário
          status: "Pendente" as const // Status padrão
        }))
        
        setWinners(winnersWithStatus)
      } catch (error: any) {
        console.error('Erro ao buscar ganhadores:', error)
        setError(error?.message || 'Erro ao carregar os ganhadores')
        setWinners([])
      } finally {
        setIsLoadingWinners(false)
      }
    }

    fetchWinners()
  }, [])

  // Estados para o sidebar mobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Lógica de gerenciamento de sessão
  const resetSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current)
    }
    setSessionTimeRemaining(3600) // Reset para 1 hora
    setShowSessionWarning(false)
    sessionTimerRef.current = setTimeout(() => {
      setShowSessionWarning(true)
      // Iniciar contagem regressiva para logout após o aviso
      const warningTimer = setInterval(() => {
        setSessionTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(warningTimer)
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, 3540 * 1000) // Aviso 1 minuto antes de expirar (3600 - 60)
  }, [])

  const handleLogout = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current)
    }
    toast({
      title: "Sessão Expirada",
      description: "Sua sessão expirou por inatividade. Por favor, faça login novamente.",
      variant: "destructive",
    })
    router.push("/admin/login")
  }, [router, toast])

  useEffect(() => {
    resetSessionTimer()

    const activityEvents = ["mousemove", "keydown", "click", "scroll"]
    activityEvents.forEach((event) => window.addEventListener(event, resetSessionTimer))

    return () => {
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current)
      }
      activityEvents.forEach((event) => window.removeEventListener(event, resetSessionTimer))
    }
  }, [resetSessionTimer])

  // Lógica de filtragem e paginação para Ganhadores
  const filteredWinners = winners.filter((winner) => {
    const matchesSearch =
      winner.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.cpf.includes(searchTerm) ||
      winner.numero_titulo.includes(searchTerm)

    const matchesStatus = statusFilter === "Todos" || winner.status === statusFilter

    const matchesPrizeType = prizeTypeFilter === "Todos" || 
      (prizeTypeFilter === "Raspadinha" && winner.tipo === "instantaneo") ||
      (prizeTypeFilter === "Sorteio" && winner.tipo === "sorteio")

    const matchesDate = true // Implementar DateRangePicker se necessário

    return matchesSearch && matchesStatus && matchesPrizeType && matchesDate
  })

  const totalPagesWinners = Math.ceil(filteredWinners.length / itemsPerPageWinners)
  const paginatedWinners = filteredWinners.slice(
    (currentPageWinners - 1) * itemsPerPageWinners,
    currentPageWinners * itemsPerPageWinners,
  )

  const getPaginationRange = (currentPage: number, totalPages: number) => {
    const range = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i)
    }
    return range
  }

  const paginationRangeWinners = getPaginationRange(currentPageWinners, totalPagesWinners)

  // Ações para Ganhadores
  const handleApproveWinner = async (id: string) => {
    setIsApproving(id)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simula API call
    setWinners((prev) => prev.map((w) => (w.id === id ? { ...w, status: "Aprovado" } : w)))
    toast({
      title: "Ganhador Aprovado",
      description: `Ganhador ${id} aprovado com sucesso.`,
      variant: "default",
    })
    setIsApproving(null)
  }

  const handleRejectWinner = async (id: string) => {
    setIsRejecting(id)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simula API call
    setWinners((prev) => prev.map((w) => (w.id === id ? { ...w, status: "Recusado" } : w)))
    toast({
      title: "Ganhador Recusado",
      description: `Ganhador ${id} recusado.`,
      variant: "destructive",
    })
    setIsRejecting(null)
  }



  return (
    <div className="flex min-h-screen bg-[#131B24]">
      <AdminSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-64">
        <AdminHeaderMobile
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 pt-20 lg:pt-6">
          {/* Cabeçalho da Página */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Portal do Sorteado</h1>
            <p className="text-gray-400 mt-2">Gerencie os ganhadores do portal público</p>
          </div>

          {/* Lista de Ganhadores */}
          <Card className="bg-[#1A2430] border border-[#9FFF00]/20 text-white">
            <CardHeader>
              <CardTitle className="text-white">Lista de Ganhadores</CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie os ganhadores
              </CardDescription>
            </CardHeader>
            <CardContent>
                  {/* Filtros */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Buscar por nome, e-mail ou CPF..."
                        className="pl-10 bg-[#232D3F] border-[#9FFF00]/10 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px] bg-[#232D3F] border-[#9FFF00]/10 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#232D3F] border-[#9FFF00]/10 text-white">
                        <SelectItem value="Todos">Todos</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Aprovado">Aprovado</SelectItem>
                        <SelectItem value="Recusado">Recusado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={prizeTypeFilter} onValueChange={setPrizeTypeFilter}>
                      <SelectTrigger className="w-[180px] bg-[#232D3F] border-[#9FFF00]/10 text-white">
                        <SelectValue placeholder="Tipo de Prêmio" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#232D3F] border-[#9FFF00]/10 text-white">
                        <SelectItem value="Todos">Todos</SelectItem>
                        <SelectItem value="Raspadinha">Raspadinha</SelectItem>
                        <SelectItem value="Sorteio">Sorteio</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* DateRangePicker placeholder */}
                    <Button
                      variant="outline"
                      className="bg-[#232D3F] border-[#9FFF00]/10 text-white justify-start text-left font-normal w-[180px]"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Data do Prêmio
                    </Button>
                  </div>

                  {/* Tabela de Ganhadores */}
                  <div className="rounded-md border border-[#366D51] overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[#9FFF00]/20 hover:bg-transparent">
                          <TableHead className="text-gray-300 text-center">Nome do Ganhador</TableHead>

                          <TableHead className="text-gray-300 text-center">CPF</TableHead>
                          <TableHead className="text-gray-300 text-center">Tipo de Prêmio</TableHead>
                          <TableHead className="text-gray-300 text-center">Edição</TableHead>
                          <TableHead className="text-gray-300 text-center">Número do Título</TableHead>
                          <TableHead className="text-gray-300 text-center">Valor do Prêmio</TableHead>
                          <TableHead className="text-gray-300 text-center">Data do Prêmio</TableHead>
                          <TableHead className="text-gray-300 text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedWinners.length > 0 ? (
                          paginatedWinners.map((winner) => (
                            <TableRow key={winner.id} className="border-b border-[#9FFF00]/10 hover:bg-[#9FFF00]/5">
                              <TableCell className="text-white text-center">{winner.nome}</TableCell>

                              <TableCell className="text-gray-300 text-center">{formatCPF(winner.cpf)}</TableCell>
                              <TableCell className="text-gray-300 text-center">
                                {winner.tipo === 'instantaneo' ? 'Raspadinha' : 'Sorteio'}
                              </TableCell>
                              <TableCell className="text-gray-300 text-center">
                                {winner.edicao || '-'}
                              </TableCell>
                              <TableCell className="text-gray-300 text-center">
                                {winner.numero_titulo || '-'}
                              </TableCell>
                              <TableCell className="text-white font-medium text-center">
                                {formatCurrency(winner.valor_premio)}
                              </TableCell>
                              <TableCell className="text-gray-300 text-center">
                                {format(new Date(winner.data_premiacao), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-400/10"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Visualizar Detalhes</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-gray-400">
                              Nenhum ganhador encontrado.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginação */}
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                    <div>
                      Exibindo {paginatedWinners.length > 0 ? (currentPageWinners - 1) * itemsPerPageWinners + 1 : 0} a{" "}
                      {(currentPageWinners - 1) * itemsPerPageWinners + paginatedWinners.length} de{" "}
                      {filteredWinners.length} ganhadores
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPageWinners((prev) => Math.max(1, prev - 1))}
                        disabled={currentPageWinners === 1}
                        className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      {paginationRangeWinners.map((page) => (
                        <Button
                          key={page}
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageWinners(page)}
                          className={cn(
                            "border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]",
                            currentPageWinners === page &&
                              "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black hover:from-[#8AE000] hover:to-[#7AC000] shadow-[0_0_15px_rgba(159,255,0,0.4)] border-none",
                          )}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPageWinners((prev) => Math.min(totalPagesWinners, prev + 1))}
                        disabled={currentPageWinners === totalPagesWinners}
                        className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]"
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </main>
        </div>
      </div>
    )
}
