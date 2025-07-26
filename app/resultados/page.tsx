"use client"

import { useState, useMemo } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { mockWinnerResults, formatWinnerName, maskCpfForDisplay } from "@/lib/mock-results-data"
import { formatCurrency } from "@/lib/utils"

const ITEMS_PER_PAGE = 10 // Same as AffiliateExtractTab

export default function ResultadosPage() {
  const [selectedEdition, setSelectedEdition] = useState("Todas as Edições")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const editions = useMemo(() => {
    const uniqueEditions = new Set(mockWinnerResults.map((winner) => winner.edition))
    return ["Todas as Edições", ...Array.from(uniqueEditions)].sort()
  }, [])

  const filteredWinners = useMemo(() => {
    if (selectedEdition === "Todas as Edições") {
      return mockWinnerResults
    }
    return mockWinnerResults.filter((winner) => winner.edition === selectedEdition)
  }, [selectedEdition])

  // Paginação
  const totalPages = Math.ceil(filteredWinners.length / ITEMS_PER_PAGE)
  const paginatedWinners = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredWinners.slice(startIndex, endIndex)
  }, [filteredWinners, currentPage])

  const handlePageChange = (page: number) => {
    setIsLoading(true)
    setTimeout(() => {
      setCurrentPage(page)
      setIsLoading(false)
    }, 300) // Simulate loading
  }

  const handleEditionChange = (value: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setSelectedEdition(value)
      setCurrentPage(1) // Reset to first page on filter change
      setIsLoading(false)
    }, 300) // Simulate loading
  }

  return (
    <AuthenticatedLayout>
      <main className="flex-1 pt-4 pb-36 px-4 max-w-md mx-auto w-full">
        <h1 className="text-xl font-bold text-center text-white mb-6">Resultados dos Sorteios</h1>

        {/* Filtros de Edição */}
        <div className="bg-[#1E2530] rounded-xl p-4 mb-4 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Filtros</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-[#191F26] text-white border-gray-700 focus:ring-[#9FFF00] focus:border-[#9FFF00] flex justify-between items-center"
              >
                {selectedEdition}
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-[#191F26] text-white border-gray-700">
              {editions.map((edition) => (
                <DropdownMenuItem
                  key={edition}
                  onClick={() => handleEditionChange(edition)}
                  className="cursor-pointer hover:bg-[#1a323a]"
                >
                  {edition}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Lista de Ganhadores */}
        <div className="bg-[#1E2530] rounded-xl p-4 mb-4 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4 text-center">Ganhadores</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-[#9FFF00]" />
            </div>
          ) : paginatedWinners.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              Nenhum ganhador encontrado para o período selecionado.
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedWinners.map((winner, index) => (
                <div
                  key={winner.id}
                  className={`flex flex-col p-3 bg-[#1a323a] rounded-lg
                    ${index < paginatedWinners.length - 1 ? "border-b border-gray-800 pb-3" : ""}
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-white">{formatWinnerName(winner.name)}</p>
                    <p className="text-sm font-medium text-[#9FFF00]">{formatCurrency(winner.prizeValue)}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>CPF: {maskCpfForDisplay(winner.cpf)}</span>
                    <span>Número da Sorte: {winner.luckyNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                    <span>Tipo: {winner.prizeType}</span>
                    <span>Edição: {winner.edition}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="border-t border-gray-800 flex justify-between items-center p-3 bg-[#1E2530] rounded-xl shadow-lg mb-36">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:bg-[#1a323a] hover:text-white"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Anterior</span>
            </Button>
            <span className="text-sm text-gray-400">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:bg-[#1a323a] hover:text-white"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Próximo</span>
            </Button>
          </div>
        )}
      </main>
    </AuthenticatedLayout>
  )
}
