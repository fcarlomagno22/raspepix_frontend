"use client"

import { useState, useMemo, useEffect } from "react"
import { api } from "@/services/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import AuthenticatedLayout from "@/components/authenticated-layout"

import { formatCurrency } from "@/lib/utils"

const ITEMS_PER_PAGE = 10 // Same as AffiliateExtractTab

export default function ResultadosPage() {
  const [selectedEdition, setSelectedEdition] = useState("Todas as Edições")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [winners, setWinners] = useState([])

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.get('/api/ganhadores')
        
        if (!response.data || !response.data.data) {
          throw new Error('Formato de resposta inválido')
        }
        
        setWinners(response.data.data)
      } catch (error: any) {
        console.error('Erro ao buscar ganhadores:', error)
        setError(error?.message || 'Erro ao carregar os resultados')
        setWinners([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWinners()
  }, [])

  const editions = useMemo(() => {
    const uniqueEditions = new Set(winners.map((winner) => winner.edicao))
    return ["Todas as Edições", ...Array.from(uniqueEditions)].sort()
  }, [winners])

  const filteredWinners = useMemo(() => {
    if (selectedEdition === "Todas as Edições") {
      return winners
    }
    return winners.filter((winner) => winner.edicao === selectedEdition)
  }, [selectedEdition, winners])

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
          ) : error ? (
            <div className="text-center text-red-400 py-10">
              {error}
            </div>
          ) : paginatedWinners.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              Nenhum ganhador encontrado para o período selecionado.
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedWinners.map((winner, index) => (
                <div
                  key={`${winner.cpf}-${winner.numero_titulo}-${index}`}
                  className="group relative overflow-hidden bg-gradient-to-br from-[#1a323a] to-[#1E2530] rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#9FFF00]/10 border border-gray-800/50"
                >
                  {/* Badge do Tipo */}
                  <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-lg
                    ${winner.tipo === 'instantaneo' 
                      ? 'bg-purple-500/20 text-purple-300 border-l border-b border-purple-500/20' 
                      : 'bg-blue-500/20 text-blue-300 border-l border-b border-blue-500/20'}`}
                  >
                    {winner.tipo === 'instantaneo' ? 'Instantâneo' : 'Sorteio'}
                  </div>

                  {/* Informações Principais */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start mt-4">
                      <div>
                        <h3 className="text-white font-semibold">{winner.nome}</h3>
                        <p className="text-gray-400 text-sm">{winner.cpf}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#9FFF00] font-bold">
                          {`R$ ${Number(winner.valor_premio).toLocaleString('pt-BR', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}`}
                        </p>
                        <p className="text-gray-400 text-sm">Nº {winner.numero_titulo}</p>
                      </div>
                    </div>

                    {/* Detalhes Adicionais */}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{winner.edicao}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(winner.data_premiacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
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
