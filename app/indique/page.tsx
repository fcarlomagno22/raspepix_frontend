"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Gift, TrendingUp, Loader2 } from "lucide-react"
import { CommissionLevelCard } from "@/components/network/commission-level-card"
import { NetworkTreeView } from "@/components/network/network-tree-view"
import { InviteSection } from "@/components/network/invite-section"
import { NetworkOverview } from "@/components/network/network-overview"
import { ResourcesSection } from "@/components/network/resources-section"
import { useNetwork } from "@/hooks/use-network"

export default function IndiquePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "network" | "resources">("overview")
  const clientLink = "https://raspepix.com/cliente/seulink"
  const influencerLink = "https://raspepix.com/influencer/seulink"

  const { networkStats, networkTree, marketingResources, isLoading, error } = useNetwork()

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

  if (isLoading) {
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

  if (error) {
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
      <main className="flex-1 pt-4 pb-24 px-4 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gift className="h-7 w-7 text-[#9FFF00]" />
            Influencer Multinível
          </h1>
          <Button
            variant="outline"
            className="text-[#9FFF00] border-[#9FFF00]"
            onClick={() => router.push("/carreira")}
          >
            <Award className="h-5 w-5 mr-2" />
            Plano de Carreira
          </Button>
        </div>

        {/* Seção de Convites */}
        <div className="mb-6">
          <InviteSection
            clientLink={clientLink}
            influencerLink={influencerLink}
            onShare={handleShare}
          />
        </div>

        {/* Cards de Níveis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {networkStats?.map((stats) => (
            <CommissionLevelCard key={stats.level} stats={stats} />
          ))}
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
            </TabsList>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6"
            >
              <TabsContent value="overview">
                {networkStats && <NetworkOverview stats={networkStats} />}
              </TabsContent>

              <TabsContent value="network">
                {networkTree && <NetworkTreeView member={networkTree} />}
              </TabsContent>

              <TabsContent value="resources">
                {marketingResources && <ResourcesSection resources={marketingResources} />}
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
