"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, User, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { listInfluencers, Influencer as APIInfluencer } from "@/services/influencers"
import { Loader2 } from "lucide-react"

interface Influencer extends APIInfluencer {}

interface InfluencerSelectionModalProps {
  open: boolean
  onClose: () => void
  onSelect: (influencer: Influencer) => void
}

export function InfluencerSelectionModal({
  open,
  onClose,
  onSelect,
}: InfluencerSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 10 // 5 linhas x 2 colunas

  useEffect(() => {
    async function loadInfluencers() {
      try {
        setIsLoading(true)
        const data = await listInfluencers()
        setInfluencers(data)
      } catch (error) {
        console.error("Erro ao carregar influencers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      loadInfluencers()
    }
  }, [open])

  const filteredInfluencers = influencers.filter(
    (influencer) =>
      influencer.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.codigo_influencer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredInfluencers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInfluencers = filteredInfluencers.slice(startIndex, startIndex + itemsPerPage)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  // Reset para primeira página quando o termo de busca mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#232A34] border-[#366D51] text-white max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#9FFF00]">Selecionar Influencer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#9FFF00]" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-11 bg-[#1A2430] border-[#366D51] text-white text-lg focus:border-[#9FFF00] focus:ring-1 focus:ring-[#9FFF00]"
            />
          </div>

          <ScrollArea className="h-[500px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-[#9FFF00]" />
              </div>
            ) : paginatedInfluencers.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Nenhum influencer encontrado
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {paginatedInfluencers.map((influencer) => (
                <Button
                  key={influencer.id}
                  variant="outline"
                  className="relative h-auto p-4 justify-start text-left bg-[#1A2430] border-[#366D51] hover:bg-[#2A3440] hover:border-[#9FFF00] group transition-all duration-200"
                  onClick={() => {
                    onSelect(influencer)
                    onClose()
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="h-10 w-10 rounded-full bg-[#366D51] flex items-center justify-center group-hover:bg-[#9FFF00] transition-colors duration-200">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-lg mb-1">{influencer.nome}</div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <CreditCard className="h-4 w-4" />
                        <span>Código: {influencer.codigo_influencer}</span>
                      </div>
                      <div 
                        className={`absolute bottom-3 right-3 h-3 w-3 rounded-full ${
                          influencer.status === 'ativo' 
                            ? 'bg-[#9FFF00]' 
                            : 'bg-[#FFE600]'
                        }`}
                        title={influencer.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      />
                    </div>
                    <Badge 
                      variant="outline" 
                      className="absolute top-3 right-3 border-[#366D51] text-[#9FFF00] group-hover:border-[#9FFF00]"
                    >
                      Selecionar
                    </Badge>
                  </div>
                </Button>
              ))}
              </div>
            )}
          </ScrollArea>

          {/* Paginação */}
          <div className="flex items-center justify-between border-t border-[#366D51] pt-4">
            <div className="text-sm text-gray-400">
              Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredInfluencers.length)} de {filteredInfluencers.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="bg-[#1A2430] border-[#366D51] text-white hover:bg-[#2A3440] hover:border-[#9FFF00] disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="text-sm text-gray-400 px-4">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="bg-[#1A2430] border-[#366D51] text-white hover:bg-[#2A3440] hover:border-[#9FFF00] disabled:opacity-50"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}