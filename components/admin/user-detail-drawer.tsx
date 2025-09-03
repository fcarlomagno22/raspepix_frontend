"use client"
import { useMemo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Trophy, TrendingUp } from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { formatCPF, formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils" // Importar cn para combinar classes

// Interfaces para os dados mockados
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
  type: "raspadinha" | "sorteio"
  game_name: string
  value: number
  status: "pending" | "paid"
}

import type { User } from "./user-table"

interface UserDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  luckyNumbers: LuckyNumberPurchase[]
  prizes: Prize[]
}

export function UserDetailDrawer({
  isOpen,
  onClose,
  user: drawerUser,
  luckyNumbers: userLuckyNumbers,
  prizes: userPrizes,
}: UserDetailDrawerProps) {
  // Estatísticas calculadas
  const statistics = useMemo(() => {
    if (!drawerUser) {
      return []
    }
    return [
      {
        label: "Total de Compras:",
        value: userLuckyNumbers.length,
      },
      {
        label: "Total de Prêmios:",
        value: userPrizes.length,
      },
      {
        label: "Prêmios Raspadinha:",
        value: userPrizes.filter((p) => p.type === "raspadinha").length,
      },
      {
        label: "Prêmios Sorteio:",
        value: userPrizes.filter((p) => p.type === "sorteio").length,
      },
    ]
  }, [drawerUser, userLuckyNumbers, userPrizes])

  const financialFields = [
    {
      label: "Total Depositado:",
      value: drawerUser ? formatCurrency(drawerUser.total_deposited || 0) : "N/A",
      className: "text-lg",
    },
    {
      label: "Total em Prêmios:",
      value: drawerUser ? formatCurrency(drawerUser.total_prizes_received || 0) : "N/A",
      className: "text-lg",
    },
    {
      label: "Números da Sorte:",
      value: drawerUser ? drawerUser.total_lucky_numbers || 0 : "N/A",
      className: "text-lg",
    },
    {
      label: "Saldo Sacável:",
      value: drawerUser ? formatCurrency(drawerUser.saldo_sacavel || 0) : "N/A",
      className: "text-lg",
    },
  ]

  if (!drawerUser) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[50vw] bg-[#232A34] border-[#366D51] text-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-white">{drawerUser?.full_name}</SheetTitle>
          <SheetDescription className="text-gray-400">Histórico detalhado de compras e prêmios</SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-6">
          {/* 1. INFORMAÇÕES DO CLIENTE */}
          <div className="bg-[#1A2430] p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Informações do Cliente</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">CPF:</span>
                <p className="text-white font-medium">{formatCPF(drawerUser.cpf)}</p>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <p className="text-white font-medium">{drawerUser.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Cadastro:</span>
                  <p className="text-white font-medium">
                    {drawerUser.created_at 
                      ? format(new Date(drawerUser.created_at), "dd/MM/yyyy", { locale: ptBR })
                      : "Data não disponível"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <Badge
                    className={cn(
                      "ml-2",
                      drawerUser.is_active ? "bg-[#9FFF00]/20 text-[#9FFF00]" : "bg-red-500/20 text-red-400",
                    )}
                  >
                    {drawerUser.is_active ? "Ativo" : "Bloqueado"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 2. RESUMO FINANCEIRO */}
          <div className="bg-[#1A2430] p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Resumo Financeiro</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {financialFields.map((field, index) => (
                <div key={index}>
                  <span className="text-gray-400">{field.label}</span>
                  <p className={cn("text-white font-medium", field.className)}>{field.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. HISTÓRICO DE COMPRAS DE NÚMEROS DA SORTE */}
          <div className="bg-[#1A2430] p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#9FFF00]" /> Histórico de Compras de Números da Sorte
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {userLuckyNumbers.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhuma compra de número da sorte encontrada.</p>
              ) : (
                userLuckyNumbers.map((purchase) => (
                  <div key={purchase.id} className="bg-[#232D3F] p-4 rounded-lg border border-[#366D51] shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-white font-semibold text-base">{purchase.quantity} números</p>
                      <p className="text-[#9FFF00] font-bold text-lg">{formatCurrency(purchase.value)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>Edição: {purchase.edition}</span>
                      <span>
                        {purchase.date 
                          ? format(new Date(purchase.date), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "Data não disponível"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. HISTÓRICO DE PRÊMIOS */}
          <div className="bg-[#1A2430] p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#9FFF00]" /> Histórico de Prêmios
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {userPrizes.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum prêmio encontrado.</p>
              ) : (
                userPrizes.map((prize) => (
                  <div key={prize.id} className="bg-[#232D3F] p-4 rounded-lg border border-[#366D51] shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-semibold text-base mb-1">{prize.game_name}</p>
                        <p className="text-gray-400 text-sm">{prize.edition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#9FFF00] font-bold text-lg">{formatCurrency(prize.value)}</p>
                        <p className="text-gray-400 text-sm">
                          {prize.date 
                            ? format(new Date(prize.date), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : "Data não disponível"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        className={cn(
                          prize.type === "raspadinha"
                            ? "bg-[#9FFF00]/20 text-[#9FFF00]"
                            : "bg-gray-500/20 text-gray-400",
                        )}
                      >
                        {prize.type === "raspadinha" ? "Raspadinha" : "Sorteio"}
                      </Badge>
                      <Badge
                        className={cn(
                          prize.status === "paid"
                            ? "bg-[#9FFF00]/20 text-[#9FFF00]"
                            : "bg-yellow-500/20 text-yellow-400",
                        )}
                      >
                        {prize.status === "paid" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 5. ESTATÍSTICAS */}
          <div className="bg-[#1A2430] p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Estatísticas
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {statistics.map((stat, index) => (
                <div key={index}>
                  <span className="text-gray-400">{stat.label}</span>
                  <p className="text-white font-medium">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
