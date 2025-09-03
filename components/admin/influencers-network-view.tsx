"use client"

import { useState, useMemo } from "react"
import { NetworkMember } from "@/types/network"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NetworkDetailModal } from "./network-detail-modal"
import { formatCurrency } from "@/lib/utils"
import { Search, Users, TrendingUp, Crown, Medal } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface InfluencersNetworkViewProps {
  influencers: NetworkMember[]
}

type SortOption = "network_size" | "revenue" | "newest" | "oldest"

export function InfluencersNetworkView({ influencers }: InfluencersNetworkViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("network_size")
  const [selectedInfluencer, setSelectedInfluencer] = useState<NetworkMember | null>(null)

  // Calcular métricas da rede para um influencer
  const calculateNetworkMetrics = (member: NetworkMember) => {
    let totalMembers = 0
    let totalEarnings = member.totalEarnings || 0

    const countMembers = (node: NetworkMember) => {
      if (node.children) {
        totalMembers += node.children.length
        node.children.forEach((child) => {
          totalEarnings += child.totalEarnings || 0
          countMembers(child)
        })
      }
    }

    countMembers(member)

    return {
      totalMembers,
      totalEarnings,
    }
  }

  // Processar e ordenar influencers
  const processedInfluencers = useMemo(() => {
    return influencers
      .map((influencer) => ({
        ...influencer,
        ...calculateNetworkMetrics(influencer),
      }))
      .sort((a, b) => {
        switch (sortBy) {
          case "network_size":
            return b.totalMembers - a.totalMembers
          case "revenue":
            return b.totalEarnings - a.totalEarnings
          case "newest":
            return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
          case "oldest":
            return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
          default:
            return 0
        }
      })
      .filter(
        (influencer) =>
          influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          influencer.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [influencers, sortBy, searchTerm])

  // Top 3 influencers por tamanho de rede e faturamento
  const topInfluencers = useMemo(() => {
    const byNetworkSize = [...processedInfluencers]
      .sort((a, b) => b.totalMembers - a.totalMembers)
      .slice(0, 3)

    const byRevenue = [...processedInfluencers]
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 3)

    return { byNetworkSize, byRevenue }
  }, [processedInfluencers])

  return (
    <div className="space-y-6">
      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 3 por Tamanho de Rede */}
        <Card className="bg-[#232A34] border-[#366D51] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-[#9FFF00]" />
            <h3 className="text-lg font-semibold text-white">Top 3 - Maior Rede</h3>
          </div>
          <div className="space-y-4">
            {topInfluencers.byNetworkSize.map((influencer, index) => (
              <div
                key={influencer.id}
                className="flex items-center gap-4 p-3 bg-[#1A2430] rounded-lg hover:bg-[#1A2430]/80 cursor-pointer"
                onClick={() => setSelectedInfluencer(influencer)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#9FFF00]/20">
                  {index === 0 ? (
                    <Crown className="h-4 w-4 text-[#9FFF00]" />
                  ) : (
                    <Medal className="h-4 w-4 text-[#9FFF00]" />
                  )}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={influencer.photoUrl} alt={influencer.name} />
                  <AvatarFallback>
                    {influencer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-white">{influencer.name}</p>
                  <p className="text-sm text-gray-400">{influencer.totalMembers} membros</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top 3 por Faturamento */}
        <Card className="bg-[#232A34] border-[#366D51] p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[#9FFF00]" />
            <h3 className="text-lg font-semibold text-white">Top 3 - Maior Faturamento</h3>
          </div>
          <div className="space-y-4">
            {topInfluencers.byRevenue.map((influencer, index) => (
              <div
                key={influencer.id}
                className="flex items-center gap-4 p-3 bg-[#1A2430] rounded-lg hover:bg-[#1A2430]/80 cursor-pointer"
                onClick={() => setSelectedInfluencer(influencer)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#9FFF00]/20">
                  {index === 0 ? (
                    <Crown className="h-4 w-4 text-[#9FFF00]" />
                  ) : (
                    <Medal className="h-4 w-4 text-[#9FFF00]" />
                  )}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={influencer.photoUrl} alt={influencer.name} />
                  <AvatarFallback>
                    {influencer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-white">{influencer.name}</p>
                  <p className="text-sm text-gray-400">{formatCurrency(influencer.totalEarnings)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar influencer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#1A2430] border-[#366D51] text-white"
          />
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[200px] bg-[#1A2430] border-[#366D51] text-white">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
            <SelectItem value="network_size">Tamanho da Rede</SelectItem>
            <SelectItem value="revenue">Faturamento</SelectItem>
            <SelectItem value="newest">Mais Recentes</SelectItem>
            <SelectItem value="oldest">Mais Antigos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Influencers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedInfluencers.map((influencer) => (
          <Card
            key={influencer.id}
            className="bg-[#232A34] border-[#366D51] p-4 hover:bg-[#232A34]/80 cursor-pointer transition-colors"
            onClick={() => setSelectedInfluencer(influencer)}
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={influencer.photoUrl} alt={influencer.name} />
                <AvatarFallback>
                  {influencer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium text-white">{influencer.name}</h4>
                <p className="text-sm text-gray-400">
                  Desde {influencer.joinedAt ? format(parseISO(influencer.joinedAt), "dd/MM/yyyy", { locale: ptBR }) : 'Data não disponível'}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Rede</p>
                    <p className="font-medium text-white">{influencer.totalMembers} membros</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Faturamento</p>
                    <p className="font-medium text-white">{formatCurrency(influencer.totalEarnings)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {selectedInfluencer && (
        <NetworkDetailModal
          isOpen={!!selectedInfluencer}
          onClose={() => setSelectedInfluencer(null)}
          influencer={selectedInfluencer}
        />
      )}
    </div>
  )
} 