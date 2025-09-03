"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionGuard } from "@/components/admin/permission-guard"

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
  const [selectedEdition, setSelectedEdition] = useState("edition-5")
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

  const editions = [
    { id: "edition-5", name: "Edição #5 – 29/01 até 04/02", startDate: "29/01", endDate: "04/02" },
    { id: "edition-4", name: "Edição #4 – 22/01 até 28/01", startDate: "22/01", endDate: "28/01" },
    { id: "edition-3", name: "Edição #3 – 15/01 até 21/01", startDate: "15/01", endDate: "21/01" },
    { id: "edition-2", name: "Edição #2 – 08/01 até 14/01", startDate: "08/01", endDate: "14/01" },
    { id: "edition-1", name: "Edição #1 – 01/01 até 07/01", startDate: "01/01", endDate: "07/01" },
  ]

  const currentEditionData = editions.find((e) => e.id === selectedEdition) || editions[0]

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
            <Select value={selectedEdition} onValueChange={setSelectedEdition}>
              <SelectTrigger className="w-full sm:w-[280px] bg-[#232A34] border-[#366D51] text-white">
                <SelectValue placeholder="Selecione a Edição" />
              </SelectTrigger>
              <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
                {editions.map((edition) => (
                  <SelectItem key={edition.id} value={edition.id}>
                    {edition.name}
                  </SelectItem>
                ))}
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
              Pagamentos Influencers
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
