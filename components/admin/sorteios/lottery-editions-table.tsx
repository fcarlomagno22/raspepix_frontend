"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Ticket } from "lucide-react"
import { type LotteryEdition, type LotteryEditionStatus, formatDateDisplay } from "@/lib/mock-lottery-data"
import { formatCurrency } from "@/lib/utils"
import LotteryTicketsModal from "@/components/admin/lottery-tickets-modal"
import { cn } from "@/lib/utils" // Import cn for conditional class names

interface LotteryEditionsTableProps {
  editions: LotteryEdition[]
  onEdit: (edition: LotteryEdition) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, newStatus: LotteryEditionStatus) => void
}

export default function LotteryEditionsTable({
  editions,
  onEdit,
  onDelete,
  onStatusChange,
}: LotteryEditionsTableProps) {
  // This function is no longer directly used for the badge in the table, but kept for reference or other uses.
  const getStatusBadgeClass = (status: LotteryEditionStatus) => {
    switch (status) {
      case "ativo":
        return "bg-green-500/20 text-green-400"
      case "encerrado":
        return "bg-red-500/20 text-red-400"
      case "futuro":
        return "bg-blue-500/20 text-blue-400"
      default:
        return ""
    }
  }

  const getSelectTriggerClass = (status: LotteryEditionStatus) => {
    switch (status) {
      case "ativo":
        return "border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500"
      case "encerrado":
        return "border-red-500/30 text-red-400 bg-red-500/5 cursor-not-allowed opacity-70"
      case "futuro":
        return "border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500"
      default:
        return "border-[#9FFF00]/30 text-[#9FFF00]"
    }
  }

  // Funções para verificar permissões baseadas no status
  const canEdit = (status: LotteryEditionStatus) => {
    return status === "futuro"
  }

  const canDelete = (status: LotteryEditionStatus) => {
    return status === "futuro"
  }

  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false)
  const [selectedEditionForTickets, setSelectedEditionForTickets] = useState<{
    id: string
    name: string
    status: LotteryEditionStatus
  } | null>(null)

  const handleViewTickets = (edition: LotteryEdition) => {
    setSelectedEditionForTickets({ id: edition.id, name: edition.name, status: edition.status })
    setIsTicketsModalOpen(true)
  }

  return (
    <div className="bg-[#0D1117] rounded-lg shadow-md overflow-hidden border border-[#9FFF00]/10">
      <Table className="min-w-full">
        <TableHeader className="bg-[#1A2430]">
          <TableRow className="border-[#9FFF00]/10">
            <TableHead className="text-gray-300 text-center">Nome da Edição</TableHead>
            <TableHead className="text-gray-300 text-center">Período</TableHead>
            <TableHead className="text-gray-300 text-center">Prêmio Sorteio</TableHead>
            <TableHead className="text-gray-300 text-center">Prêmios Instantâneos</TableHead>
            <TableHead className="text-gray-300 text-center">Status</TableHead>
            <TableHead className="text-gray-300 text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-[#191F26] divide-y divide-[#232A34]">
          {editions.length === 0 ? (
            <TableRow key="no-data">
              <TableCell colSpan={6} className="text-center text-white py-4">
                Nenhuma edição encontrada para o status selecionado.
              </TableCell>
            </TableRow>
          ) : (
            editions.map((edition) => (
              <TableRow key={`row-${edition.id}`} className="border-[#9FFF00]/10 hover:bg-[#1A2430]">
                <TableCell key={`name-${edition.id}`} className="font-medium text-white text-center">
                  {edition.editionNumber && (
                    <span className="text-[#9FFF00] font-bold mr-2">#{edition.editionNumber}</span>
                  )}
                  {edition.name}
                </TableCell>
                <TableCell key={`period-${edition.id}`} className="text-gray-300 text-center">
                  {formatDateDisplay(edition.startDate)} até {formatDateDisplay(edition.endDate)}
                </TableCell>
                <TableCell key={`prize-${edition.id}`} className="text-gray-300 text-center">{formatCurrency(edition.lotteryPrize)}</TableCell>
                <TableCell key={`instant-${edition.id}`} className="text-gray-300 text-center">{formatCurrency(edition.instantPrizes)}</TableCell>
                <TableCell key={`status-${edition.id}`} className="text-center flex items-center justify-center">
                  {/* Dropdown for status, replacing the Badge */}
                  <Select
                    key={`select-${edition.id}`}
                    onValueChange={(value: LotteryEditionStatus) => onStatusChange(edition.id, value)}
                    value={edition.status}
                    disabled={edition.status === "encerrado"}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-[120px] bg-[#1A2430] border-[#9FFF00]/10 text-white",
                        getSelectTriggerClass(edition.status),
                      )}
                    >
                      <SelectValue placeholder="Mudar Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D1117] border-[#9FFF00]/10 text-white">
                      <SelectItem
                        key={`status-futuro-${edition.id}`}
                        value="futuro"
                        className="data-[state=checked]:bg-blue-500/20 data-[highlighted]:bg-blue-500/10"
                      >
                        Futuro
                      </SelectItem>
                      <SelectItem
                        key={`status-ativo-${edition.id}`}
                        value="ativo"
                        className="data-[state=checked]:bg-green-500/20 data-[highlighted]:bg-green-500/10"
                      >
                        Ativo
                      </SelectItem>
                      <SelectItem
                        key={`status-encerrado-${edition.id}`}
                        value="encerrado"
                        className="data-[state=checked]:bg-red-500/20 data-[highlighted]:bg-red-500/10"
                      >
                        Encerrado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell key={`actions-${edition.id}`} className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      key={`edit-${edition.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(edition)}
                      disabled={!canEdit(edition.status)}
                      className={cn(
                        "hover:bg-transparent",
                        canEdit(edition.status)
                          ? "text-gray-400 hover:text-[#9FFF00]"
                          : "text-gray-600 cursor-not-allowed opacity-50"
                      )}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      key={`tickets-${edition.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewTickets(edition)}
                      className="text-gray-400 hover:text-[#9FFF00] hover:bg-transparent"
                    >
                      <Ticket className="h-4 w-4" />
                      <span className="sr-only">Ver Títulos</span>
                    </Button>
                    <Button
                      key={`delete-${edition.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(edition.id)}
                      disabled={!canDelete(edition.status)}
                      className={cn(
                        "hover:bg-transparent",
                        canDelete(edition.status)
                          ? "text-red-400 hover:text-red-500"
                          : "text-gray-600 cursor-not-allowed opacity-50"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedEditionForTickets && (
        <LotteryTicketsModal
          isOpen={isTicketsModalOpen}
          onClose={() => setIsTicketsModalOpen(false)}
          editionName={selectedEditionForTickets.name}
          editionId={selectedEditionForTickets.id}
          editionStatus={selectedEditionForTickets.status}
        />
      )}
    </div>
  )
}
