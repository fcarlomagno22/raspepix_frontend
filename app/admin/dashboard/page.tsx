"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import DashboardMetrics from "@/components/admin/dashboard-metrics"
import DashboardActivity from "@/components/admin/dashboard-activity"
import DashboardPrizeGoal from "@/components/admin/dashboard-prize-goal"
import DailyRevenueChart from "@/components/admin/daily-revenue-chart" // Importar o novo componente
import HourlySalesChart from "@/components/admin/hourly-sales-chart"

// Mock Data
const mockEditions = [
  { id: "1", name: "Edição #1 – 01/01 até 07/01", period: "01/01/2024 - 07/01/2024" },
  { id: "2", name: "Edição #2 – 08/01 até 14/01", period: "08/01/2024 - 14/01/2024" },
  { id: "3", name: "Edição #3 – 15/01 até 21/01", period: "15/01/2024 - 21/01/2024" },
  { id: "4", name: "Edição #4 – 22/01 até 28/01", period: "22/01/2024 - 28/01/2024" },
  { id: "5", name: "Edição #5 – 29/01 até 04/02", period: "29/01/2024 - 04/02/2024", current: true },
]

const mockMetrics = {
  totalRevenue: 125000,
  totalPrizeValue: 87500,
  prizesRemaining: 12500, // Changed from 750 to a currency value
  weeklyParticipants: 3200,
  tokensGenerated: 25000,
  tokensUsed: 18500,
  scratchCardsPlayed: 18500,
  prizesDelivered: 1250,
  prizesRemainingCount: 750, // Count for activity section
  hourlySalesData: [
    { time: "00h-03h", averageSales: 1500 },
    { time: "03h-06h", averageSales: 1000 },
    { time: "06h-09h", averageSales: 2500 },
    { time: "09h-12h", averageSales: 4000 },
    { time: "12h-15h", averageSales: 5500 },
    { time: "15h-18h", averageSales: 7000 },
    { time: "18h-21h", averageSales: 8500 },
    { time: "21h-00h", averageSales: 6000 },
  ],
}

// Mock data for daily revenue chart
const mockDailyRevenueData = [
  { day: "Seg", revenue: 4000 },
  { day: "Ter", revenue: 3000 },
  { day: "Qua", revenue: 5000 },
  { day: "Qui", revenue: 4500 },
  { day: "Sex", revenue: 6000 },
  { day: "Sáb", revenue: 7500 },
  { day: "Dom", revenue: 5500 },
]

const SESSION_TIMEOUT_SECONDS = 3 * 60 // 3 minutes
const WARNING_THRESHOLD_SECONDS = 60 // 1 minute

export default function AdminDashboardPage() {
  const router = useRouter()

  // Verifica autenticação ao carregar a página
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      router.replace('/admin/login')
      return
    }
  }, [router])

  const [selectedEditionId, setSelectedEditionId] = useState(
    mockEditions.find((e) => e.current)?.id || mockEditions[0].id,
  )
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const resetSessionTimer = () => {
    setSessionTimeRemaining(SESSION_TIMEOUT_SECONDS)
    setShowSessionWarning(false)
  }

  const handleLogout = () => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    if (activityTimerRef.current) clearInterval(activityTimerRef.current)
    // Simulate API logout
    console.log("Admin logged out due to inactivity or explicit action.")
    router.push("/") // Changed from "/admin/login" to "/"
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

  // Mobile sidebar control
  const handleOpenMobileSidebar = () => {
    setIsMobileSidebarOpen(true)
  }

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
          <h1 className="text-4xl font-bold">Dashboard Admin</h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-lg text-gray-400">Resumo geral por edição</p>
            <div className="flex items-center gap-3">
              <Badge className="bg-[#9FFF00] text-black font-semibold px-3 py-1 rounded-full">
                Edição Atual: {currentEdition}
              </Badge>
              <Select value={selectedEditionId} onValueChange={setSelectedEditionId}>
                <SelectTrigger className="w-[320px] bg-[#1A2430] border-[#9FFF00]/20 text-white h-12">
                  <SelectValue placeholder="Selecionar Edição" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A2430] text-white border-[#9FFF00]/20">
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
        {/* Metrics Section */}
        <DashboardMetrics
          totalRevenue={mockMetrics.totalRevenue}
          totalPrizeValue={mockMetrics.totalPrizeValue}
          prizesRemaining={mockMetrics.prizesRemaining}
          weeklyParticipants={mockMetrics.weeklyParticipants}
        />
        <div className="my-8"></div> {/* Espaçamento */}
        {/* Gráficos de Receita e Vendas por Horário */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DailyRevenueChart data={mockDailyRevenueData} />
          <HourlySalesChart data={mockMetrics.hourlySalesData} />
        </section>
        <div className="my-8"></div> {/* Espaçamento */}
        {/* Activity Section */}
        <DashboardActivity
          tokensGenerated={mockMetrics.tokensGenerated}
          tokensUsed={mockMetrics.tokensUsed}
          scratchCardsPlayed={mockMetrics.scratchCardsPlayed}
          prizesDelivered={mockMetrics.prizesDelivered}
          prizesRemainingCount={mockMetrics.prizesRemainingCount}
        />
        <div className="my-8"></div> {/* Espaçamento */}
        {/* Prize Goal Section */}
        <DashboardPrizeGoal totalRevenue={mockMetrics.totalRevenue} />
      </main>
    </div>
  )
}
