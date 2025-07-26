"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Users, DollarSign, Percent, Search, Check, X, ChevronLeft, ChevronRight, Edit, Settings } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditCommissionModal } from "@/components/admin/edit-commission-modal" // Corrected import to named export

// --- MOCK DATA ---
type Edition = {
  id: string
  name: string
  startDate: string
  endDate: string
  current?: boolean
}

type AffiliateProcessed = {
  id: string
  nome_completo: string
  is_active: boolean
  commission_rate: number
  direct_referrals: number
  total_deposited: number
  commission_received: number
}

const mockEditions: Edition[] = [
  { id: "1", name: "Edição de Verão 2024", startDate: "2024-01-01", endDate: "2024-03-31", current: true },
  { id: "2", name: "Edição de Inverno 2023", startDate: "2023-06-01", endDate: "2023-08-31" },
  { id: "3", name: "Edição de Primavera 2023", startDate: "2023-09-01", endDate: "2023-11-30" },
]

const initialMockAffiliatesData: AffiliateProcessed[] = [
  {
    id: "aff1",
    nome_completo: "João Silva",
    is_active: true,
    commission_rate: 10.0,
    direct_referrals: 15,
    total_deposited: 1500.0,
    commission_received: 150.0,
  },
  {
    id: "aff2",
    nome_completo: "Maria Souza",
    is_active: true,
    commission_rate: 12.5,
    direct_referrals: 22,
    total_deposited: 2500.0,
    commission_received: 312.5,
  },
  {
    id: "aff3",
    nome_completo: "Carlos Pereira",
    is_active: false,
    commission_rate: 8.0,
    direct_referrals: 5,
    total_deposited: 300.0,
    commission_received: 24.0,
  },
  {
    id: "aff4",
    nome_completo: "Ana Costa",
    is_active: true,
    commission_rate: 11.0,
    direct_referrals: 18,
    total_deposited: 1800.0,
    commission_received: 198.0,
  },
  {
    id: "aff5",
    nome_completo: "Pedro Almeida",
    is_active: true,
    commission_rate: 9.5,
    direct_referrals: 10,
    total_deposited: 800.0,
    commission_received: 76.0,
  },
  {
    id: "aff6",
    nome_completo: "Mariana Lima",
    is_active: true,
    commission_rate: 10.0,
    direct_referrals: 15,
    total_deposited: 1500.0,
    commission_received: 150.0,
  },
  {
    id: "aff7",
    nome_completo: "Fernando Rocha",
    is_active: true,
    commission_rate: 12.5,
    direct_referrals: 22,
    total_deposited: 2500.0,
    commission_received: 312.5,
  },
  {
    id: "aff8",
    nome_completo: "Isabela Santos",
    is_active: false,
    commission_rate: 8.0,
    direct_referrals: 5,
    total_deposited: 300.0,
    commission_received: 24.0,
  },
  {
    id: "aff9",
    nome_completo: "Rafael Oliveira",
    is_active: true,
    commission_rate: 11.0,
    direct_referrals: 18,
    total_deposited: 1800.0,
    commission_received: 198.0,
  },
  {
    id: "aff10",
    nome_completo: "Laura Martins",
    is_active: true,
    commission_rate: 9.5,
    direct_referrals: 10,
    total_deposited: 800.0,
    commission_received: 76.0,
  },
  {
    id: "aff11",
    nome_completo: "Lucas Costa",
    is_active: true,
    commission_rate: 10.0,
    direct_referrals: 15,
    total_deposited: 1500.0,
    commission_received: 150.0,
  },
  {
    id: "aff12",
    nome_completo: "Beatriz Almeida",
    is_active: true,
    commission_rate: 12.5,
    direct_referrals: 22,
    total_deposited: 2500.0,
    commission_received: 312.5,
  },
  {
    id: "aff13",
    nome_completo: "Gabriel Lima",
    is_active: false,
    commission_rate: 8.0,
    direct_referrals: 5,
    total_deposited: 300.0,
    commission_received: 24.0,
  },
  {
    id: "aff14",
    nome_completo: "Sofia Rocha",
    is_active: true,
    commission_rate: 11.0,
    direct_referrals: 18,
    total_deposited: 1800.0,
    commission_received: 198.0,
  },
  {
    id: "aff15",
    nome_completo: "Daniel Santos",
    is_active: true,
    commission_rate: 9.5,
    direct_referrals: 10,
    total_deposited: 800.0,
    commission_received: 76.0,
  },
]
// --- END MOCK DATA ---

export default function AdminAffiliatesPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [editions, setEditions] = useState<Edition[]>(mockEditions) // Usando mockEditions
  const [selectedEditionId, setSelectedEditionId] = useState<string>(mockEditions[0]?.id || "")
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(mockEditions[0] || null)
  const [searchTerm, setSearchTerm] = useState("")
  const [affiliates, setAffiliates] = useState<AffiliateProcessed[]>(initialMockAffiliatesData) // Usando initialMockAffiliatesData
  const [kpis, setKpis] = useState({
    totalActiveAffiliates: 0,
    totalReferrals: 0,
    totalDeposited: 0,
    totalCommissions: 0,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Novos estados para o modal de edição de comissão
  const [isEditCommissionModalOpen, setIsEditCommissionModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<"single" | "bulk" | "global">("single")
  const [editingAffiliate, setEditingAffiliate] = useState<AffiliateProcessed | null>(null)
  const [selectedAffiliateIds, setSelectedAffiliateIds] = useState<string[]>([])

  // Função para carregar dados dos afiliados (agora do mock)
  const loadAffiliatesData = () => {
    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      const filtered = initialMockAffiliatesData.filter((affiliate) =>
        affiliate.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      // Calculate KPIs based on filtered data for the selected edition (mock logic)
      const activeAffiliates = filtered.filter((aff) => aff.is_active).length
      const totalReferrals = filtered.reduce((sum, aff) => sum + aff.direct_referrals, 0)
      const totalDeposited = filtered.reduce((sum, aff) => sum + aff.total_deposited, 0)
      const totalCommissions = filtered.reduce((sum, aff) => sum + aff.commission_received, 0)

      setAffiliates(filtered)
      setKpis({
        totalActiveAffiliates: activeAffiliates,
        totalReferrals: totalReferrals,
        totalDeposited: totalDeposited,
        totalCommissions: totalCommissions,
      })
      setCurrentPage(1) // Reset pagination on data load
      setSelectedAffiliateIds([]) // Clear selections
      setIsLoading(false)
    }, 500) // Simulate network delay
  }

  // Carregar dados dos afiliados quando a edição selecionada ou o termo de busca mudar
  useEffect(() => {
    loadAffiliatesData()
  }, [selectedEdition, searchTerm])

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
    setAffiliates((prevAffiliates) =>
      prevAffiliates.map((aff) => (aff.id === affiliateId ? { ...aff, is_active: !currentStatus } : aff)),
    )
    toast({
      title: "Status Atualizado",
      description: `Status do afiliado ${affiliates.find((a) => a.id === affiliateId)?.nome_completo} foi alterado.`,
      duration: 3000,
    })
    // Recalculate KPIs after status change
    loadAffiliatesData()
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
    if (selectedAffiliateIds.length === 0) {
      toast({
        title: "Nenhum Afiliado Selecionado",
        description: "Por favor, selecione pelo menos um afiliado para alterar a comissão em massa.",
        variant: "destructive",
      })
      return
    }
    setEditMode("bulk")
    setIsEditCommissionModalOpen(true)
  }

  const openGlobalEditModal = () => {
    setEditMode("global")
    setIsEditCommissionModalOpen(true)
  }

  const handleSaveCommission = async (newRate: number) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    setAffiliates((prevAffiliates) => {
      if (editMode === "single" && editingAffiliate) {
        return prevAffiliates.map((aff) =>
          aff.id === editingAffiliate.id ? { ...aff, commission_rate: newRate } : aff,
        )
      } else if (editMode === "bulk") {
        return prevAffiliates.map((aff) =>
          selectedAffiliateIds.includes(aff.id) ? { ...aff, commission_rate: newRate } : aff,
        )
      } else if (editMode === "global") {
        return prevAffiliates.map((aff) => ({ ...aff, commission_rate: newRate }))
      }
      return prevAffiliates
    })
    // Recalculate KPIs after commission change
    loadAffiliatesData()
  }

  return (
    <div className="flex min-h-screen bg-[#131B24]">
      <AdminSidebar sessionTimeRemaining={sessionTimeRemaining} onLogout={handleLogout} />
      <div className="flex flex-col flex-1 lg:ml-64">
        <AdminHeaderMobile /> {/* Mobile header with menu trigger */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Header da Página */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-white">Afiliados</h1>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                onClick={openGlobalEditModal}
                className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26] w-full sm:w-auto"
              >
                <Settings className="mr-2 h-4 w-4" />
                Comissão Global
              </Button>
              <Select
                value={selectedEditionId}
                onValueChange={(value) => {
                  setSelectedEditionId(value)
                  setSelectedEdition(editions.find((e) => e.id === value) || null)
                }}
              >
                <SelectTrigger className="w-full bg-[#232A34] border-[#366D51] text-white sm:w-80">
                  <SelectValue placeholder="Selecione uma edição" />
                </SelectTrigger>
                <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
                  {editions.map((edition) => (
                    <SelectItem key={edition.id} value={edition.id}>
                      {edition.name}
                      {edition.current && (
                        <span className="ml-2 inline-flex items-center rounded-md bg-[#9FFF00]/20 px-2 py-0.5 text-xs font-medium text-[#9FFF00]">
                          Atual
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 flex flex-col items-center">
                <CardTitle className="text-sm font-medium text-white text-center">Afiliados Ativos</CardTitle>
                <Users className="h-4 w-4 text-[#9FFF00] mt-1" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white text-center">
                  {isLoading ? "..." : kpis.totalActiveAffiliates}
                </div>
                <p className="text-xs text-gray-400 text-center">Afiliados com comissão ou indicação na edição</p>
              </CardContent>
            </Card>
            <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 flex flex-col items-center">
                <CardTitle className="text-sm font-medium text-white text-center">Total de Indicações</CardTitle>
                <Users className="h-4 w-4 text-[#9FFF00] mt-1" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white text-center">
                  {isLoading ? "..." : kpis.totalReferrals}
                </div>
                <p className="text-xs text-gray-400 text-center">Usuários indicados na edição</p>
              </CardContent>
            </Card>
            <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 flex flex-col items-center">
                <CardTitle className="text-sm font-medium text-white text-center">Total Depositado</CardTitle>
                <DollarSign className="h-4 w-4 text-[#9FFF00] mt-1" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white text-center">
                  {isLoading ? "..." : formatCurrency(kpis.totalDeposited)}
                </div>
                <p className="text-xs text-gray-400 text-center">Depósitos via indicados na edição</p>
              </CardContent>
            </Card>
            <Card className="bg-[#232A34] border-[#366D51] shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 flex flex-col items-center">
                <CardTitle className="text-sm font-medium text-white text-center">Comissões Pagas</CardTitle>
                <Percent className="h-4 w-4 text-[#9FFF00] mt-1" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white text-center">
                  {isLoading ? "..." : formatCurrency(kpis.totalCommissions)}
                </div>
                <p className="text-xs text-gray-400 text-center">Total em comissões na edição</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Tabela de Afiliados */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-auto flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar afiliado por nome..."
                  className="pl-9 bg-[#1A2430] border-[#366D51] text-white"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                  }}
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
                  {/* Adicionar outras ações em massa aqui, se necessário */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
                        Indicados na Edição
                      </TableHead>
                      <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total Depositado na Edição
                      </TableHead>
                      <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        % Comissão
                      </TableHead>
                      <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Comissão Gerada na Edição
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
                        <TableRow key={affiliate.id}>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={selectedAffiliateIds.includes(affiliate.id)}
                              onCheckedChange={(checked) => handleSelectAffiliate(affiliate.id, !!checked)}
                              className="border-[#9FFF00] data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-[#191F26]"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-white text-center">
                            {affiliate.nome_completo}
                          </TableCell>
                          <TableCell className="text-sm text-gray-300 text-center">
                            {affiliate.direct_referrals}
                          </TableCell>
                          <TableCell className="text-sm text-gray-300 text-center">
                            {formatCurrency(affiliate.total_deposited || 0)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-300 text-center">
                            {affiliate.commission_rate}%
                          </TableCell>
                          <TableCell className="text-sm text-gray-300 text-center">
                            {formatCurrency(affiliate.commission_received || 0)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-300 text-center">
                            <Badge
                              className={
                                affiliate.is_active
                                  ? "bg-[#9FFF00]/20 text-[#9FFF00] w-24 flex items-center justify-center"
                                  : "bg-red-500/20 text-red-500 w-24 flex items-center justify-center"
                              }
                            >
                              {affiliate.is_active ? "Ativo" : "Bloqueado"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-300 text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openSingleEditModal(affiliate)}
                                className="border-[#9FFF00]/30 hover:border-[#9FFF00]/50 hover:bg-[#9FFF00]/10 bg-transparent"
                              >
                                <Edit className="h-4 w-4 text-[#9FFF00]" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(affiliate.id, affiliate.is_active)}
                                className={
                                  affiliate.is_active
                                    ? "border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 bg-transparent text-red-500"
                                    : "border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10 bg-transparent text-green-500"
                                }
                              >
                                {affiliate.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
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
              <div className="mt-4 flex items-center justify-end space-x-2">
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
            )}
          </div>
        </main>
      </div>

      {/* Modal de Edição de Comissão */}
      <EditCommissionModal
        isOpen={isEditCommissionModalOpen}
        onClose={() => setIsEditCommissionModalOpen(false)}
        mode={editMode}
        affiliateName={editingAffiliate?.nome_completo}
        selectedAffiliateCount={selectedAffiliateIds.length}
        initialCommissionRate={editingAffiliate?.commission_rate}
        onSave={handleSaveCommission}
      />
    </div>
  )
}
