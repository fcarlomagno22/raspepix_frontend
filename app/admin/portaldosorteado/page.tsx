"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Search, Calendar, Eye, Check, X, ChevronLeft, ChevronRight, Save, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"

// Interfaces para os dados mockados
interface Winner {
  id: string
  name: string
  email: string
  cpf: string
  prizeType: "Raspadinha" | "Sorteio"
  prizeValue: number
  status: "Pendente" | "Aprovado" | "Recusado"
  prizeDate: string
}

interface PortalSettings {
  title: string
  url: string
  welcomeMessage: string
  contactEmail: string
  contactPhone: string
  isActive: boolean
}

// Dados mockados
const mockWinners: Winner[] = [
  {
    id: "1",
    name: "Ana Paula Silva",
    email: "ana.paula@email.com",
    cpf: "123.456.789-00",
    prizeType: "Raspadinha",
    prizeValue: 50.0,
    status: "Aprovado",
    prizeDate: "2024-06-10T14:30:00Z",
  },
  {
    id: "2",
    name: "Carlos Eduardo Lima",
    email: "carlos.lima@email.com",
    cpf: "987.654.321-00",
    prizeType: "Sorteio",
    prizeValue: 5000.0,
    status: "Pendente",
    prizeDate: "2024-06-12T10:00:00Z",
  },
  {
    id: "3",
    name: "Mariana Costa",
    email: "mariana.costa@email.com",
    cpf: "111.222.333-44",
    prizeType: "Raspadinha",
    prizeValue: 150.0,
    status: "Recusado",
    prizeDate: "2024-06-08T18:00:00Z",
  },
  {
    id: "4",
    name: "Pedro Henrique Souza",
    email: "pedro.souza@email.com",
    cpf: "555.666.777-88",
    prizeType: "Sorteio",
    prizeValue: 1000.0,
    status: "Aprovado",
    prizeDate: "2024-06-05T09:00:00Z",
  },
  {
    id: "5",
    name: "Juliana Almeida",
    email: "juliana.almeida@email.com",
    cpf: "999.888.777-66",
    prizeType: "Raspadinha",
    prizeValue: 25.0,
    status: "Pendente",
    prizeDate: "2024-06-13T11:45:00Z",
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: (i + 6).toString(),
    name: `Ganhador Teste ${i + 1}`,
    email: `teste${i + 1}@email.com`,
    cpf: `000.000.000-${String(i + 1).padStart(2, "0")}`,
    prizeType: i % 2 === 0 ? "Raspadinha" : ("Sorteio" as "Raspadinha" | "Sorteio"),
    prizeValue: [25, 50, 150, 500, 1000, 5000][i % 6],
    status: ["Pendente", "Aprovado", "Recusado"][i % 3] as "Pendente" | "Aprovado" | "Recusado",
    prizeDate: new Date(2024, 5, 1 + (i % 15), 9 + i, 0).toISOString(),
  })),
]

const mockSettings: PortalSettings = {
  title: "Portal Oficial de Ganhadores RaspePix",
  url: "ganhadores.raspepix.com.br",
  welcomeMessage:
    "Parabéns a todos os nossos sortudos ganhadores! Aqui você pode acompanhar os resultados e solicitar seus prêmios.",
  contactEmail: "suporte@raspepix.com.br",
  contactPhone: "(11) 98765-4321",
  isActive: true,
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
  const [winners, setWinners] = useState<Winner[]>(mockWinners)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [prizeTypeFilter, setPrizeTypeFilter] = useState("Todos")
  const [dateRange, setDateRange] = useState<Date[] | undefined>(undefined) // [start, end]
  const [currentPageWinners, setCurrentPageWinners] = useState(1)
  const itemsPerPageWinners = 10
  const [isApproving, setIsApproving] = useState<string | null>(null)
  const [isRejecting, setIsRejecting] = useState<string | null>(null)

  // Estados para a aba de Configurações
  const [portalSettings, setPortalSettings] = useState<PortalSettings>(mockSettings)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

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
      winner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.cpf.includes(searchTerm)

    const matchesStatus = statusFilter === "Todos" || winner.status === statusFilter

    const matchesPrizeType = prizeTypeFilter === "Todos" || winner.prizeType === prizeTypeFilter

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
      variant: "success",
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

  // Ações para Configurações
  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simula API call
    toast({
      title: "Configurações Salvas",
      description: "As configurações do portal foram salvas com sucesso.",
      variant: "success",
    })
    setIsSavingSettings(false)
  }

  return (
    <div className="flex min-h-screen bg-[#131B24]">
      <AdminSidebar sessionTimeRemaining={sessionTimeRemaining} onLogout={handleLogout} />
      <div className="flex flex-1 flex-col lg:ml-64">
        <AdminHeaderMobile
          sessionTimeRemaining={sessionTimeRemaining}
          onLogout={handleLogout}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />
        <main className="flex-1 p-4 md:p-6 pt-20 lg:pt-6">
          {/* Cabeçalho da Página */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Portal do Sorteado</h1>
            <p className="text-gray-400 mt-2">Gerencie os ganhadores e as configurações do portal público</p>
          </div>

          {/* Sistema de Abas */}
          <Tabs defaultValue="winners" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1A2430] border border-[#9FFF00]/20">
              <TabsTrigger
                value="winners"
                className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black text-gray-300"
              >
                Ganhadores
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black text-gray-300"
              >
                Configurações
              </TabsTrigger>
            </TabsList>

            {/* Aba 1: Ganhadores */}
            <TabsContent value="winners" className="mt-6">
              <Card className="bg-[#1A2430] border border-[#9FFF00]/20 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Lista de Ganhadores</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerencie os ganhadores dos sorteios e raspadinhas
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
                          <TableHead className="text-gray-300">Nome do Ganhador</TableHead>
                          <TableHead className="text-gray-300">E-mail</TableHead>
                          <TableHead className="text-gray-300">CPF</TableHead>
                          <TableHead className="text-gray-300">Tipo de Prêmio</TableHead>
                          <TableHead className="text-gray-300">Valor do Prêmio</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Data do Prêmio</TableHead>
                          <TableHead className="text-gray-300 text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedWinners.length > 0 ? (
                          paginatedWinners.map((winner) => (
                            <TableRow key={winner.id} className="border-b border-[#9FFF00]/10 hover:bg-[#9FFF00]/5">
                              <TableCell className="text-white">{winner.name}</TableCell>
                              <TableCell className="text-gray-300">{winner.email}</TableCell>
                              <TableCell className="text-gray-300">{formatCPF(winner.cpf)}</TableCell>
                              <TableCell className="text-gray-300">{winner.prizeType}</TableCell>
                              <TableCell className="text-white font-medium">
                                {formatCurrency(winner.prizeValue)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "min-w-[80px] justify-center shadow-md",
                                    winner.status === "Pendente" &&
                                      "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
                                    winner.status === "Aprovado" &&
                                      "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black",
                                    winner.status === "Recusado" &&
                                      "bg-gradient-to-r from-red-500 to-red-600 text-white",
                                  )}
                                >
                                  {winner.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {format(new Date(winner.prizeDate), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-400/10"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Visualizar</span>
                                  </Button>
                                  {winner.status === "Pendente" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-green-400 hover:bg-green-400/10"
                                        onClick={() => handleApproveWinner(winner.id)}
                                        disabled={isApproving === winner.id}
                                      >
                                        {isApproving === winner.id ? (
                                          <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Check className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">Aprovar</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-400 hover:bg-red-400/10"
                                        onClick={() => handleRejectWinner(winner.id)}
                                        disabled={isRejecting === winner.id}
                                      >
                                        {isRejecting === winner.id ? (
                                          <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <X className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">Recusar</span>
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-gray-400">
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
            </TabsContent>

            {/* Aba 2: Configurações */}
            <TabsContent value="settings" className="mt-6">
              <Card className="bg-[#1A2430] border border-[#9FFF00]/20 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Configurações do Portal Público</CardTitle>
                  <CardDescription className="text-gray-400">
                    Defina as informações e o comportamento do portal de ganhadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="portal-title" className="text-gray-300">
                        Título do Portal
                      </Label>
                      <Input
                        id="portal-title"
                        placeholder="Ex: Ganhadores RaspePix"
                        className="bg-[#232D3F] border-[#9FFF00]/10 text-white mt-1"
                        value={portalSettings.title}
                        onChange={(e) => setPortalSettings({ ...portalSettings, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="portal-url" className="text-gray-300">
                        URL do Portal
                      </Label>
                      <Input
                        id="portal-url"
                        placeholder="Ex: ganhadores.raspepix.com.br"
                        className="bg-[#232D3F] border-[#9FFF00]/10 text-white mt-1"
                        value={portalSettings.url}
                        onChange={(e) => setPortalSettings({ ...portalSettings, url: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email" className="text-gray-300">
                        E-mail de Contato
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="Ex: contato@raspepix.com.br"
                        className="bg-[#232D3F] border-[#9FFF00]/10 text-white mt-1"
                        value={portalSettings.contactEmail}
                        onChange={(e) => setPortalSettings({ ...portalSettings, contactEmail: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone" className="text-gray-300">
                        Telefone de Contato
                      </Label>
                      <Input
                        id="contact-phone"
                        placeholder="Ex: (XX) XXXX-XXXX"
                        className="bg-[#232D3F] border-[#9FFF00]/10 text-white mt-1"
                        value={portalSettings.contactPhone}
                        onChange={(e) => setPortalSettings({ ...portalSettings, contactPhone: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="welcome-message" className="text-gray-300">
                        Mensagem de Boas-Vindas
                      </Label>
                      <Textarea
                        id="welcome-message"
                        placeholder="Ex: Parabéns aos nossos ganhadores!"
                        className="bg-[#232D3F] border-[#9FFF00]/10 text-white min-h-[120px] mt-1"
                        value={portalSettings.welcomeMessage}
                        onChange={(e) => setPortalSettings({ ...portalSettings, welcomeMessage: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2 md:col-span-2">
                      <Switch
                        id="activate-portal"
                        checked={portalSettings.isActive}
                        onCheckedChange={(checked) => setPortalSettings({ ...portalSettings, isActive: checked })}
                        className="data-[state=checked]:bg-[#9FFF00]"
                      />
                      <Label htmlFor="activate-portal" className="text-gray-300">
                        Ativar Portal
                      </Label>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <Button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="bg-[#9FFF00] text-black hover:bg-[#8FEF00] transition-colors"
                      >
                        {isSavingSettings ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Salvar Configurações
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
