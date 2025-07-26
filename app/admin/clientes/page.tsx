"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import OverviewKPIs from "@/components/admin/overview-kpis"
import UserTable from "@/components/admin/user-table"
import NewUsersChart from "@/components/admin/new-users-chart"
import HourlyRegistrationsChart from "@/components/admin/hourly-registrations-chart"
import UserDemographics from "@/components/admin/clientes/user-demographics"
import GeographicDistribution from "@/components/admin/clientes/geographic-distribution"
import TopCitiesTable from "@/components/admin/clientes/top-cities-table"

// Mock Data para Edições (igual ao dashboard)
const mockEditions = [
  { id: "1", name: "Edição #1 – 01/01 até 07/01", period: "01/01/2024 - 07/01/2024" },
  { id: "2", name: "Edição #2 – 08/01 até 14/01", period: "08/01/2024 - 14/01/2024" },
  { id: "3", name: "Edição #3 – 15/01 até 21/01", period: "15/01/2024 - 21/01/2024" },
  { id: "4", name: "Edição #4 – 22/01 até 28/01", period: "22/01/2024 - 28/01/2024" },
  { id: "5", name: "Edição #5 – 29/01 até 04/02", period: "29/01/2024 - 04/02/2024", current: true },
]

const mockKPIs = {
  totalUsers: 15420,
  newUsers: 1250,
  activeUsers: 8900,
  totalTokensGenerated: 125000,
  totalTokensUsed: 98500,
  activeTokensPercentage: 68.5,
  averageTicket: 45.8,
  prizeWinnersPercentage: 12.3,
  totalPrizesDistributed: 87500.0,
  withdrawalPercentage: 34.7,
}

const mockUsers = [
  {
    id: "1",
    nome_completo: "João Silva Santos",
    email: "joao.silva@email.com",
    cpf: "123.456.789-00",
    created_at: "2024-01-15T10:30:00Z",
    total_deposited: 250.0,
    total_lucky_numbers: 25,
    total_prizes_received: 150.0,
    saldo_sacavel: 75.5,
    last_active_edition: "12/06/2025 - 19/06/2025",
    is_active: true,
    is_influencer: false,
  },
  {
    id: "2",
    nome_completo: "Maria Oliveira",
    email: "maria.o@email.com",
    cpf: "987.654.321-00",
    created_at: "2024-02-20T14:00:00Z",
    total_deposited: 500.0,
    total_lucky_numbers: 50,
    total_prizes_received: 300.0,
    saldo_sacavel: 150.0,
    last_active_edition: "05/06/2025 - 12/06/2025",
    is_active: true,
    is_influencer: true,
  },
  {
    id: "3",
    nome_completo: "Pedro Costa",
    email: "pedro.c@email.com",
    cpf: "111.222.333-44",
    created_at: "2024-03-01T09:00:00Z",
    total_deposited: 100.0,
    total_lucky_numbers: 10,
    total_prizes_received: 0.0,
    saldo_sacavel: 0.0,
    last_active_edition: "12/06/2025 - 19/06/2025",
    is_active: false,
    is_influencer: false,
  },
  {
    id: "4",
    nome_completo: "Ana Pereira",
    email: "ana.p@email.com",
    cpf: "555.444.333-22",
    created_at: "2024-04-10T11:00:00Z",
    total_deposited: 750.0,
    total_lucky_numbers: 75,
    total_prizes_received: 500.0,
    saldo_sacavel: 250.0,
    last_active_edition: "29/05/2025 - 05/06/2025",
    is_active: true,
    is_influencer: false,
  },
  {
    id: "5",
    nome_completo: "Lucas Fernandes",
    email: "lucas.f@email.com",
    cpf: "999.888.777-66",
    created_at: "2024-05-05T16:00:00Z",
    total_deposited: 300.0,
    total_lucky_numbers: 30,
    total_prizes_received: 50.0,
    saldo_sacavel: 20.0,
    last_active_edition: "12/06/2025 - 19/06/2025",
    is_active: true,
    is_influencer: false,
  },
  {
    id: "6",
    nome_completo: "Mariana Rocha",
    email: "mariana.r@email.com",
    cpf: "123.123.123-12",
    created_at: "2024-01-20T08:00:00Z",
    total_deposited: 120.0,
    total_lucky_numbers: 12,
    total_prizes_received: 0.0,
    saldo_sacavel: 0.0,
    last_active_edition: "05/06/2025 - 12/06/2025",
    is_active: true,
    is_influencer: false,
  },
  {
    id: "7",
    nome_completo: "Gabriel Lima",
    email: "gabriel.l@email.com",
    cpf: "456.456.456-45",
    created_at: "2024-02-01T10:00:00Z",
    total_deposited: 80.0,
    total_lucky_numbers: 8,
    total_prizes_received: 10.0,
    saldo_sacavel: 5.0,
    last_active_edition: "29/05/2025 - 05/06/2025",
    is_active: true,
    is_influencer: false,
  },
  {
    id: "8",
    nome_completo: "Isabela Santos",
    email: "isabela.s@email.com",
    cpf: "789.789.789-78",
    created_at: "2024-03-10T15:00:00Z",
    total_deposited: 600.0,
    total_lucky_numbers: 60,
    total_prizes_received: 400.0,
    saldo_sacavel: 200.0,
    last_active_edition: "12/06/2025 - 19/06/2025",
    is_active: true,
    is_influencer: true,
  },
  {
    id: "9",
    nome_completo: "Rafael Almeida",
    email: "rafael.a@email.com",
    cpf: "321.321.321-32",
    created_at: "2024-04-22T13:00:00Z",
    total_deposited: 180.0,
    total_lucky_numbers: 18,
    total_prizes_received: 0.0,
    saldo_sacavel: 0.0,
    last_active_edition: "05/06/2025 - 12/06/2025",
    is_active: false,
    is_influencer: false,
  },
  {
    id: "10",
    nome_completo: "Sofia Martins",
    email: "sofia.m@email.com",
    cpf: "654.654.654-65",
    created_at: "2024-05-18T09:00:00Z",
    total_deposited: 400.0,
    total_lucky_numbers: 40,
    total_prizes_received: 80.0,
    saldo_sacavel: 40.0,
    last_active_edition: "12/06/2025 - 19/06/2025",
    is_active: true,
    is_influencer: false,
  },
]

// Mock data para os gráficos
const mockNewUsersData = [
  { date: "Jan", newUsers: 120 },
  { date: "Fev", newUsers: 150 },
  { date: "Mar", newUsers: 180 },
  { date: "Abr", newUsers: 200 },
  { date: "Mai", newUsers: 250 },
  { date: "Jun", newUsers: 300 },
]

const mockHourlyRegistrationsData = [
  { time: "00h-03h", registrations: 80 },
  { time: "03h-06h", registrations: 50 },
  { time: "06h-09h", registrations: 120 },
  { time: "09h-12h", registrations: 250 },
  { time: "12h-15h", registrations: 350 },
  { time: "15h-18h", registrations: 400 },
  { time: "18h-21h", registrations: 300 },
  { time: "21h-00h", registrations: 200 },
]

const SESSION_TIMEOUT_SECONDS = 3 * 60 // 3 minutes
const WARNING_THRESHOLD_SECONDS = 60 // 1 minute

export default function AdminClientesPage() {
  const router = useRouter()
  const [selectedEditionId, setSelectedEditionId] = useState(
    mockEditions.find((e) => e.current)?.id || mockEditions[0].id,
  )
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "profile">("overview")
  const [selectedStateUF, setSelectedStateUF] = useState<string | null>(null)

  const resetSessionTimer = () => {
    setSessionTimeRemaining(SESSION_TIMEOUT_SECONDS)
    setShowSessionWarning(false)
  }

  const handleLogout = () => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    // Simulate API logout
    console.log("Admin logged out due to inactivity or explicit action.")
    router.push("/admin/login")
  }

  // Session Timer Effect
  useEffect(() => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)

    sessionTimerRef.current = setInterval(() => {
      setSessionTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          handleLogout()
          return 0
        }
        if (prevTime <= WARNING_THRESHOLD_SECONDS) {
          setShowSessionWarning(true)
        }
        return prevTime - 1
      })
    }, 1000)

    // Activity listeners to reset timer
    const activityEvents = ["mousemove", "keydown", "scroll", "touchstart"]
    activityEvents.forEach((event) => window.addEventListener(event, resetSessionTimer))

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
      activityEvents.forEach((event) => window.removeEventListener(event, resetSessionTimer))
    }
  }, [])

  const currentEdition =
    mockEditions.find((e) => e.current)?.name.split(" – ")[0] || mockEditions[0].name.split(" – ")[0]

  return (
    <div className="flex min-h-screen bg-[#0D1117] text-white">
      {/* Mobile Header */}
      <AdminHeaderMobile onOpenSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* Sidebar (Desktop fixed, Mobile overlay) */}
      <AdminSidebar sessionTimeRemaining={sessionTimeRemaining} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto pt-20 lg:pt-6 lg:ml-64">
        {/* Session Warning */}
        {showSessionWarning && (
          <div className="fixed top-0 left-0 right-0 bg-red-800/80 text-white text-center py-2 z-50 animate-pulse">
            Sua sessão irá expirar em {sessionTimeRemaining} segundos!
          </div>
        )}
        {/* Dashboard Header */}
        <section className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold">Gestão de Clientes</h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-lg text-gray-400">Visão geral e gerenciamento de usuários</p>
            {/* Seletor de Edição (Estilo atualizado) */}
            <div className="flex items-center gap-3">
              <Badge className="bg-[#9FFF00] text-black font-semibold px-3 py-1 rounded-full">
                Edição Atual: {currentEdition}
              </Badge>
              <Select value={selectedEditionId} onValueChange={setSelectedEditionId}>
                <SelectTrigger className="w-[320px] bg-[#232D3F] border-[#9FFF00]/10 text-white h-12">
                  <SelectValue placeholder="Selecionar Edição" />
                </SelectTrigger>
                <SelectContent className="bg-[#232D3F] border-[#9FFF00]/10 text-white">
                  {mockEditions.map((edition) => (
                    <SelectItem key={edition.id} value={edition.id}>
                      {edition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Sistema de Abas (Estilo atualizado) */}
        <Tabs
          defaultValue="overview"
          className="w-full"
          onValueChange={(value: "overview" | "users" | "profile") => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-3 bg-[#1A2430] border border-[#9FFF00]/20">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black text-gray-300"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black text-gray-300"
            >
              Usuários
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black text-gray-300"
            >
              Perfil dos Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewKPIs {...mockKPIs} />
            <div className="my-8"></div> {/* Espaçamento */}
            {/* Gráficos de Clientes */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <NewUsersChart data={mockNewUsersData} />
              <HourlyRegistrationsChart data={mockHourlyRegistrationsData} />
            </section>
          </TabsContent>

          <TabsContent value="users">
            <UserTable users={mockUsers} />
          </TabsContent>

          {/* Conteúdo da Aba "Perfil dos Usuários" */}
          <TabsContent value="profile" className="space-y-8">
            <UserDemographics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GeographicDistribution onSelectState={setSelectedStateUF} selectedStateUF={selectedStateUF} />
              <TopCitiesTable selectedStateUF={selectedStateUF} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
