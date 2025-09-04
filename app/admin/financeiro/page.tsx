"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionGuard } from "@/components/admin/permission-guard"
import { dashboardService, type Edicao } from "@/services/dashboard"

// Import finance components
import FinanceiroOverviewDashboard from "@/components/admin/financeiro/financeiro-overview-dashboard"
import FinanceiroPurchasesTable from "@/components/admin/financeiro/financeiro-purchases-table"
import FinanceiroNewEditionSimulator from "@/components/admin/financeiro/financeiro-new-edition-simulator"
import FinanceiroDRE from "@/components/admin/financeiro/financeiro-dre"
import FinanceiroInfluencerPayments from "@/components/admin/financeiro/financeiro-influencer-payments"

const SESSION_TIMEOUT_SECONDS = 3 * 60 // 3 minutes
const WARNING_THRESHOLD_SECONDS = 60 // 1 minute

export default function FinanceiroPage() {
  const router = useRouter()
  const [edicoes, setEdicoes] = useState<Edicao[]>([])
  const [isLoadingEdicoes, setIsLoadingEdicoes] = useState(true)
  const [selectedEdition, setSelectedEdition] = useState("")
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)

  const resetSessionTimer = () => {
    setSessionTimeRemaining(SESSION_TIMEOUT_SECONDS)
    setShowSessionWarning(false)
  }

  const handleLogout = () => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    console.log("Admin logged out due to inactivity or explicit action.")
    router.push("/admin/login")
  }

  // Carregar edições da API
  useEffect(() => {
    const loadEdicoes = async () => {
      try {
        const data = await dashboardService.getEdicoes()
        setEdicoes(data)
        if (data.length > 0) {
          setSelectedEdition(data[0].id)
        }
      } catch (error) {
        console.error('Erro ao carregar edições:', error)
      } finally {
        setIsLoadingEdicoes(false)
      }
    }

    loadEdicoes()
  }, [])

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

  const currentEditionData = edicoes.find((e) => e.id === selectedEdition)

  return (
    <PermissionGuard requiredPermission="financeiro">
      <div className="flex min-h-screen text-white">
        {/* Mobile Header */}
        <AdminHeaderMobile
          onOpenSidebar={() => {
            /* Handled by AdminSidebar's SheetTrigger */
          }}
        />

        {/* Sidebar (Desktop fixed, Mobile overlay) */}
        <AdminSidebar sessionTimeRemaining={sessionTimeRemaining} onLogout={handleLogout} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto pt-20 lg:pt-6 lg:ml-64">
        {/* Session Warning */}
        {showSessionWarning && (
          <div className="fixed top-0 left-0 right-0 bg-red-800/80 text-white text-center py-2 z-50 animate-pulse">
            Sua sessão irá expirar em {sessionTimeRemaining} segundos!
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0">Análise Financeira</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select 
              value={selectedEdition} 
              onValueChange={setSelectedEdition}
              disabled={isLoadingEdicoes}
            >
              <SelectTrigger className="w-full sm:w-[280px] bg-[#232A34] border-[#366D51] text-white">
                <SelectValue placeholder={isLoadingEdicoes ? "Carregando edições..." : "Selecione a Edição"} />
              </SelectTrigger>
              <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
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
            <div className="flex gap-2"></div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-[#366D51] bg-[#232A34] h-auto p-0 mb-6">
            <TabsTrigger
              value="overview"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#9FFF00] data-[state=active]:text-[#9FFF00] data-[state=active]:bg-transparent py-3 text-white text-center min-w-0"
            >
              Resumo Geral
            </TabsTrigger>
            <TabsTrigger
              value="influencer-payments"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#9FFF00] data-[state=active]:text-[#9FFF00] data-[state=active]:bg-transparent py-3 text-white text-center min-w-0"
            >
              Pagamentos Afiliados
            </TabsTrigger>
            <TabsTrigger
              value="simulator"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#9FFF00] data-[state=active]:text-[#9FFF00] data-[state=active]:bg-transparent py-3 text-white text-center min-w-0"
            >
              Simulador
            </TabsTrigger>
            <TabsTrigger
              value="dre"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#9FFF00] data-[state=active]:text-[#9FFF00] data-[state=active]:bg-transparent py-3 text-white text-center min-w-0"
            >
              DRE
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* KPIs */}
            <FinanceiroOverviewDashboard />
            <div className="p-4 flex-1 overflow-auto">
              <FinanceiroPurchasesTable />
            </div>
          </TabsContent>

          <TabsContent value="influencer-payments">
            <div className="p-4 flex-1 overflow-auto">
              <FinanceiroInfluencerPayments />
            </div>
          </TabsContent>

          <TabsContent value="simulator">
            {/* KPIs */}
            <FinanceiroOverviewDashboard />
            <div className="p-4 flex-1 overflow-auto">
              <FinanceiroNewEditionSimulator />
            </div>
          </TabsContent>

          <TabsContent value="dre">
            {/* KPIs */}
            <FinanceiroOverviewDashboard />
            <div className="p-4 flex-1 overflow-auto">
              <FinanceiroDRE />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </PermissionGuard>
  )
}
