"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import OverviewKPIs from "@/components/admin/overview-kpis"
import UserTable from "@/components/admin/user-table"
import NewUsersChart from "@/components/admin/new-users-chart"
import HourlyRegistrationsChart from "@/components/admin/hourly-registrations-chart"




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
    full_name: "João Silva Santos",
    idade: 35,
    email: "joao.silva@email.com",
    cpf: "123.456.789-00",
    phone: "11999999999",
    gender: "masculino",
    birth_date: "1989-01-15",
    state_uf: "SP",
    city: "São Paulo",
    is_active: true,
    is_influencer: false,
  },
  {
    id: "2",
    full_name: "Maria Oliveira",
    idade: 28,
    email: "maria.o@email.com",
    cpf: "987.654.321-00",
    phone: "11988888888",
    gender: "feminino",
    birth_date: "1996-02-20",
    state_uf: "RJ",
    city: "Rio de Janeiro",
    is_active: true,
    is_influencer: false,
  },
  {
    id: "3",
    full_name: "Pedro Costa",
    idade: 42,
    email: "pedro.c@email.com",
    cpf: "111.222.333-44",
    phone: "11977777777",
    gender: "masculino",
    birth_date: "1982-03-01",
    state_uf: "MG",
    city: "Belo Horizonte",
    is_active: false,
    is_influencer: false,
  }
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

  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview")


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



  return (
    <div className="flex min-h-screen text-white">
      {/* Mobile Header */}
      <AdminHeaderMobile onOpenSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* Sidebar (Desktop fixed, Mobile overlay) */}
      <AdminSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

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

          </div>
        </section>

        {/* Sistema de Abas (Estilo atualizado) */}
        <Tabs
          defaultValue="overview"
          className="w-full"
          onValueChange={(value: string) => setActiveTab(value as "overview" | "users")}
        >
          <TabsList className="grid w-full grid-cols-2 bg-[#1A2430] border border-[#9FFF00]/20">
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
            <UserTable initialUsers={mockUsers} />
          </TabsContent>


        </Tabs>
      </main>
    </div>
  )
}
