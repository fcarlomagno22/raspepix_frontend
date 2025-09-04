"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import UserTable from "@/components/admin/user-table"




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

const SESSION_TIMEOUT_SECONDS = 3 * 60 // 3 minutes
const WARNING_THRESHOLD_SECONDS = 60 // 1 minute

export default function AdminClientesPage() {
  const router = useRouter()

  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)


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

        {/* Tabela de Usuários */}
        <UserTable initialUsers={mockUsers} />
      </main>
    </div>
  )
}
