"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CancelWithdrawModal } from "./cancel-withdraw-modal"

import { WithdrawRequest, fetchWithdrawRequests, cancelWithdrawRequest } from "@/services/saques"
import { useEffect } from "react"
import { toast } from "sonner"

type WithdrawStatus = "pendente" | "aprovado" | "reprovado" | "cancelado"

const ITEMS_PER_PAGE = 25

export function WithdrawRequestsList() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null)
  const [cancelRequest, setCancelRequest] = useState<WithdrawRequest | null>(null)
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const loadWithdrawRequests = async () => {
      try {
        setIsLoading(true)
        const response = await fetchWithdrawRequests()
        setWithdrawRequests(response.data)
        setTotal(response.total)
        setError(null)
      } catch (err) {
        setError("Erro ao carregar solicitações de saque")
        console.error("Erro ao carregar solicitações:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadWithdrawRequests()
  }, [])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentRequests = withdrawRequests.slice(startIndex, endIndex)

  const handleCancelWithdraw = async () => {
    if (!cancelRequest) return

    try {
      await cancelWithdrawRequest(cancelRequest.id)
      toast.success("Solicitação de saque cancelada com sucesso")
      
      // Recarrega a lista de solicitações
      const response = await fetchWithdrawRequests()
      setWithdrawRequests(response.data)
      setTotal(response.total)
    } catch (err) {
      console.error("Erro ao cancelar solicitação:", err)
      toast.error("Erro ao cancelar solicitação de saque")
    } finally {
      setCancelRequest(null)
    }
  }

  const getStatusBadgeStyle = (status: WithdrawStatus) => {
    switch (status) {
      case "pendente":
        return "border-yellow-500 text-yellow-500 bg-yellow-500/10 min-w-[120px] flex justify-center"
      case "aprovado":
        return "border-green-500 text-green-500 bg-green-500/10 min-w-[120px] flex justify-center"
      case "reprovado":
        return "border-red-500 text-red-500 bg-red-500/10 min-w-[120px] cursor-pointer flex justify-center"
      case "cancelado":
        return "border-gray-500 text-gray-500 bg-gray-500/10 min-w-[120px] flex justify-center"
    }
  }

  const getStatusText = (status: WithdrawStatus) => {
    switch (status) {
      case "pendente":
        return "Pendente"
      case "aprovado":
        return "Aprovado"
      case "reprovado":
        return "Reprovado"
      case "cancelado":
        return "Cancelado"
    }
  }

  const handleStatusClick = (request: WithdrawRequest) => {
    if (request.status === "reprovado") {
      setSelectedRequest(request)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-[#9FFF00] animate-spin" />
          <p className="text-gray-400">Carregando solicitações...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#9FFF00] text-[#191F26] hover:bg-[#8FEF00]"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#366D51] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-[#366D51]">
              <TableHead className="text-center font-semibold text-[#9FFF00]">Data</TableHead>
              <TableHead className="text-center font-semibold text-[#9FFF00]">Valor</TableHead>
              <TableHead className="text-center font-semibold text-[#9FFF00]">Status</TableHead>
              <TableHead className="text-center font-semibold text-[#9FFF00]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRequests.map((request) => (
              <TableRow 
                key={request.id}
                className="hover:bg-[#1E2530] transition-colors"
              >
                <TableCell className="text-center">
                  {new Date(request.data_solicitacao).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {formatCurrency(request.valor)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Badge
                      variant="outline"
                      className={getStatusBadgeStyle(request.status)}
                      onClick={() => handleStatusClick(request)}
                    >
                      {getStatusText(request.status)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {request.status === "pendente" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                        onClick={() => setCancelRequest(request)}
                      >
                        Cancelar Saque
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CancelWithdrawModal
        open={!!cancelRequest}
        onClose={() => setCancelRequest(null)}
        onConfirm={handleCancelWithdraw}
        amount={cancelRequest?.amount}
      />

      {/* Paginação */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-400">
          Mostrando {startIndex + 1}-{Math.min(endIndex, total)} de {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="hover:bg-[#1E2530] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-400 min-w-[100px] text-center">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="hover:bg-[#1E2530] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal de Motivo de Recusa */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="bg-[#232A34] border border-[#366D51] text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Motivo da Recusa
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300">{selectedRequest?.rejectionReason}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}