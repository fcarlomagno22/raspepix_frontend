"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  DollarSign, 
  Percent, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  TrendingUp,
  Gift,
  Award,
  Lock,
  Unlock
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditCommissionModal } from "@/components/admin/edit-commission-modal"
import { NetworkOverviewAdmin } from "@/components/admin/network-overview-admin"
import { MarketingResourcesAdmin } from "@/components/admin/marketing-resources-admin"
import { NetworkTreeView } from "@/components/network/network-tree-view"
import { NetworkMember, NetworkStats, MarketingResource, CommissionLevel, Influencer, ApiResponse } from "@/types/network"
import { Promocao } from "@/services/promocoes"
import { api } from "@/services/api"
import { Promotion } from "@/components/admin/promotions-manager"
import { CommissionManager } from "@/components/admin/commission-manager"
import { PromotionsManager } from "@/components/admin/promotions-manager"
import { InfluencersNetworkView } from "@/components/admin/influencers-network-view"

// --- MOCK DATA ---
type ComissaoNivel = {
  nivel: "direto" | "secundario" | "expandido"
  percentual: number
}

type AffiliateProcessed = {
  id: string
  nome: string
  is_active: boolean
  codigo: string
  commission_n1: number
  commission_n2: number
  commission_n3: number
}

const mockNetworkStats: NetworkStats[] = [
  {
    level: 1,
    members: 150,
    revenue: 75000,
    commissions: 7500,
    commissionRate: 10,
  },
  {
    level: 2,
    members: 450,
    revenue: 225000,
    commissions: 11250,
    commissionRate: 5,
  },
  {
    level: 3,
    members: 1200,
    revenue: 600000,
    commissions: 18000,
    commissionRate: 3,
  },
]

// Mock data para promoções
const mockPromotions: Promotion[] = []

// Mock data para comissões por nível
const mockCommissionLevels: CommissionLevel[] = [
  { level: 1, percentage: 15, description: "Indicações Diretas" },
  { level: 2, percentage: 5, description: "Rede Secundária" },
  { level: 3, percentage: 1, description: "Rede Expandida" },
]

// Mock data para lista de influencers
const mockInfluencers: NetworkMember[] = [
  {
    id: "1",
    name: "João Silva",
    type: "influencer",
    level: 1,
    joinedAt: new Date(2024, 0, 15).toISOString(),
    totalEarnings: 75000,
    children: [
      {
        id: "1-1",
        name: "Maria Santos",
        type: "client",
        level: 2,
        joinedAt: new Date(2024, 1, 1).toISOString(),
        totalEarnings: 5000,
      },
      {
        id: "1-2",
        name: "Pedro Oliveira",
        type: "client",
        level: 2,
        joinedAt: new Date(2024, 1, 5).toISOString(),
        totalEarnings: 7500,
      },
    ],
  },
  {
    id: "2",
    name: "Ana Costa",
    type: "influencer",
    level: 1,
    joinedAt: new Date(2024, 0, 10).toISOString(),
    totalEarnings: 120000,
    children: [
      {
        id: "2-1",
        name: "Carlos Souza",
        type: "influencer",
        level: 2,
        joinedAt: new Date(2024, 1, 15).toISOString(),
        totalEarnings: 25000,
        children: [
          {
            id: "2-1-1",
            name: "Mariana Lima",
            type: "client",
            level: 3,
            joinedAt: new Date(2024, 2, 1).toISOString(),
            totalEarnings: 3000,
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Lucas Ferreira",
    type: "influencer",
    level: 1,
    joinedAt: new Date(2024, 1, 1).toISOString(),
    totalEarnings: 95000,
    children: [
      {
        id: "3-1",
        name: "Julia Martins",
        type: "client",
        level: 2,
        joinedAt: new Date(2024, 2, 5).toISOString(),
        totalEarnings: 8000,
      },
    ],
  },
]

// Mock data para recursos de marketing
const mockMarketingResources: MarketingResource[] = [
  {
    id: "1",
    title: "Kit de Mídia Social",
    description: "Kit completo para mídias sociais",
    type: "document",
    category: "social",
    url: "https://example.com/kit-social",
  },
  {
    id: "2",
    title: "Vídeo Institucional",
    description: "Vídeo institucional da empresa",
    type: "video",
    category: "presentation",
    url: "https://example.com/video",
  },
  {
    id: "3",
    title: "Templates WhatsApp",
    description: "Templates para mensagens do WhatsApp",
    type: "image",
    category: "whatsapp",
    url: "https://example.com/templates",
  },
  {
    id: "4",
    title: "Newsletter Template",
    description: "Template para newsletters",
    type: "document",
    category: "email",
    url: "https://example.com/newsletter",
  },
]

export default function AdminAffiliatesPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [affiliates, setAffiliates] = useState<AffiliateProcessed[]>([])
  const [activeTab, setActiveTab] = useState<"overview" | "network" | "resources" | "management" | "promotions" | "settings">("overview")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  // Estados para o modal de edição de comissão
  const [isEditCommissionModalOpen, setIsEditCommissionModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<"single" | "bulk">("single")
  const [editingAffiliate, setEditingAffiliate] = useState<AffiliateProcessed | null>(null)
  const [selectedAffiliateIds, setSelectedAffiliateIds] = useState<string[]>([])

  // Estados para os novos componentes
  const [networkStats, setNetworkStats] = useState<NetworkStats[]>(mockNetworkStats)
  const [marketingResources, setMarketingResources] = useState<MarketingResource[]>(mockMarketingResources)
  const [promotions, setPromotions] = useState<Promotion[]>([])

  // Função para buscar promoções
  const fetchPromotions = async () => {
    try {
      const response = await api.get('/api/promocoes')

      const responseData = response.data
      
      // Mapear os dados da API para o formato esperado pelo componente
      const processedPromotions = responseData.data.map((promo: Promocao) => ({
        id: promo.id,
        titulo: promo.titulo,
        descricao: promo.descricao,
        tipo_premiacao: promo.tipo_premiacao,
        premio_descricao: promo.premio_descricao,
        meta_vendas: promo.meta_vendas,
        inicio_em: new Date(promo.inicio_em).toISOString().split('T')[0],
        fim_em: new Date(promo.fim_em).toISOString().split('T')[0],
        is_ativa: promo.is_ativa,
        criado_em: promo.criado_em,
        atualizado_em: promo.atualizado_em
      } as Promotion))

      setPromotions(processedPromotions)
    } catch (error) {
      console.error('Erro ao carregar promoções:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de promoções.",
        duration: 3000,
      })
    }
  }
  const [commissionLevels, setCommissionLevels] = useState<CommissionLevel[]>(mockCommissionLevels)
  
  // Estado para os influencers da rede
  const [networkInfluencers, setNetworkInfluencers] = useState<NetworkMember[]>([])

  // Função para buscar dados da API
  const fetchInfluencers = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/api/influencers/listar')
      const responseData: ApiResponse = response.data
      const data = responseData.data
      
      // Processar os dados para o formato da tabela
      const processedData: AffiliateProcessed[] = data.map(influencer => ({
        id: influencer.id,
        nome: influencer.nome,
        is_active: influencer.status === 'ativo',
        codigo: influencer.codigo_influencer,
        commission_n1: influencer.comissoes.find(c => c.nivel === 'direto')?.percentual || 0,
        commission_n2: influencer.comissoes.find(c => c.nivel === 'secundario')?.percentual || 0,
        commission_n3: influencer.comissoes.find(c => c.nivel === 'expandido')?.percentual || 0
      }))

      // Filtrar se houver termo de busca
      const filtered = processedData.filter((affiliate) =>
        affiliate.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )

      setAffiliates(filtered)
      
      // Função recursiva para converter membros da rede
      const convertRedeMembro = (membro: any, level: number): NetworkMember => {
        // Verificar se o membro tem a estrutura necessária
        if (!membro || !membro.rede) {
          return {
            id: membro?.id || 'unknown',
            name: membro?.nome || 'Membro Desconhecido',
            type: level === 1 ? "influencer" : "client",
            level: level,
            joinedAt: membro?.data_cadastro || new Date().toISOString(),
            totalEarnings: membro?.volume_depositos || 0,
            status: membro?.status || 'inativo',
            children: []
          }
        }

        // Verificar se a data de cadastro é válida
        let joinedAt = membro.data_cadastro
        if (!joinedAt || typeof joinedAt !== 'string') {
          joinedAt = new Date().toISOString()
        }

        // Verificar se o volume de depósitos é válido
        let totalEarnings = membro.volume_depositos
        if (typeof totalEarnings !== 'number' || isNaN(totalEarnings)) {
          totalEarnings = 0
        }

        return {
          id: membro.id,
          name: membro.nome,
          type: level === 1 ? "influencer" : "client",
          level: level,
          joinedAt: joinedAt,
          totalEarnings: totalEarnings,
          status: membro.status,
          children: [
            ...(membro.rede.diretos || []).map((direto: any) => convertRedeMembro(direto, level + 1)),
            ...(membro.rede.secundarios || []).map((secundario: any) => convertRedeMembro(secundario, level + 1)),
            ...(membro.rede.expandidos || []).map((expandido: any) => convertRedeMembro(expandido, level + 1))
          ].filter(child => child.name) // Remove membros vazios
        }
      }
      
      // Processar dados para a visualização da rede
      try {
        const networkData: NetworkMember[] = data.map(influencer => convertRedeMembro(influencer, 1))
        setNetworkInfluencers(networkData)
      } catch (error) {
        console.error('Erro ao processar dados da rede:', error)
        setNetworkInfluencers([])
      }
      setCurrentPage(1)
      setSelectedAffiliateIds([])
    } catch (error) {
      console.error('Erro ao carregar influencers:', error)
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível carregar a lista de influencers.'
      toast({
        title: "Erro",
        description: errorMessage,
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar dados quando o componente montar ou quando houver busca
  useEffect(() => {
    fetchInfluencers()
  }, [searchTerm])

  // Carregar promoções quando a página carregar
  useEffect(() => {
    fetchPromotions()
  }, [])

  // Pagination logic
  const totalPages = Math.ceil(affiliates.length / itemsPerPage)
  const paginatedAffiliates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return affiliates.slice(startIndex, endIndex)
  }, [affiliates, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)
      if (currentPage > 3) pageNumbers.push("...")

      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1)
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 2))
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      if (currentPage < totalPages - 2) pageNumbers.push("...")
      pageNumbers.push(totalPages)
    }
    return pageNumbers
  }

  const handleToggleStatus = (affiliateId: string, currentStatus: boolean) => {
    // Atualizamos o estado local
    setAffiliates(prevAffiliates => 
      prevAffiliates.map(aff => {
        if (aff.id === affiliateId) {
          return { ...aff, is_active: !currentStatus }
        }
        return aff
      })
    )

    // Encontramos o afiliado para mostrar o nome correto no toast
    const affiliate = affiliates.find((a) => a.id === affiliateId)
    
    // Mostramos o toast com a mensagem apropriada
    toast({
      title: "Status Atualizado",
      description: `${affiliate?.nome} foi ${!currentStatus ? 'bloqueado' : 'desbloqueado'}.`,
      duration: 3000,
    })
  }

  // Mock session time for AdminSidebar
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(180) // 3 minutes = 180 seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const resetSessionTimer = () => {
      setSessionTimeRemaining(180) // Reset to 3 minutes
    }

    window.addEventListener("mousemove", resetSessionTimer)
    window.addEventListener("keydown", resetSessionTimer)

    return () => {
      window.removeEventListener("mousemove", resetSessionTimer)
      window.removeEventListener("keydown", resetSessionTimer)
    }
  }, [])

  const handleLogout = () => {
    toast({
      title: "Sessão Encerrada",
      description: "Você foi desconectado.",
      duration: 3000,
    })
    // Simulate logout, e.g., redirect to login page
    // router.push('/admin/login');
  }

  // Handlers para seleção de afiliados
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAffiliateIds(affiliates.map((aff) => aff.id))
    } else {
      setSelectedAffiliateIds([])
    }
  }

  const handleSelectAffiliate = (affiliateId: string, checked: boolean) => {
    if (checked) {
      setSelectedAffiliateIds((prev) => [...prev, affiliateId])
    } else {
      setSelectedAffiliateIds((prev) => prev.filter((id) => id !== affiliateId))
    }
  }

  // Handlers para o modal de edição de comissão
  const openSingleEditModal = (affiliate: AffiliateProcessed) => {
    setEditMode("single")
    setEditingAffiliate(affiliate)
    setIsEditCommissionModalOpen(true)
  }

  const openBulkEditModal = () => {
    setEditMode("bulk")
    setEditingAffiliate(null)
    setIsEditCommissionModalOpen(true)
  }

  const handleSaveCommission = async (newRate: number) => {
    if (editMode === "single" && editingAffiliate) {
      setAffiliates((prev) =>
        prev.map((a) =>
          a.id === editingAffiliate.id ? { ...a, commission_n1: newRate } : a
        )
      )
      toast({
        title: "Comissão Atualizada",
        description: `A comissão de ${editingAffiliate.nome} foi atualizada para ${newRate}%.`,
      })
    } else if (editMode === "bulk") {
      setAffiliates((prev) =>
        prev.map((a) =>
          selectedAffiliateIds.includes(a.id) ? { ...a, commission_n1: newRate } : a
        )
      )
      toast({
        title: "Comissões Atualizadas",
        description: `A comissão foi atualizada para ${newRate}% em ${selectedAffiliateIds.length} afiliados.`,
      })
    }

    setIsEditCommissionModalOpen(false)
    setEditingAffiliate(null)
    setSelectedAffiliateIds([])
  }

  const handleAddResource = (resource: MarketingResource) => {
    setMarketingResources((prev) => [...prev, resource])
  }

  const handleDeleteResource = (resourceId: string) => {
    setMarketingResources((prev) => prev.filter((r) => r.id !== resourceId))
  }

  const handleSavePromotion = (promotion: Promotion) => {
    setPromotions((prev) => [...prev, promotion])
    toast({
      title: "Promoção Salva",
      description: "A promoção foi salva com sucesso.",
    })
  }

  const handleDeletePromotion = (promotionId: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== promotionId))
    toast({
      title: "Promoção Removida",
      description: "A promoção foi removida com sucesso.",
    })
  }

  const handleSaveCommissionLevels = (levels: CommissionLevel[]) => {
    setCommissionLevels(levels)
    toast({
      title: "Configurações Salvas",
      description: "As configurações de comissão foram atualizadas com sucesso.",
    })
  }

  return (
    <div className="flex min-h-screen bg-[#131B24]">
      <AdminSidebar onLogout={handleLogout} />
      <div className="flex flex-col flex-1 lg:ml-64">
        <AdminHeaderMobile onLogout={handleLogout} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Header da Página */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Gift className="h-7 w-7 text-[#9FFF00]" />
              Gestão de Influencers
            </h1>
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
                  Rede
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Recursos
                </TabsTrigger>
                <TabsTrigger
                  value="promotions"
                  className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Promoções
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
                >
                  <Percent className="h-4 w-4 mr-2" />
                  Comissões
                </TabsTrigger>
                <TabsTrigger
                  value="management"
                  className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gestão
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="overview">
                  <NetworkOverviewAdmin stats={networkStats} />
                </TabsContent>

                <TabsContent value="network">
                  <div className="space-y-6">
                    <InfluencersNetworkView influencers={networkInfluencers} />
                  </div>
                </TabsContent>

                <TabsContent value="resources">
                  <MarketingResourcesAdmin
                    resources={marketingResources}
                    onAddResource={handleAddResource}
                    onDeleteResource={handleDeleteResource}
                  />
                </TabsContent>

                <TabsContent value="promotions">
                  <PromotionsManager
                    initialPromotions={promotions}
                    onSave={handleSavePromotion}
                    onDelete={handleDeletePromotion}
                  />
                </TabsContent>

                <TabsContent value="settings">
                  <div className="space-y-6">
                    <CommissionManager
                      influencers={affiliates.map(aff => ({
                        id: aff.id,
                        nome: aff.nome,
                        codigo_influencer: aff.codigo,
                        status: aff.is_active ? 'ativo' : 'bloqueado'
                      }))}
                      initialCommissions={commissionLevels}
                      onSave={handleSaveCommissionLevels}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="management">
                  {/* Tabela de Gestão de Afiliados */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <div className="relative w-full sm:w-auto flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar afiliado por nome..."
                          className="pl-9 bg-[#1A2430] border-[#366D51] text-white"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="bg-transparent text-[#9FFF00] border-[#9FFF00]/30 hover:bg-[#9FFF00]/10 hover:text-[#9FFF00] w-full sm:w-auto"
                            disabled={selectedAffiliateIds.length === 0}
                          >
                            Ações em Massa ({selectedAffiliateIds.length})
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#232A34] border-[#366D51] text-white">
                          <DropdownMenuItem onClick={openBulkEditModal} className="hover:bg-[#366D51]/30 cursor-pointer">
                            Alterar Comissão
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Tabela de Afiliados */}
                    <div className="rounded-md border border-[#366D51] overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-[#1A2430]">
                            <TableRow>
                              <TableHead className="w-12 text-center">
                                <Checkbox
                                  checked={selectedAffiliateIds.length === affiliates.length && affiliates.length > 0}
                                  onCheckedChange={handleSelectAll}
                                  className="border-[#9FFF00] data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-[#191F26]"
                                />
                              </TableHead>
                              <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Afiliado
                              </TableHead>
                              <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Cógido do Influencer
                              </TableHead>
                              <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                % Comissão N1
                              </TableHead>
                              <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                % Comissão N2
                              </TableHead>
                              <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                % Comissão N3
                              </TableHead>
                              <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                              </TableHead>
                              <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Ações
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="bg-[#232A34] divide-y divide-[#366D51]">
                            {isLoading ? (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                                  Carregando dados...
                                </TableCell>
                              </TableRow>
                            ) : paginatedAffiliates.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                                  Nenhum afiliado encontrado para esta edição.
                                </TableCell>
                              </TableRow>
                            ) : (
                              paginatedAffiliates.map((affiliate) => (
                                <TableRow key={affiliate.id} className="hover:bg-[#1A2430]">
                                  <TableCell className="text-center py-4">
                                    <Checkbox
                                      checked={selectedAffiliateIds.includes(affiliate.id)}
                                      onCheckedChange={(checked) => handleSelectAffiliate(affiliate.id, !!checked)}
                                      className="border-[#9FFF00] data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-[#191F26]"
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium text-white text-center">
                                    {affiliate.nome}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-300 text-center">
                                    {affiliate.codigo}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-300 text-center">
                                    {affiliate.commission_n1}%
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-300 text-center">
                                    {affiliate.commission_n2}%
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-300 text-center">
                                    {affiliate.commission_n3}%
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-300 text-center">
                                    <Badge
                                      className={
                                        !affiliate.is_active
                                          ? "bg-red-500/20 text-red-500 w-24 flex items-center justify-center"
                                          : "bg-[#9FFF00]/20 text-[#9FFF00] w-24 flex items-center justify-center"
                                      }
                                    >
                                      {!affiliate.is_active ? "Bloqueado" : "Ativo"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-300 text-center">
                                    <div className="flex justify-center">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleStatus(affiliate.id, affiliate.is_active)}
                                        className={
                                          !affiliate.is_active
                                            ? "border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 bg-transparent text-red-500"
                                            : "border-[#9FFF00]/30 hover:border-[#9FFF00]/50 hover:bg-[#9FFF00]/10 bg-transparent text-[#9FFF00]"
                                        }
                                      >
                                        {!affiliate.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-400">
                          Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, affiliates.length)} de {affiliates.length} influencers
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)] disabled:opacity-40 disabled:text-[#4A7700] disabled:border-[#4A7700]/30 disabled:bg-transparent disabled:shadow-none transition-all duration-300 ease-in-out group overflow-hidden"
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Anterior
                          </Button>
                          {getPageNumbers().map((pageNumber, index) =>
                            typeof pageNumber === "number" ? (
                              <Button
                                key={index}
                                variant={currentPage === pageNumber ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNumber)}
                                className={
                                  currentPage === pageNumber
                                    ? "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black hover:from-[#8AE000] hover:to-[#7AC000] shadow-[0_0_15px_rgba(159,255,0,0.4)] border-none min-w-[40px] h-10"
                                    : "border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10 hover:text-[#9FFF00] hover:border-[#9FFF00] focus:border-[#9FFF00] focus:text-[#9FFF00] focus:ring-1 focus:ring-[#9FFF00] active:border-[#9FFF00] active:text-[#9FFF00] active:bg-[#9FFF00]/20 min-w-[40px] h-10"
                                }
                              >
                                {pageNumber}
                              </Button>
                            ) : (
                              <span key={index} className="text-gray-400 px-2">
                                {pageNumber}
                              </span>
                            ),
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#1A2430] to-[#131B24] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)] disabled:opacity-40 disabled:text-[#4A7700] disabled:border-[#4A7700]/30 disabled:bg-transparent disabled:shadow-none transition-all duration-300 ease-in-out group overflow-hidden"
                          >
                            Próxima
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Modal de Edição de Comissão */}
      <EditCommissionModal
        isOpen={isEditCommissionModalOpen}
        onClose={() => setIsEditCommissionModalOpen(false)}
        mode={editMode}
        affiliateName={editingAffiliate?.nome}
        selectedAffiliateCount={selectedAffiliateIds.length}
        initialCommissionRate={editingAffiliate?.commission_n1}
        onSave={handleSaveCommission}
      />
    </div>
  )
}
