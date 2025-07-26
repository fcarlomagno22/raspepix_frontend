"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"

interface EditionDetail {
  id: string
  name: string
  period: string
  faturamentoBruto: number
  premiosPagos: number
  custosOperacionais: number
  impostos: number
  resultadoLiquido: number
  margemLucro: number
  // Add more detailed fields here if needed for the drawer
  details: string
}

export default function FinanceiroEditionsTable() {
  const [selectedEdition, setSelectedEdition] = useState<EditionDetail | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Mock data for editions
  const editions: EditionDetail[] = [
    {
      id: "e1",
      name: "Edição #1 - Verão Premiado",
      period: "01/01/2024 - 07/01/2024",
      faturamentoBruto: 500000,
      premiosPagos: 200000,
      custosOperacionais: 100000,
      impostos: 50000,
      resultadoLiquido: 150000,
      margemLucro: 30,
      details: "Detalhes completos da Edição #1, incluindo breakdown de custos e prêmios.",
    },
    {
      id: "e2",
      name: "Edição #2 - Carnaval da Sorte",
      period: "08/01/2024 - 14/01/2024",
      faturamentoBruto: 750000,
      premiosPagos: 300000,
      custosOperacionais: 150000,
      impostos: 75000,
      resultadoLiquido: 225000,
      margemLucro: 30,
      details: "Detalhes completos da Edição #2, incluindo breakdown de custos e prêmios.",
    },
    {
      id: "e3",
      name: "Edição #3 - Páscoa Dourada",
      period: "15/01/2024 - 21/01/2024",
      faturamentoBruto: 600000,
      premiosPagos: 250000,
      custosOperacionais: 120000,
      impostos: 60000,
      resultadoLiquido: 170000,
      margemLucro: 28.33,
      details: "Detalhes completos da Edição #3, incluindo breakdown de custos e prêmios.",
    },
  ]

  const handleViewDetails = (edition: EditionDetail) => {
    setSelectedEdition(edition)
    setIsDrawerOpen(true)
  }

  return (
    <Card className="bg-[#232A34] border-[#366D51] shadow-md mb-8">
      <CardHeader>
        <CardTitle className="text-white">Edições Anteriores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#191F26]">
              <TableRow className="border-[#366D51]">
                <TableHead className="text-white text-center">Nome da Edição</TableHead>
                <TableHead className="text-white text-center">Período</TableHead>
                <TableHead className="text-white text-center">Faturamento Bruto</TableHead>
                <TableHead className="text-white text-center">Prêmios Pagos</TableHead>
                <TableHead className="text-white text-center">Custos Operacionais</TableHead>
                <TableHead className="text-white text-center">Resultado Líquido</TableHead>
                <TableHead className="text-white text-center">Margem de Lucro</TableHead>
                <TableHead className="text-white text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#232A34]">
              {editions.map((edition) => (
                <TableRow key={edition.id} className="border-[#366D51] hover:bg-[#191F26]">
                  <TableCell className="font-medium text-white text-center">{edition.name}</TableCell>
                  <TableCell className="text-gray-300 text-center">{edition.period}</TableCell>
                  <TableCell className="text-center text-white">{formatCurrency(edition.faturamentoBruto)}</TableCell>
                  <TableCell className="text-center text-white">{formatCurrency(edition.premiosPagos)}</TableCell>
                  <TableCell className="text-center text-white">{formatCurrency(edition.custosOperacionais)}</TableCell>
                  <TableCell
                    className={`text-center font-bold ${edition.resultadoLiquido >= 0 ? "text-[#9FFF00]" : "text-red-500"}`}
                  >
                    {formatCurrency(edition.resultadoLiquido)}
                  </TableCell>
                  <TableCell
                    className={`text-center font-bold ${edition.margemLucro >= 0 ? "text-[#9FFF00]" : "text-red-500"}`}
                  >
                    {formatPercentage(edition.margemLucro)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(edition)}
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

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="bg-[#191F26] text-white border-[#366D51]">
          <DrawerHeader>
            <DrawerTitle className="text-white">Detalhes da Edição: {selectedEdition?.name}</DrawerTitle>
            <DrawerDescription className="text-gray-400">
              {selectedEdition?.details || "Nenhum detalhe disponível."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 text-gray-300">
            <p>**Período:** {selectedEdition?.period}</p>
            <p>**Faturamento Bruto:** {formatCurrency(selectedEdition?.faturamentoBruto || 0)}</p>
            <p>**Prêmios Pagos:** {formatCurrency(selectedEdition?.premiosPagos || 0)}</p>
            <p>**Custos Operacionais:** {formatCurrency(selectedEdition?.custosOperacionais || 0)}</p>
            <p>
              **Resultado Líquido:**{" "}
              <span className={`${(selectedEdition?.resultadoLiquido || 0) >= 0 ? "text-[#9FFF00]" : "text-red-500"}`}>
                {formatCurrency(selectedEdition?.resultadoLiquido || 0)}
              </span>
            </p>
            <p>
              **Margem de Lucro:**{" "}
              <span className={`${(selectedEdition?.margemLucro || 0) >= 0 ? "text-[#9FFF00]" : "text-red-500"}`}>
                {formatPercentage(selectedEdition?.margemLucro || 0)}
              </span>
            </p>
            {/* Add more detailed information here */}
          </div>
        </DrawerContent>
      </Drawer>
    </Card>
  )
}
