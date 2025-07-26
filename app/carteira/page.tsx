"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, ChevronDown, Filter } from "lucide-react"
import { useProfile, ProfileProvider } from "@/contexts/profile-context"
import { useToast } from "@/hooks/use-toast"
// REMOVED: import NavigationBar from "@/components/navigation-bar"
import AuthenticatedLayout from "@/components/authenticated-layout"
import TransactionHistory from "@/components/transaction-history"
import BalancesSection from "@/components/balances-section"
// REMOVED: import Header from "@/components/header"

// Componente principal da página da carteira
function WalletPageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { profile, loading } = useProfile()

  // Atualizado para incluir apenas 'all', 'withdraw', 'purchase'
  const [selectedFilter, setSelectedFilter] = useState<"all" | "purchase" | "prize">("all")
  const [filterLabel, setFilterLabel] = useState("Todas")

  useEffect(() => {
    switch (selectedFilter) {
      case "all":
        setFilterLabel("Todas")
        break
      case "purchase":
        setFilterLabel("Compras")
        break
      case "prize": // Add this case
        setFilterLabel("Prêmios")
        break
    }
  }, [selectedFilter])

  const handleLogout = () => {
    sessionStorage.clear()
    localStorage.clear()
    toast({
      title: "Desconectado",
      description: "Você foi desconectado com sucesso.",
      variant: "default",
    })
    router.push("/login")
  }

  // These functions will navigate to the home page where the modals are handled
  const handleOpenDepositModal = () => {
    router.push("/home?modal=deposit")
  }

  const handleOpenTransferModal = () => {
    router.push("/home?modal=transfer")
  }

  const handleWithdrawSuccess = (amount: number) => {
    toast({
      title: "Saque Realizado",
      description: `Você sacou ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)} com sucesso.`,
      variant: "default",
    })
    // In a real app, you'd likely refetch profile data here to update balances
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#191F26] items-center justify-center text-white">
        <p>Carregando carteira...</p>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      {/* Removed the direct <Header /> and <NavigationBar /> components here */}
      <main className="flex-1 pb-32 md:pb-40 px-3 md:px-4 lg:px-8 max-w-full md:max-w-6xl mx-auto w-full">
        {/* Seção de Saldos Replicada */}
        <BalancesSection
          saldoParaJogar={50} // Hardcoded to 50 fichas
          saldoSacavel={500} // Hardcoded to R$ 500,00
          onOpenDepositModal={handleOpenDepositModal}
          onOpenTransferModal={handleOpenTransferModal}
          onWithdrawSuccess={handleWithdrawSuccess}
          className="mt-4 md:mt-6" // Apply the margin-top here
        />

        {/* Histórico de Transações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#1E2530] rounded-lg md:rounded-xl p-4 border border-gray-800 mt-6" // Added mt-6 for spacing from BalancesSection
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#9FFF00]" />
              <h2 className="text-white text-base font-bold">Histórico de Transações</h2>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#191F26] border border-gray-800 text-sm text-gray-300 hover:bg-[#191F26]/80"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {filterLabel}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-[#1E2530] border border-gray-800 text-white">
                <DropdownMenuItem
                  onClick={() => setSelectedFilter("all")}
                  className="hover:bg-[#191F26] cursor-pointer"
                >
                  Todas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedFilter("purchase")}
                  className="hover:bg-[#191F26] cursor-pointer"
                >
                  Compras
                </DropdownMenuItem>
                <DropdownMenuItem // Add this DropdownMenuItem for "Prêmios"
                  onClick={() => setSelectedFilter("prize")}
                  className="hover:bg-[#191F26] cursor-pointer"
                >
                  Prêmios
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Componente de Histórico de Transações */}
          {profile && (
            <TransactionHistory type={selectedFilter} userId={profile.id} itemsPerPage={5} showLuckyNumbers={true} />
          )}
        </motion.div>
      </main>
      {/* Navigation Bar is now provided by AuthenticatedLayout */}
    </AuthenticatedLayout>
  )
}

// Exportar o componente principal da página, envolvendo-o com ProfileProvider
export default function WalletPage() {
  return (
    <ProfileProvider>
      <WalletPageContent />
    </ProfileProvider>
  )
}
