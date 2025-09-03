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
import { ChevronLeft, ChevronRight } from "lucide-react"

type NetworkSource = "secondary" | "expanded"

interface Transaction {
  id: string
  date: string
  customerName: string
  deposit: number
  commission: number
  networkSource: NetworkSource
}

import { useNetwork } from "@/hooks/use-network"

const ITEMS_PER_PAGE = 25

export function NetworkTransactionsList() {
  const [currentPage, setCurrentPage] = useState(1)
  const { networkTransactions, isLoading } = useNetwork()

  const transactions: Transaction[] = networkTransactions?.map(t => ({
    id: `${t.data}-${t.cliente}`,
    date: new Date(t.data).toLocaleDateString('pt-BR'),
    customerName: t.cliente,
    deposit: t.valor_deposito,
    commission: t.valor_comissao,
    networkSource: t.tipo_indicacao === "Rede Secundária" ? "secondary" : "expanded"
  })) || []
  
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTransactions = transactions.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#366D51] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-[#366D51]">
              <TableHead className="text-center font-semibold text-[#9FFF00]">Data</TableHead>
              <TableHead className="text-center font-semibold text-[#9FFF00]">Cliente</TableHead>
              <TableHead className="text-center font-semibold text-[#9FFF00]">Depósito</TableHead>
              <TableHead className="text-center font-semibold text-[#9FFF00]">Comissão</TableHead>
              <TableHead className="text-center font-semibold text-[#9FFF00]">Origem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.map((transaction) => (
              <TableRow 
                key={transaction.id}
                className="hover:bg-[#1E2530] transition-colors"
              >
                <TableCell className="text-center">{transaction.date}</TableCell>
                <TableCell className="text-center">{transaction.customerName}</TableCell>
                <TableCell className="text-center font-medium">
                  {formatCurrency(transaction.deposit)}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {formatCurrency(transaction.commission)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={`
                      ${transaction.networkSource === "secondary"
                        ? "border-blue-500 text-blue-500 bg-blue-500/10"
                        : "border-purple-500 text-purple-500 bg-purple-500/10"
                      }
                      px-3 py-1 min-w-[120px]
                    `}
                  >
                    {transaction.networkSource === "secondary"
                      ? "Rede Secundária"
                      : "Indicação Direta"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-400">
          Mostrando {startIndex + 1}-{Math.min(endIndex, transactions.length)} de {transactions.length}
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
    </div>
  )
}