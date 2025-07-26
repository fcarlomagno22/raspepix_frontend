"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer" // Import Drawer components
import { useState } from "react"

interface Campaign {
  id: string
  name: string
  invested: number
  revenueGenerated: number
  roi: number
  relatedEdition: string
  details?: string // Add details field for the drawer
}

export default function FinanceiroRoiCampaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Mock data for campaigns
  const campaigns: Campaign[] = [
    {
      id: "c1",
      name: "Campanha Verão 2024 - Google Ads",
      invested: 10000,
      revenueGenerated: 30000,
      roi: 200, // ((30000 - 10000) / 10000) * 100
      relatedEdition: "Edição #1",
      details: "Campanha focada em aquisição de novos usuários via Google Search e Display Network durante o verão.",
    },
    {
      id: "c2",
      name: "Parceria Influencer @SorteGrande",
      invested: 5000,
      revenueGenerated: 15000,
      roi: 200,
      relatedEdition: "Edição #2",
      details: "Colaboração com o influenciador digital @SorteGrande para promover raspadinhas de carnaval.",
    },
    {
      id: "c3",
      name: "Campanha de Facebook Ads - Carnaval",
      invested: 8000,
      revenueGenerated: 20000,
      roi: 150,
      relatedEdition: "Edição #2",
      details: "Anúncios pagos no Facebook e Instagram segmentados para o público interessado em jogos e sorteios.",
    },
  ]

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setIsDrawerOpen(true)
  }

  return (
    <div className="relative">
      <Card className="bg-[#232A34] border-[#366D51] shadow-md mb-8">
        <CardHeader>
          <CardTitle className="text-white text-center">ROI de Campanhas de Marketing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#191F26]">
                <TableRow className="border-[#366D51]">
                  <TableHead className="text-white text-center">Nome da Campanha</TableHead>
                  <TableHead className="text-white text-center">Valor Investido</TableHead>
                  <TableHead className="text-white text-center">Receita Gerada</TableHead>
                  <TableHead className="text-white text-center">ROI (%)</TableHead>
                  <TableHead className="text-white text-center">Edição Relacionada</TableHead>
                  <TableHead className="text-white text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-[#232A34]">
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="border-[#366D51] hover:bg-[#191F26]">
                    <TableCell className="font-medium text-white text-center">{campaign.name}</TableCell>
                    <TableCell className="text-center text-white">{formatCurrency(campaign.invested)}</TableCell>
                    <TableCell className="text-center text-white">
                      {formatCurrency(campaign.revenueGenerated)}
                    </TableCell>
                    <TableCell
                      className={`text-center font-bold ${campaign.roi >= 0 ? "text-[#9FFF00]" : "text-red-500"}`}
                    >
                      {formatPercentage(campaign.roi)}
                    </TableCell>
                    <TableCell className="text-gray-300 text-center">{campaign.relatedEdition}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(campaign)}
                        className="text-gray-400 hover:text-[#9FFF00] hover:bg-transparent"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Drawer for Campaign Details */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="bg-[#191F26] text-white border-[#366D51]">
          <DrawerHeader>
            <DrawerTitle className="text-white">Detalhes da Campanha: {selectedCampaign?.name}</DrawerTitle>
            <DrawerDescription className="text-gray-400">
              {selectedCampaign?.details || "Nenhum detalhe disponível."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 text-gray-300">
            <p>**Valor Investido:** {formatCurrency(selectedCampaign?.invested || 0)}</p>
            <p>**Receita Gerada:** {formatCurrency(selectedCampaign?.revenueGenerated || 0)}</p>
            <p>
              **ROI (%):**{" "}
              <span className={`${(selectedCampaign?.roi || 0) >= 0 ? "text-[#9FFF00]" : "text-red-500"}`}>
                {formatPercentage(selectedCampaign?.roi || 0)}
              </span>
            </p>
            <p>**Edição Relacionada:** {selectedCampaign?.relatedEdition}</p>
            {/* Add more detailed information here if available */}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
