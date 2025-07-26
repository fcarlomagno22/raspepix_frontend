"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import ScratchCardStats from "@/components/admin/raspadinhas/scratch-cards-stats"
import ScratchCardsFilter from "@/components/admin/raspadinhas/scratch-cards-filter"
import ScratchCardsTable from "@/components/admin/raspadinhas/scratch-cards-table"
import ScratchCardDrawer from "@/components/admin/scratch-card-drawer"

const SESSION_TIMEOUT_SECONDS = 3 * 60 // 3 minutes
const WARNING_THRESHOLD_SECONDS = 60 // 1 minute

interface ScratchCard {
  id: string
  name: string
  maxPrize: number
  cost: number
  imageUrl: string | null
  isActive: boolean
  createdAt: string
}

export default function RaspadinhasPage() {
  const router = useRouter()
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)

  const [scratchCards, setScratchCards] = useState<ScratchCard[]>([
    {
      id: "1",
      name: "Super RaspePix",
      maxPrize: 5000, // Corrected max prize
      cost: 1, // Corrected cost
      imageUrl: "/images/scratch-cards/super-raspepix.png", // Corrected image path
      isActive: true,
      createdAt: "2023-01-15T10:00:00Z",
    },
  ])
  const [filteredCards, setFilteredCards] = useState<ScratchCard[]>(scratchCards)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<ScratchCard | null>(null)

  // Update filtered cards when scratchCards change
  useEffect(() => {
    setFilteredCards(scratchCards)
  }, [scratchCards])

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

  const handleNewScratchCard = () => {
    setEditingCard(null)
    setIsDrawerOpen(true)
  }

  const handleEditScratchCard = (card: ScratchCard) => {
    setEditingCard(card)
    setIsDrawerOpen(true)
  }

  const handleSaveScratchCard = (cardData: Omit<ScratchCard, "id" | "createdAt">, isNew: boolean) => {
    if (isNew) {
      const newCard: ScratchCard = {
        ...cardData,
        id: String(scratchCards.length + 1), // Simple ID generation
        createdAt: new Date().toISOString(),
      }
      setScratchCards((prev) => [...prev, newCard])
    } else {
      setScratchCards((prev) => prev.map((card) => (card.id === editingCard?.id ? { ...card, ...cardData } : card)))
    }
    setIsDrawerOpen(false)
  }

  const handleDeleteScratchCard = (id: string) => {
    setScratchCards((prev) => prev.filter((card) => card.id !== id))
  }

  const handleToggleStatus = (id: string, isActive: boolean) => {
    setScratchCards((prev) => prev.map((card) => (card.id === id ? { ...card, isActive: isActive } : card)))
  }

  const handleSearch = (query: string) => {
    if (query) {
      setFilteredCards(scratchCards.filter((card) => card.name.toLowerCase().includes(query.toLowerCase())))
    } else {
      setFilteredCards(scratchCards)
    }
  }

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    const sorted = [...filteredCards].sort((a, b) => {
      let valA: any, valB: any
      switch (sortBy) {
        case "name":
          valA = a.name.toLowerCase()
          valB = b.name.toLowerCase()
          break
        case "maxPrize":
          valA = a.maxPrize
          valB = b.maxPrize
          break
        case "cost":
          valA = a.cost
          valB = b.cost
          break
        case "createdAt":
          valA = new Date(a.createdAt).getTime()
          valB = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1
      if (valA > valB) return sortOrder === "asc" ? 1 : -1
      return 0
    })
    setFilteredCards(sorted)
  }

  // Calculate stats
  const activeCount = scratchCards.filter((card) => card.isActive).length
  const wonCount = 0 // Mock: Assuming no 'won' status in current mock data
  const lostCount = scratchCards.filter((card) => !card.isActive).length // Mock: Assuming inactive means lost for now

  return (
    <div className="flex min-h-screen bg-[#0D1117] text-white">
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Raspadinhas</h1>
            <p className="text-muted-foreground">Crie e gerencie suas raspadinhas com poucos cliques.</p>
          </div>
          <Button
            onClick={handleNewScratchCard}
            className="h-8 gap-1 bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black hover:from-[#8AE000] hover:to-[#7AC000]"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova Raspadinha
          </Button>
        </div>

        <ScratchCardStats activeCount={activeCount} wonCount={wonCount} lostCount={lostCount} />
        <ScratchCardsFilter onSearch={handleSearch} onSortChange={handleSortChange} />
        <ScratchCardsTable
          scratchCards={filteredCards}
          onEdit={handleEditScratchCard}
          onDelete={handleDeleteScratchCard}
          onToggleStatus={handleToggleStatus}
        />

        <ScratchCardDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSave={handleSaveScratchCard}
          editingCard={editingCard}
        />
      </main>
    </div>
  )
}
