"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Cookies from 'js-cookie'
import { adminAuth } from '@/services/auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import DashboardMetrics from "@/components/admin/dashboard-metrics"
import { dashboardService, type Edicao, type DashboardMetrics as DashboardMetricsType } from "@/services/dashboard"
import DailyRevenueChart from "@/components/admin/daily-revenue-chart"
import HourlySalesChart from "@/components/admin/hourly-sales-chart"

const SESSION_TIMEOUT_SECONDS = 3 * 60 // 3 minutes
const WARNING_THRESHOLD_SECONDS = 60 // 1 minute

export default function AdminDashboardPage() {
  const router = useRouter()
  const [edicoes, setEdicoes] = useState<Edicao[]>([])
  const [isLoadingEdicoes, setIsLoadingEdicoes] = useState(true)
  const [selectedEditionId, setSelectedEditionId] = useState<string>("")
  const [metrics, setMetrics] = useState<DashboardMetricsType | null>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)

  const loadMetrics = async (edicaoId: string) => {
    setIsLoadingMetrics(true)
    try {
      const data = await dashboardService.getMetricas(edicaoId)
      setMetrics(data)
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  // Verifica autenticação e carrega edições ao carregar a página
  useEffect(() => {
    console.log('useEffect executando...')
    const adminToken = adminAuth.getToken()
    console.log('Token encontrado:', !!adminToken)
    
    if (!adminToken) {
      console.log('Redirecionando para login...')
      router.replace('/admin/login')
      return
    }

    const loadEdicoes = async () => {
      console.log('Iniciando carregamento das edições...')
      try {
        const data = await dashboardService.getEdicoes()
        console.log('Edições carregadas com sucesso:', data)
        setEdicoes(data)
        if (data.length > 0) {
          setSelectedEditionId(data[0].id)
        }
      } catch (error) {
        console.error('Erro ao carregar edições:', error)
      } finally {
        setIsLoadingEdicoes(false)
      }
    }

    loadEdicoes()
  }, [router])

  useEffect(() => {
    if (selectedEditionId) {
      loadMetrics(selectedEditionId)
    }
  }, [selectedEditionId])
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const resetSessionTimer = () => {
    setSessionTimeRemaining(SESSION_TIMEOUT_SECONDS)
    setShowSessionWarning(false)
  }

  const handleLogout = async () => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    if (activityTimerRef.current) clearInterval(activityTimerRef.current)
    
    try {
      await adminAuth.logout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Mesmo com erro, redireciona para login
      router.replace('/admin/login')
    }
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
    edicoes.find((e) => e.id === selectedEditionId)?.nome || "Carregando..."

  return (
    <div className="flex min-h-screen text-white">
      {/* Mobile Header */}
      <AdminHeaderMobile onLogout={handleLogout} />

      {/* Sidebar (Desktop fixed) */}
      <AdminSidebar onLogout={handleLogout} />

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
              <Select 
                value={selectedEditionId} 
                onValueChange={setSelectedEditionId}
                disabled={isLoadingEdicoes}
              >
                <SelectTrigger className="w-[320px] bg-[#1A2430] border-[#9FFF00]/20 text-white h-12">
                  <SelectValue placeholder={isLoadingEdicoes ? "Carregando edições..." : "Selecionar Edição"} />
                </SelectTrigger>
                <SelectContent className="bg-[#1A2430] text-white border-[#9FFF00]/20">
                  {edicoes.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {isLoadingEdicoes ? "Carregando..." : "Nenhuma edição encontrada"}
                    </SelectItem>
                  ) : (
                    edicoes.map((edicao) => {
                      const dataInicio = new Date(edicao.data_inicio).toLocaleDateString('pt-BR')
                      const dataFim = new Date(edicao.data_fim).toLocaleDateString('pt-BR')
                      return (
                        <SelectItem key={edicao.id} value={edicao.id}>
                          {`${edicao.nome} (${dataInicio} até ${dataFim})`}
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
        {/* Metrics Section */}
        {metrics && (
          <>
            <DashboardMetrics
              totalRevenue={metrics.receita_total}
              totalPrizeValue={metrics.premio_total_distribuido}
              prizesRemaining={metrics.premios_a_distribuir}
              weeklyParticipants={metrics.total_participantes}
              soldTickets={metrics.titulos_vendidos}
            />
            <div className="my-8"></div> {/* Espaçamento */}
            {/* Gráficos de Receita e Vendas por Horário */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DailyRevenueChart 
                data={metrics.receita_diaria.map(item => ({
                  day: new Date(item.data).toLocaleDateString('pt-BR', { weekday: 'short' }),
                  revenue: item.receita
                }))} 
              />
              <HourlySalesChart 
                data={metrics.vendas_por_horario.map(item => ({
                  time: `${item.hora.toString().padStart(2, '0')}h`,
                  averageSales: item.quantidade
                }))}
              />
            </section>
          </>
        )}


      </main>
    </div>
  )
}
