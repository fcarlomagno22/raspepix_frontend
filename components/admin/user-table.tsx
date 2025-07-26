"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Eye, Check, X, ChevronLeft, ChevronRight, ArrowUpDown, Loader2 } from "lucide-react"
import { formatCPF, formatCurrency, formatDate } from "@/lib/utils"
import { UserDetailDrawer } from "./user-detail-drawer" // Importar o novo drawer

interface User {
  id: string
  nome_completo: string
  email: string
  cpf: string
  created_at: string // ISO string
  total_deposited: number
  total_lucky_numbers: number
  total_prizes_received: number
  saldo_sacavel: number
  last_active_edition: string
  is_active: boolean
  is_influencer: boolean
}

interface UserTableProps {
  users: User[]
}

interface LuckyNumberPurchase {
  id: string
  date: string
  edition: string
  quantity: number
  value: number
}

interface Prize {
  id: string
  date: string
  edition: string
  type: string
  game_name: string
  value: number
  status: string
}

const ITEMS_PER_PAGE = 10

export default function UserTable({ users: initialUsers }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativos" | "bloqueados">("todos")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<keyof User | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>(initialUsers) // Estado interno para permitir modificações

  // Novos estados para o drawer de detalhes do usuário
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerUser, setDrawerUser] = useState<User | null>(null)
  const [userLuckyNumbers, setUserLuckyNumbers] = useState<LuckyNumberPurchase[]>([])
  const [userPrizes, setUserPrizes] = useState<Prize[]>([])

  // Filtragem e Ordenação
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cpf.includes(searchTerm)

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "ativos" && user.is_active) ||
        (statusFilter === "bloqueados" && !user.is_active)

      return matchesSearch && matchesStatus
    })

    if (sortColumn) {
      filtered = filtered.sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue
        }
        // Fallback for boolean or other types
        if (aValue === bValue) return 0
        if (sortDirection === "asc") {
          return aValue ? -1 : 1
        } else {
          return aValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [users, searchTerm, statusFilter, sortColumn, sortDirection])

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredAndSortedUsers.slice(startIndex, endIndex)
  }, [filteredAndSortedUsers, currentPage])

  const handlePageChange = (page: number) => {
    setIsLoading(true)
    setTimeout(() => {
      setCurrentPage(page)
      setIsLoading(false)
    }, 300)
  }

  const handleSort = (column: keyof User) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleToggleActive = (userId: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, is_active: !user.is_active } : user)),
      )
      setIsLoading(false)
    }, 500)
  }

  const handleToggleInfluencer = (userId: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, is_influencer: !user.is_influencer } : user)),
      )
      setIsLoading(false)
    }, 500)
  }

  // Função para abrir o drawer de detalhes do usuário
  const openUserDrawer = (user: User) => {
    setDrawerUser(user)
    setIsDrawerOpen(true)
    // Carregar dados mockados (ou reais, se houver uma API)
    // Estes mocks devem ser os mesmos definidos em user-detail-drawer.tsx
    setUserLuckyNumbers([
      { id: "1", date: "2025-06-15T10:30:00Z", edition: "12/06/2025 - 19/06/2025", quantity: 10, value: 50.0 },
      { id: "2", date: "2025-06-13T14:20:00Z", edition: "12/06/2025 - 19/06/2025", quantity: 5, value: 25.0 },
      { id: "3", date: "2025-06-08T09:15:00Z", edition: "05/06/2025 - 12/06/2025", quantity: 15, value: 75.0 },
    ])
    setUserPrizes([
      {
        id: "1",
        date: "2025-06-15T16:45:00Z",
        edition: "12/06/2025 - 19/06/2025",
        type: "raspadinha",
        game_name: "Raspadinha Gold",
        value: 1000.0,
        status: "paid",
      },
      {
        id: "2",
        date: "2025-06-14T20:30:00Z",
        edition: "12/06/2025 - 19/06/2025",
        type: "sorteio",
        game_name: "Sorteio Semanal",
        value: 250.0,
        status: "pending",
      },
      {
        id: "3",
        date: "2025-06-08T11:20:00Z",
        edition: "05/06/2025 - 12/06/2025",
        type: "raspadinha",
        game_name: "Raspadinha Silver",
        value: 25.0,
        status: "paid",
      },
    ])
  }

  const renderSortIcon = (column: keyof User) => {
    if (sortColumn !== column) return null
    return sortDirection === "asc" ? (
      <ArrowUpDown className="ml-1 h-3 w-3 text-[#9FFF00]" />
    ) : (
      <ArrowUpDown className="ml-1 h-3 w-3 text-[#9FFF00]" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset page on search
            }}
            className="pl-10 bg-[#232D3F] border-[#9FFF00]/10 text-white h-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: "todos" | "ativos" | "bloqueados") => {
            setStatusFilter(value)
            setCurrentPage(1) // Reset page on filter change
          }}
        >
          <SelectTrigger className="w-[180px] bg-[#232D3F] border-[#9FFF00]/10 text-white h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#232D3F] text-white border-[#9FFF00]/10">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativos">Ativos</SelectItem>
            <SelectItem value="bloqueados">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Usuários */}
      <div className="rounded-md border border-[#366D51] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#1A2430]">
              <TableRow className="border-[#366D51]">
                <TableHead
                  className="text-white cursor-pointer text-center flex items-center justify-center"
                  onClick={() => handleSort("nome_completo")}
                >
                  Nome Completo {renderSortIcon("nome_completo")}
                </TableHead>
                <TableHead className="text-white cursor-pointer text-center" onClick={() => handleSort("email")}>
                  E-mail {renderSortIcon("email")}
                </TableHead>
                <TableHead className="text-white cursor-pointer text-center" onClick={() => handleSort("cpf")}>
                  CPF {renderSortIcon("cpf")}
                </TableHead>
                <TableHead className="text-white cursor-pointer text-center" onClick={() => handleSort("created_at")}>
                  Data de Cadastro {renderSortIcon("created_at")}
                </TableHead>
                <TableHead
                  className="text-white cursor-pointer text-center"
                  onClick={() => handleSort("total_deposited")}
                >
                  Total Depositado {renderSortIcon("total_deposited")}
                </TableHead>
                <TableHead
                  className="text-white cursor-pointer text-center"
                  onClick={() => handleSort("total_lucky_numbers")}
                >
                  Números da Sorte {renderSortIcon("total_lucky_numbers")}
                </TableHead>
                <TableHead
                  className="text-white cursor-pointer text-center"
                  onClick={() => handleSort("total_prizes_received")}
                >
                  Prêmios Recebidos {renderSortIcon("total_prizes_received")}
                </TableHead>
                <TableHead
                  className="text-white cursor-pointer text-center"
                  onClick={() => handleSort("saldo_sacavel")}
                >
                  Saldo Sacável {renderSortIcon("saldo_sacavel")}
                </TableHead>
                <TableHead
                  className="text-white cursor-pointer text-center"
                  onClick={() => handleSort("last_active_edition")}
                >
                  Última Edição Ativa {renderSortIcon("last_active_edition")}
                </TableHead>
                <TableHead className="text-white cursor-pointer text-center" onClick={() => handleSort("is_active")}>
                  Status {renderSortIcon("is_active")}
                </TableHead>
                <TableHead className="text-white text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#232D3F] divide-y divide-[#366D51]">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-40 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#9FFF00] mx-auto" />
                    <p className="text-gray-400 mt-2">Carregando usuários...</p>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-40 text-center text-gray-400">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-[#2A3547] transition-colors">
                    <TableCell className="font-medium text-white flex items-center justify-center text-xs">
                      {user.nome_completo}
                      {user.is_influencer && <Star className="ml-2 h-3 w-3 text-yellow-400" title="Influencer" />}
                    </TableCell>
                    <TableCell className="text-gray-300 text-xs text-center">{user.email}</TableCell>
                    <TableCell className="text-gray-300 text-xs text-center">{formatCPF(user.cpf)}</TableCell>
                    <TableCell className="text-gray-300 text-xs text-center">{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-gray-300 text-xs text-center">
                      {formatCurrency(user.total_deposited)}
                    </TableCell>
                    <TableCell className="text-gray-300 text-xs text-center">
                      {user.total_lucky_numbers.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-gray-300 text-xs text-center">
                      {formatCurrency(user.total_prizes_received)}
                    </TableCell>
                    <TableCell className="text-gray-300 text-xs text-center">
                      {formatCurrency(user.saldo_sacavel)}
                    </TableCell>
                    <TableCell className="text-gray-300 text-xs text-center">{user.last_active_edition}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`px-2 py-1 rounded-full text-xs font-medium w-20 text-center flex items-center justify-center ${
                          user.is_active ? "bg-[#9FFF00]/20 text-[#9FFF00]" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {user.is_active ? "Ativo" : "Bloqueado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:bg-[#9FFF00]/10 hover:text-[#9FFF00]"
                          onClick={() => handleToggleActive(user.id)}
                          title={user.is_active ? "Bloquear Usuário" : "Ativar Usuário"}
                        >
                          {user.is_active ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                          <span className="sr-only">{user.is_active ? "Bloquear" : "Ativar"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:bg-yellow-400/10 hover:text-yellow-400"
                          onClick={() => handleToggleInfluencer(user.id)}
                          title={user.is_influencer ? "Remover Influencer" : "Tornar Influencer"}
                        >
                          <Star className="h-3 w-3" />
                          <span className="sr-only">
                            {user.is_influencer ? "Remover Influencer" : "Tornar Influencer"}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:bg-blue-400/10 hover:text-blue-400"
                          title="Ver Detalhes"
                          onClick={() => openUserDrawer(user)} // Adicione esta linha
                        >
                          <Eye className="h-3 w-3" />
                          <span className="sr-only">Ver Detalhes</span>
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
        <div className="flex items-center justify-between p-3 bg-[#1A2430] rounded-xl shadow-lg">
          <span className="text-sm text-gray-400">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:bg-[#9FFF00]/10 hover:text-[#9FFF00]"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Anterior</span>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                className={`h-8 w-8 rounded-md ${
                  currentPage === page
                    ? "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-[#191F26] font-bold"
                    : "text-gray-400 hover:bg-[#9FFF00]/10 hover:text-[#9FFF00]"
                }`}
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:bg-[#9FFF00]/10 hover:text-[#9FFF00]"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Próximo</span>
            </Button>
          </div>
        </div>
      )}

      {/* Drawer de Detalhes do Usuário */}
      <UserDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={drawerUser}
        luckyNumbers={userLuckyNumbers}
        prizes={userPrizes}
      />
    </div>
  )
}
