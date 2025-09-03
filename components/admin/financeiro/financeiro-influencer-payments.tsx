"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { ChevronUp, ChevronDown, CheckCircle2, XCircle, Mail, Eye } from "lucide-react"
import { toast } from "sonner"
import { addDays } from "date-fns"
import { formatCurrency } from "@/lib/utils"

interface WithdrawRequest {
  id: string
  influencerName: string
  amount: number
  requestDate: string
  status: "pending" | "approved" | "rejected"
  pixKey: string
}

interface SortConfig {
  key: keyof WithdrawRequest
  direction: "asc" | "desc"
}

// Dados mockados para exemplo
const mockWithdrawRequests: WithdrawRequest[] = [
  { id: "1", influencerName: "João Silva", amount: 1500.00, requestDate: "2024-02-20", status: "pending", pixKey: "joao@email.com" },
  { id: "2", influencerName: "Maria Santos", amount: 2300.00, requestDate: "2024-02-19", status: "approved", pixKey: "11999999999" },
  { id: "3", influencerName: "Pedro Oliveira", amount: 1800.00, requestDate: "2024-02-18", status: "rejected", pixKey: "123.456.789-00" },
  { id: "4", influencerName: "Ana Costa", amount: 3200.00, requestDate: "2024-02-20", status: "pending", pixKey: "ana.costa@email.com" },
  { id: "5", influencerName: "Lucas Mendes", amount: 4500.00, requestDate: "2024-02-19", status: "approved", pixKey: "11988888888" },
  { id: "6", influencerName: "Carla Souza", amount: 2800.00, requestDate: "2024-02-18", status: "pending", pixKey: "carla.souza@email.com" },
  { id: "7", influencerName: "Rafael Santos", amount: 1900.00, requestDate: "2024-02-17", status: "approved", pixKey: "11977777777" },
  { id: "8", influencerName: "Juliana Lima", amount: 3700.00, requestDate: "2024-02-16", status: "rejected", pixKey: "juliana.lima@email.com" },
  { id: "9", influencerName: "Fernando Silva", amount: 2600.00, requestDate: "2024-02-15", status: "pending", pixKey: "11966666666" },
  { id: "10", influencerName: "Mariana Costa", amount: 4200.00, requestDate: "2024-02-14", status: "approved", pixKey: "mariana@email.com" },
  { id: "11", influencerName: "Gabriel Oliveira", amount: 3100.00, requestDate: "2024-02-13", status: "pending", pixKey: "11955555555" },
  { id: "12", influencerName: "Beatriz Santos", amount: 2900.00, requestDate: "2024-02-12", status: "rejected", pixKey: "beatriz@email.com" },
  { id: "13", influencerName: "Thiago Lima", amount: 3800.00, requestDate: "2024-02-11", status: "approved", pixKey: "11944444444" },
  { id: "14", influencerName: "Carolina Silva", amount: 2400.00, requestDate: "2024-02-10", status: "pending", pixKey: "carolina@email.com" },
  { id: "15", influencerName: "Ricardo Souza", amount: 4100.00, requestDate: "2024-02-09", status: "approved", pixKey: "11933333333" },
  { id: "16", influencerName: "Amanda Costa", amount: 3300.00, requestDate: "2024-02-08", status: "rejected", pixKey: "amanda@email.com" },
  { id: "17", influencerName: "Bruno Santos", amount: 2700.00, requestDate: "2024-02-07", status: "pending", pixKey: "11922222222" },
  { id: "18", influencerName: "Larissa Lima", amount: 3900.00, requestDate: "2024-02-06", status: "approved", pixKey: "larissa@email.com" },
  { id: "19", influencerName: "Diego Oliveira", amount: 2500.00, requestDate: "2024-02-05", status: "pending", pixKey: "11911111111" },
  { id: "20", influencerName: "Isabela Silva", amount: 4300.00, requestDate: "2024-02-04", status: "rejected", pixKey: "isabela@email.com" },
  { id: "21", influencerName: "Matheus Costa", amount: 3400.00, requestDate: "2024-02-03", status: "approved", pixKey: "11900000000" },
  { id: "22", influencerName: "Camila Santos", amount: 2800.00, requestDate: "2024-02-02", status: "pending", pixKey: "camila@email.com" },
  { id: "23", influencerName: "Felipe Lima", amount: 3600.00, requestDate: "2024-02-01", status: "approved", pixKey: "11999999998" },
  { id: "24", influencerName: "Natália Souza", amount: 2200.00, requestDate: "2024-01-31", status: "rejected", pixKey: "natalia@email.com" },
  { id: "25", influencerName: "Leonardo Silva", amount: 4000.00, requestDate: "2024-01-30", status: "pending", pixKey: "11999999997" },
  { id: "26", influencerName: "Bianca Costa", amount: 3500.00, requestDate: "2024-01-29", status: "approved", pixKey: "bianca@email.com" },
  { id: "27", influencerName: "Gustavo Santos", amount: 2600.00, requestDate: "2024-01-28", status: "pending", pixKey: "11999999996" },
  { id: "28", influencerName: "Renata Lima", amount: 3800.00, requestDate: "2024-01-27", status: "rejected", pixKey: "renata@email.com" },
  { id: "29", influencerName: "Victor Oliveira", amount: 2900.00, requestDate: "2024-01-26", status: "approved", pixKey: "11999999995" },
  { id: "30", influencerName: "Fernanda Silva", amount: 4200.00, requestDate: "2024-01-25", status: "pending", pixKey: "fernanda@email.com" }
]

export default function FinanceiroInfluencerPayments() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchName, setSearchName] = useState("")

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "requestDate",
    direction: "desc",
  })
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [message, setMessage] = useState("")

  const { data: withdrawRequests = mockWithdrawRequests, isLoading } = useQuery({
    queryKey: ["withdrawRequests"],
    queryFn: async () => {
      // Implementar chamada à API aqui
      return mockWithdrawRequests
    },
  })

  const itemsPerPage = 25

  const handleSort = (key: keyof WithdrawRequest) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleApprove = (request: WithdrawRequest) => {
    // Implementar chamada à API aqui
    toast.success("Pagamento aprovado com sucesso!")
  }

  const handleReject = (request: WithdrawRequest) => {
    // Implementar chamada à API aqui
    toast.error("Pagamento rejeitado")
  }

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Por favor, insira uma mensagem")
      return
    }
    
    // Implementar chamada à API aqui
    toast.success("Mensagem enviada com sucesso!")
    setIsMessageDialogOpen(false)
    setMessage("")
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30" },
      approved: { label: "Aprovado", className: "bg-green-500/20 text-green-500 hover:bg-green-500/30" },
      rejected: { label: "Rejeitado", className: "bg-red-500/20 text-red-500 hover:bg-red-500/30" }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const filterRequests = (requests: WithdrawRequest[]) => {
    return requests.filter((request) => {
      const nameMatch = request.influencerName.toLowerCase().includes(searchName.toLowerCase())
      const requestDateObj = new Date(request.requestDate)
      const fromDate = dateRange.from ? new Date(dateRange.from) : null
      const toDate = dateRange.to ? new Date(dateRange.to) : null
      
      const dateMatch =
        (!fromDate || requestDateObj >= fromDate) && (!toDate || requestDateObj <= toDate)

      return nameMatch && dateMatch
    })
  }

  const sortRequests = (requests: WithdrawRequest[]) => {
    return [...requests].sort((a, b) => {
      if (sortConfig.key === "amount") {
        return sortConfig.direction === "asc" ? a.amount - b.amount : b.amount - a.amount
      }
      if (sortConfig.key === "requestDate") {
        const aDate = new Date(a.requestDate)
        const bDate = new Date(b.requestDate)
        return sortConfig.direction === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
      }
      return 0
    })
  }

  const filteredAndSortedRequests = sortRequests(filterRequests(withdrawRequests))
  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage)
  const currentRequests = filteredAndSortedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const SortIcon = ({ column }: { column: keyof WithdrawRequest }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 inline" />
    ) : (
      <ChevronDown className="h-4 w-4 inline" />
    )
  }

  return (
    <Card className="bg-[#232A34] border-[#366D51] shadow-md">
      <CardHeader>
        <CardTitle className="text-white">Solicitações de Saque</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Buscar por nome do influencer..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="bg-[#191F26] border-[#366D51] text-white"
                />
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#191F26]">
                    <TableRow className="border-[#366D51]">
                      <TableHead className="text-white text-center">Influencer</TableHead>
                      <TableHead className="text-white text-center">Chave PIX</TableHead>
                      <TableHead
                        className="text-white cursor-pointer text-center"
                        onClick={() => handleSort("requestDate")}
                      >
                        Data <SortIcon column="requestDate" />
                      </TableHead>
                      <TableHead
                        className="text-white cursor-pointer text-center"
                        onClick={() => handleSort("amount")}
                      >
                        Valor <SortIcon column="amount" />
                      </TableHead>
                      <TableHead className="text-white text-center">Status</TableHead>
                      <TableHead className="text-white text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRequests.map((request, index) => (
                      <TableRow key={`${request.id}-${index}`} className="border-[#366D51] hover:bg-[#191F26]">
                        <TableCell className="font-medium text-white text-center">{request.influencerName}</TableCell>
                        <TableCell className="text-gray-300 text-center">{request.pixKey}</TableCell>
                        <TableCell className="text-gray-300 text-center">{formatDate(request.requestDate)}</TableCell>
                        <TableCell className="text-white text-center">{formatCurrency(request.amount)}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            {request.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-500 hover:text-white hover:bg-green-500/20"
                                  onClick={() => handleApprove(request)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-white hover:bg-red-500/20"
                                  onClick={() => handleReject(request)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-500 hover:text-white hover:bg-blue-500/20"
                              onClick={() => {
                                setSelectedRequest(request)
                                setIsMessageDialogOpen(true)
                              }}
                            >
                              <Mail className="h-4 w-4" />
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
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedRequests.length)} de{" "}
                  {filteredAndSortedRequests.length} registros
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
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1
                    })
                    .map((page, index, array) => {
                      const uniqueKey = `page-${page}-${index}`
                      return (
                        <div key={uniqueKey} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-gray-400 px-2">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 ${
                              currentPage === page 
                                ? "bg-[#366D51] text-white" 
                                : "bg-[#191F26] border-[#366D51] text-white hover:bg-[#232A34]"
                            }`}
                          >
                            {page}
                          </Button>
                        </div>
                      )
                    })}
                  
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
            </>
          )}
        </div>
      </CardContent>

      {/* Modal de Mensagem */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="bg-[#232A34] text-white border border-[#366D51]">
          <DialogHeader>
            <DialogTitle>Enviar Mensagem para {selectedRequest?.influencerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="min-h-[100px] bg-[#0D1117] border-[#366D51] text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMessageDialogOpen(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white border-none"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}