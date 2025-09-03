"use client"

import { useState, useEffect } from "react"
import PartnershipTermsModal from "@/components/network/partnership-terms-modal"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, TrendingUp, Loader2, Award, Wallet } from "lucide-react"
import { CommissionLevelCard } from "@/components/network/commission-level-card"
import { NetworkTreeView } from "@/components/network/network-tree-view"
import { InviteSection } from "@/components/network/invite-section"
import { NetworkOverview } from "@/components/network/network-overview"
import { ResourcesSection } from "@/components/network/resources-section"
import { WithdrawBalanceCard } from "@/components/network/withdraw-balance-card"
import { NetworkTransactionsList } from "@/components/network/network-transactions-list"
import { WithdrawRequestsList } from "@/components/network/withdraw-requests-list"
import { PromotionProgress } from "@/components/network/promotion-progress"
import { useNetwork } from "@/hooks/use-network"
import { useInfluencerStatus } from "@/hooks/use-influencer-status"

export default function IndiquePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "network" | "resources" | "financial">("overview")
  const clientLink = "https://raspepix.com/cliente/seulink"
  const influencerLink = "https://raspepix.com/influencer/seulink"

  const { networkStats, networkTree, marketingResources, isLoading: isLoadingNetwork, error: networkError } = useNetwork()
  const { isInfluencer, isLoading: isLoadingInfluencer } = useInfluencerStatus()

  useEffect(() => {
    setMounted(true)
    // Mostra o modal apenas se o usuário não for influencer e já tivermos carregado o status
    if (!isLoadingInfluencer) {
      setShowTerms(!isInfluencer)
    }
  }, [isLoadingInfluencer, isInfluencer])

  const handleAcceptTerms = () => {
    setShowTerms(false)
  }

  if (!mounted) {
    return (
      <AuthenticatedLayout>
        <main className="flex-1 pt-4 pb-24 px-4 w-full">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 text-[#9FFF00] animate-spin" />
              <p className="text-gray-400">Carregando sua rede...</p>
            </div>
          </div>
        </main>
      </AuthenticatedLayout>
    )
  }

  const handleShare = async (type: "client" | "influencer") => {
    const link = type === "client" ? clientLink : influencerLink
    const text = type === "client"
      ? "Venha jogar e ganhar prêmios na RaspePix!"
      : "Seja um Influencer RaspePix e construa sua rede!"

    if (navigator.share) {
      try {
        await navigator.share({
          title: "RaspePix",
          text,
          url: link,
        })
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      // Fallback para navegadores que não suportam a Web Share API
      navigator.clipboard.writeText(`${text}\n\n${link}`)
    }
  }

  if (isLoadingNetwork || isLoadingInfluencer) {
    return (
      <AuthenticatedLayout>
        <main className="flex-1 pt-4 pb-24 px-4 w-full">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 text-[#9FFF00] animate-spin" />
              <p className="text-gray-400">Carregando sua rede...</p>
            </div>
          </div>
        </main>
      </AuthenticatedLayout>
    )
  }

  if (networkError) {
    return (
      <AuthenticatedLayout>
        <main className="flex-1 pt-4 pb-24 px-4 w-full">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <p className="text-red-500 mb-4">Erro ao carregar os dados da rede.</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#9FFF00] text-[#191F26] hover:bg-[#8FEF00]"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </main>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      {showTerms && <PartnershipTermsModal isOpen={showTerms} onAccept={handleAcceptTerms} />}
      <main className="flex-1 pt-4 pb-24 px-4 w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 justify-center mb-4">
            <Gift className="h-7 w-7 text-[#9FFF00]" />
            Influencer Multinível
          </h1>
          <PromotionProgress />
        </div>

        {/* Seção de Convites */}
        <div className="mb-6">
          <InviteSection
            onShare={handleShare}
            isInfluencer={isInfluencer}
          />
        </div>

        {/* Card de Saldo */}
        <div className="mb-6">
          <WithdrawBalanceCard />
        </div>

        {/* Cards de Níveis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CommissionLevelCard level={1} />
          <CommissionLevelCard level={2} />
          <CommissionLevelCard level={3} />
        </div>

        {/* Tabs */}
        <div className="bg-[#1E2530] rounded-lg p-1">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="w-full bg-transparent">
              <TabsTrigger
                value="overview"
                className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="network"
                className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
              >
                <Gift className="h-4 w-4 mr-2" />
                Minha Rede
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
              >
                <Award className="h-4 w-4 mr-2" />
                Recursos
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Financeiro
              </TabsTrigger>
            </TabsList>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6"
            >
              <TabsContent value="overview">
                <NetworkOverview />
              </TabsContent>

              <TabsContent value="network">
                {networkTree && <NetworkTreeView member={networkTree} />}
              </TabsContent>

              <TabsContent value="resources">
                {marketingResources && <ResourcesSection resources={marketingResources} />}
              </TabsContent>

              <TabsContent value="financial">
                <div className="bg-[#232A34] rounded-lg p-6">
                  <Tabs defaultValue="transactions" className="space-y-6">
                    <div className="flex justify-center">
                      <TabsList className="bg-[#1E2530] p-1 w-full max-w-[1000px]">
                        <TabsTrigger
                          value="transactions"
                          className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
                        >
                          Transações da Rede
                        </TabsTrigger>
                        <TabsTrigger
                          value="withdrawals"
                          className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
                        >
                          Solicitações de Saque
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="transactions" className="mt-6">
                      <NetworkTransactionsList />
                    </TabsContent>

                    <TabsContent value="withdrawals" className="mt-6">
                      <WithdrawRequestsList />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
