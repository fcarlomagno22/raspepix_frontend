"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Search, Plus, Pencil, Ban, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { formatCurrency, cn } from "@/lib/utils"
import { CampaignDrawer } from "@/components/admin/campaign-drawer"

type Edition = {
  id: string
  name: string
  period: string
  current?: boolean
}

type Campaign = {
  id: string
  influencerName: string
  cpfCnpj: string
  edition: string
  scratchCard: string
  commissionPercentage: number
  fixedValue: number
  status: "Ativo" | "Inativo"
  observations?: string
}

const mockEditions: Edition[] = [
  { id: "1", name: "Edição #1", period: "01/01/2024 - 07/01/2024" },
  { id: "2", name: "Edição #2", period: "08/01/2024 - 14/01/2024" },
  { id: "3", name: "Edição #3", period: "15/01/2024 - 21/01/2024" },
  { id: "4", name: "Edição #4", period: "22/01/2024 - 28/01/2024" },
  { id: "5", name: "Edição #5", period: "29/01/2024 - 04/02/2024", current: true },
]

const initialMockCampaigns: Campaign[] = [
  {
    id: "c1",
    influencerName: "Maria Silva",
    cpfCnpj: "123.456.789-00",
    edition: "Edição #5",
    scratchCard: "Golden Peel Reveal",
    commissionPercentage: 10,
    fixedValue: 500,
    status: "Ativo",
    observations: "Campanha de lançamento com foco em stories.",
  },
  {
    id: "c2",
    influencerName: "João Santos",
    cpfCnpj: "987.654.321-00",
    edition: "Edição #4",
    scratchCard: "Buried Booty Scratch",
    commissionPercentage: 8,
    fixedValue: 200,
    status: "Inativo",
    observations: "Campanha encerrada por baixo desempenho.",
  },
  {
    id: "c3",
    influencerName: "Ana Paula",
    cpfCnpj: "111.222.333-44",
    edition: "Edição #5",
    scratchCard: "Lucky Clover",
    commissionPercentage: 12,
    fixedValue: 750,
    status: "Ativo",
    observations: "Parceria de longo prazo, foco em vídeos no YouTube.",
  },
  {
    id: "c4",
    influencerName: "Pedro Costa",
    cpfCnpj: "555.666.777-88",
    edition: "Edição #3",
    scratchCard: "Diamond Rush",
    commissionPercentage: 7,
    fixedValue: 150,
    status: "Inativo",
    observations: "Influencer não respondeu aos contatos.",
  },
  {
    id: "c5",
    influencerName: "Carla Lima",
    cpfCnpj: "999.888.777-66",
    edition: "Edição #5",
    scratchCard: "Golden Peel Reveal",
    commissionPercentage: 11,
    fixedValue: 600,
    status: "Ativo",
    observations: "Campanha com foco em engajamento no Instagram.",
  },
  {
    id: "c6",
    influencerName: "Rafael Souza",
    cpfCnpj: "123.123.123-12",
    edition: "Edição #2",
    scratchCard: "Buried Booty Scratch",
    commissionPercentage: 9,
    fixedValue: 300,
    status: "Ativo",
    observations: "Campanha de teste, resultados promissores.",
  },
  {
    id: "c7",
    influencerName: "Fernanda Oliveira",
    cpfCnpj: "444.555.666-77",
    edition: "Edição #5",
    scratchCard: "Lucky Clover",
    commissionPercentage: 15,
    fixedValue: 1000,
    status: "Ativo",
    observations: "Influencer VIP, alta performance.",
  },
  {
    id: "c8",
    influencerName: "Lucas Pereira",
    cpfCnpj: "000.111.222-33",
    edition: "Edição #1",
    scratchCard: "Diamond Rush",
    commissionPercentage: 6,
    fixedValue: 100,
    status: "Inativo",
    observations: "Campanha cancelada antes do início.",
  },
  {
    id: "c9",
    influencerName: "Mariana Almeida",
    cpfCnpj: "777.888.999-00",
    edition: "Edição #5",
    scratchCard: "Golden Peel Reveal",
    commissionPercentage: 10,
    fixedValue: 550,
    status: "Ativo",
    observations: "Foco em público jovem, TikTok.",
  },
  {
    id: "c10",
    influencerName: "Gustavo Rocha",
    cpfCnpj: "333.222.111-00",
    edition: "Edição #4",
    scratchCard: "Buried Booty Scratch",
    commissionPercentage: 8,
    fixedValue: 250,
    status: "Ativo",
    observations: "Campanha de nicho, bom ROI.",
  },
  {
    id: "c11",
    influencerName: "Isabela Martins",
    cpfCnpj: "987.654.321-00",
    edition: "Edição #5",
    scratchCard: "Buried Booty Scratch",
    commissionPercentage: 9,
    fixedValue: 400,
    status: "Ativo",
    observations: "Nova parceria, potencial de crescimento.",
  },
]

export default function InfluencersPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialMockCampaigns)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Ativo" | "Inativo">("Todos")
  const [editionFilter, setEditionFilter] = useState<string>("Todos")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset page on search
  }, [])

  const handleStatusChange = useCallback((value: "Todos" | "Ativo" | "Inativo") => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset page on filter change
  }, [])

  const handleEditionChange = useCallback((value: string) => {
    setEditionFilter(value)
    setCurrentPage(1) // Reset page on filter change
  }, [])

  const handleEditCampaign = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setIsDrawerOpen(true)
  }, [])

  const handleToggleStatus = useCallback((id: string) => {
    setCampaigns((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign.id === id ? { ...campaign, status: campaign.status === "Ativo" ? "Inativo" : "Ativo" } : campaign,
      ),
    )
  }, [])

  const handleSaveCampaign = useCallback((campaignToSave: Campaign) => {
    setCampaigns((prevCampaigns) => {
      const existingIndex = prevCampaigns.findIndex((c) => c.id === campaignToSave.id)
      if (existingIndex > -1) {
        // Update existing campaign
        return prevCampaigns.map((c, index) => (index === existingIndex ? campaignToSave : c))
      } else {
        // Add new campaign
        return [...prevCampaigns, { ...campaignToSave, id: `c${prevCampaigns.length + 1}` }] // Assign a new ID
      }
    })
    setIsDrawerOpen(false) // Close drawer after saving
  }, [])

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // e.g., 1 ... 4 5 6 ... 10

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

  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns

    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.influencerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.cpfCnpj.includes(searchTerm),
      )
    }

    if (statusFilter !== "Todos") {
      filtered = filtered.filter((campaign) => campaign.status === statusFilter)
    }

    if (editionFilter !== "Todos") {
      filtered = filtered.filter((campaign) => campaign.edition === editionFilter)
    }

    return filtered
  }, [campaigns, searchTerm, statusFilter, editionFilter])

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCampaigns = useMemo(() => {
    return filteredCampaigns.slice(startIndex, endIndex)
  }, [filteredCampaigns, startIndex, endIndex])

  return (
    <div className="flex min-h-screen bg-[#1A2430]">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto pt-20 lg:pt-6 lg:ml-64">
        <h1 className="text-3xl font-bold mb-8 text-white">Influencers</h1>

        {/* Filtros e Botão "Nova Campanha" */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou CPF/CNPJ do influenciador"
              className="pl-10 bg-[#232A34] border-[#366D51] text-white placeholder:text-gray-400"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Novo grupo para os Selects e o Botão */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-auto bg-[#232A34] border-[#366D51] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Ativo">Ativos</SelectItem>
                <SelectItem value="Inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={editionFilter} onValueChange={handleEditionChange}>
              <SelectTrigger className="w-[320px] bg-[#1A2430] border-[#9FFF00]/20 text-white h-12">
                <SelectValue placeholder="Edição" />
              </SelectTrigger>
              <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
                <SelectItem value="Todos">Todas</SelectItem>
                {mockEditions.map((edition) => (
                  <SelectItem key={edition.id} value={edition.name}>
                    {edition.name} {edition.current && "(Atual)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Sheet onOpenChange={setIsDrawerOpen} open={isDrawerOpen}>
              <SheetTrigger asChild>
                <Button
                  className="w-full sm:w-auto bg-[#9FFF00] text-black hover:bg-[#9FFF00]/90"
                  onClick={() => setSelectedCampaign(null)} // Reset form for new campaign
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </SheetTrigger>
              <CampaignDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                selectedCampaign={selectedCampaign}
                onSave={handleSaveCampaign}
              />
            </Sheet>
          </div>
        </div>

        {/* Tabela de Campanhas */}
        <Card className="bg-[#232A34] border-[#366D51] text-white">
          <CardHeader>
            <CardTitle className="text-white">Campanhas de Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#366D51]">
                    <TableHead className="text-gray-300 text-center">Nome do Influenciador</TableHead>
                    <TableHead className="text-gray-300 text-center">CPF/CNPJ</TableHead>
                    <TableHead className="text-gray-300 text-center">Edição Vinculada</TableHead>
                    <TableHead className="text-gray-300 text-center">Scratch Card Exclusiva</TableHead>
                    <TableHead className="text-gray-300 text-center">% Comissão</TableHead>
                    <TableHead className="text-gray-300 text-center">Valor Fixo Acordado</TableHead>
                    <TableHead className="text-gray-300 text-center">Status</TableHead>
                    <TableHead className="text-gray-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCampaigns.length > 0 ? (
                    currentCampaigns.map((campaign) => (
                      <TableRow key={campaign.id} className="border-[#366D51] hover:bg-[#9FFF00]/5">
                        <TableCell className="font-medium text-white text-center">{campaign.influencerName}</TableCell>
                        <TableCell className="text-white text-center">{campaign.cpfCnpj}</TableCell>
                        <TableCell className="text-white text-center">{campaign.edition}</TableCell>
                        <TableCell className="text-white text-center">{campaign.scratchCard}</TableCell>
                        <TableCell className="text-white text-center">{campaign.commissionPercentage}%</TableCell>
                        <TableCell className="text-white text-center">{formatCurrency(campaign.fixedValue)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={cn(
                              "min-w-[90px] flex items-center justify-center", // Garante que o badge é um container flex e centraliza o conteúdo
                              campaign.status === "Ativo"
                                ? "bg-[#9FFF00]/20 text-[#9FFF00] border-none"
                                : "bg-red-500/20 text-red-400 border-none",
                            )}
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-white"
                              onClick={() => handleEditCampaign(campaign)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-white"
                              onClick={() => handleToggleStatus(campaign.id)}
                            >
                              {campaign.status === "Ativo" ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              <span className="sr-only">{campaign.status === "Ativo" ? "Bloquear" : "Ativar"}</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-gray-400">
                        Nenhuma campanha encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
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
                      onClick={() => setCurrentPage(pageNumber)}
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#1A2430] to-[#131B24] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)] disabled:opacity-40 disabled:text-[#4A7700] disabled:border-[#4A7700]/30 disabled:bg-transparent disabled:shadow-none transition-all duration-300 ease-in-out group overflow-hidden"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
