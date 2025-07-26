"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { formatCurrency } from "@/lib/utils"
import { ChevronUp, ChevronDown, Eye, Edit2 } from "lucide-react"
import { addDays } from "date-fns"

interface Purchase {
  id: string
  customerName: string
  cpf: string
  purchaseDate: string
  amount: number
  type: "Raspadinha" | "Slot" | "Sorteio"
  edition: string
  status: "Aprovado" | "Pendente" | "Recusado"
}

interface SortConfig {
  key: keyof Purchase
  direction: "asc" | "desc"
}

export default function FinanceiroPurchasesTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchName, setSearchName] = useState("")
  const [searchCPF, setSearchCPF] = useState("")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "purchaseDate",
    direction: "desc",
  })

  // Mock data for purchases
  const mockPurchases: Purchase[] = [
    {
      id: "1",
      customerName: "João Silva",
      cpf: "123.XXX.XXX-12",
      purchaseDate: "2024-03-15T10:30:00",
      amount: 10000, // R$ 100,00
      type: "Raspadinha",
      edition: "Edição #5",
      status: "Aprovado"
    },
    {
      id: "2",
      customerName: "Maria Santos",
      cpf: "456.XXX.XXX-45",
      purchaseDate: "2024-03-15T11:15:00",
      amount: 5000, // R$ 50,00
      type: "Slot",
      edition: "Edição #5",
      status: "Pendente"
    },
    // Adicione mais dados mock aqui...
  ]

  const itemsPerPage = 25

  const handleSort = (key: keyof Purchase) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  const getStatusColor = (status: Purchase["status"]) => {
    switch (status) {
      case "Aprovado":
        return "text-[#9FFF00]"
      case "Pendente":
        return "text-yellow-400"
      case "Recusado":
        return "text-red-400"
      default:
        return "text-gray-300"
    }
  }

  const filterPurchases = (purchases: Purchase[]) => {
    return purchases.filter((purchase) => {
      const nameMatch = purchase.customerName.toLowerCase().includes(searchName.toLowerCase())
      const cpfMatch = purchase.cpf.includes(searchCPF)
      const purchaseDate = new Date(purchase.purchaseDate)
      const dateMatch =
        (!dateRange.from || purchaseDate >= dateRange.from) && (!dateRange.to || purchaseDate <= dateRange.to)

      return nameMatch && cpfMatch && dateMatch
    })
  }

  const sortPurchases = (purchases: Purchase[]) => {
    return [...purchases].sort((a, b) => {
      if (sortConfig.key === "amount" || sortConfig.key === "purchaseDate") {
        const aValue = sortConfig.key === "amount" ? a.amount : new Date(a.purchaseDate).getTime()
        const bValue = sortConfig.key === "amount" ? b.amount : new Date(b.purchaseDate).getTime()
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }
      return 0
    })
  }

  const filteredAndSortedPurchases = sortPurchases(filterPurchases(mockPurchases))
  const totalPages = Math.ceil(filteredAndSortedPurchases.length / itemsPerPage)
  const currentPurchases = filteredAndSortedPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const SortIcon = ({ column }: { column: keyof Purchase }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 inline" />
    ) : (
      <ChevronDown className="h-4 w-4 inline" />
    )
  }

  return (
    <Card className="bg-[#232A34] border-[#366D51] shadow-md mb-8">
      <CardHeader>
        <CardTitle className="text-white">Compras Realizadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="bg-[#191F26] border-[#366D51] text-white"
            />
            <Input
              placeholder="Buscar por CPF..."
              value={searchCPF}
              onChange={(e) => setSearchCPF(e.target.value)}
              className="bg-[#191F26] border-[#366D51] text-white"
            />
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#191F26]">
                <TableRow className="border-[#366D51]">
                  <TableHead className="text-white">Nome do Cliente</TableHead>
                  <TableHead className="text-white">CPF</TableHead>
                  <TableHead
                    className="text-white cursor-pointer"
                    onClick={() => handleSort("purchaseDate")}
                  >
                    Data da Compra <SortIcon column="purchaseDate" />
                  </TableHead>
                  <TableHead
                    className="text-white cursor-pointer"
                    onClick={() => handleSort("amount")}
                  >
                    Valor Pago <SortIcon column="amount" />
                  </TableHead>
                  <TableHead className="text-white">Tipo</TableHead>
                  <TableHead className="text-white">Edição</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-[#232A34]">
                {currentPurchases.map((purchase) => (
                  <TableRow key={purchase.id} className="border-[#366D51] hover:bg-[#191F26]">
                    <TableCell className="font-medium text-white">{purchase.customerName}</TableCell>
                    <TableCell className="text-gray-300">{purchase.cpf}</TableCell>
                    <TableCell className="text-gray-300">{formatDate(purchase.purchaseDate)}</TableCell>
                    <TableCell className="text-white">{formatCurrency(purchase.amount)}</TableCell>
                    <TableCell className="text-gray-300">{purchase.type}</TableCell>
                    <TableCell className="text-gray-300">{purchase.edition}</TableCell>
                    <TableCell className={getStatusColor(purchase.status)}>{purchase.status}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-[#366D51]"
                          onClick={() => {
                            // Implementar visualização da compra
                            console.log("Visualizar compra", purchase.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-[#366D51]"
                          onClick={() => {
                            // Implementar edição do status
                            console.log("Editar status", purchase.id)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-400">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedPurchases.length)} de{" "}
              {filteredAndSortedPurchases.length} registros
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-[#191F26] border-[#366D51] text-white hover:bg-[#232A34]"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-[#191F26] border-[#366D51] text-white hover:bg-[#232A34]"
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 