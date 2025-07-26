"use client"

import { useState, useEffect } from "react"
import { Ticket, Clock, Calendar, Trophy, Zap, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { motion } from "framer-motion"
import { getTitulos, type Titulo } from "@/services/titulos"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

// Interface Edition (copiada de ganhadores/page.tsx)
interface Edition {
  id: string
  name: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

// Mock de Edições (copiado de ganhadores/page.tsx)
const mockEditions: Edition[] = [
  { id: "all", name: "Todas as Edições", startDate: "2023-01-01", endDate: "2025-12-31" },
  { id: "1", name: "Edição 1", startDate: "2024-01-01", endDate: "2024-01-31" },
  { id: "2", name: "Edição 2", startDate: "2024-02-01", endDate: "2024-02-29" },
  { id: "3", name: "Edição 3", startDate: "2024-03-01", endDate: "2024-03-31" },
  { id: "4", name: "Edição 4", startDate: "2024-04-01", endDate: "2024-04-30" },
  { id: "5", name: "Edição 5", startDate: "2024-05-01", endDate: "2024-05-31" },
  { id: "6", name: "Edição 6", startDate: "2024-06-01", endDate: "2024-06-30" },
]

// Formatação de data para o Select de Edições
const formatDateForEdition = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy")
}

// Componente CupomCard atualizado
function CupomCard({ titulo }: { titulo: Titulo }) {
  const isInstantaneo = titulo.tipo === "raspadinha";
  const isUtilizado = isInstantaneo && titulo.utilizado;
  
  // Define as classes base do card
  const cardClasses = titulo.tipo === "sorteio"
    ? titulo.ativo
      ? "bg-gray-800 border-gray-700 shadow-md"
      : "bg-gray-900/50 border-gray-800 opacity-60"
    : isUtilizado // Para números instantâneos
      ? "bg-gray-900/50 border-gray-800 opacity-60" // Ghost para utilizados
      : "bg-gray-800 border-gray-700 shadow-md"; // Normal para disponíveis

  // Define as cores dos ícones e números
  const iconColorClass = titulo.tipo === "sorteio"
    ? titulo.ativo ? "text-[#9FFF00]" : "text-gray-500"
    : isUtilizado ? "text-gray-500" : "text-[#9FFF00]";

  const numberColorClass = titulo.tipo === "sorteio"
    ? titulo.ativo ? "text-[#9FFF00]" : "text-gray-500"
    : isUtilizado ? "text-gray-500" : "text-[#9FFF00]";

  return (
    <div className={`relative rounded-lg p-4 border transition-all ${cardClasses}`}>
      {/* Badge de Contemplado */}
      {titulo.contemplado && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-xs font-bold border-2 border-yellow-300 shadow-lg flex items-center gap-1">
          <Trophy className="h-3 w-3" />
          Contemplado
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {titulo.tipo === "sorteio" ? (
            <Ticket className={`h-5 w-5 ${iconColorClass}`} />
          ) : (
            <Zap className={`h-5 w-5 ${iconColorClass}`} />
          )}
          <span className="text-sm text-white">
            {titulo.tipo === "sorteio" ? "Sorteio" : "Chance Instantânea"}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          {format(new Date(titulo.dataCompra), "dd/MM/yyyy HH:mm")}
        </p>
      </div>

      <div className="text-center mb-4">
        <p className={`text-3xl font-black tracking-wider ${numberColorClass}`}>{titulo.numero}</p>
        {titulo.contemplado && titulo.valorPremio && (
          <p className="mt-2 text-yellow-400 font-bold text-lg">{titulo.valorPremio}</p>
        )}
      </div>

      {/* Informações específicas para números instantâneos */}
      {isInstantaneo && (
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isUtilizado ? "bg-red-500/50" : "bg-green-500"}`} />
              <span className={isUtilizado ? "text-gray-500" : "text-gray-300"}>
                {isUtilizado ? "Já utilizado" : "Disponível"}
              </span>
            </div>
          </div>
          {titulo.dataUtilizacao && (
            <div className="text-center text-xs text-gray-500">
              Utilizado em: {format(new Date(titulo.dataUtilizacao), "dd/MM/yyyy HH:mm")}
            </div>
          )}
        </div>
      )}

      {/* Data do sorteio para números de sorteio */}
      {titulo.tipo === "sorteio" && titulo.dataSorteio && (
        <div className="flex items-center justify-center text-sm text-gray-300">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            Sorteio: {format(new Date(titulo.dataSorteio), "dd/MM/yyyy")}
          </span>
        </div>
      )}
    </div>
  )
}

export default function MyTitlesPage() {
  const [selectedEditionId, setSelectedEditionId] = useState("all")
  const [selectedTab, setSelectedTab] = useState("todos")
  const [page, setPage] = useState(1)

  const { data: titulosResponse, isLoading, error } = useQuery({
    queryKey: ["titulos", selectedEditionId, selectedTab, page],
    queryFn: () => getTitulos({
      edicao_id: selectedEditionId === "all" ? undefined : selectedEditionId,
      tipo: selectedTab === "todos" ? undefined : selectedTab === "sorteios" ? "sorteio" : "raspadinha",
      page,
      per_page: 25
    }),
    keepPreviousData: true,
  });

  const titulos = titulosResponse?.data || [];
  const meta = titulosResponse?.meta;

  return (
    <AuthenticatedLayout>
      <main className="flex-1 pt-4 pb-24 px-4 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
          <Gift className="h-7 w-7 text-[#9FFF00]" />
          Meus Números
        </h1>

        {/* Filtro de Edição */}
        <div className="mb-6 bg-[#1E2530] rounded-xl p-4 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Filtrar por Edição</h2>
          <Select value={selectedEditionId} onValueChange={(value) => {
            setSelectedEditionId(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-full bg-[#191F26] text-white border-gray-700 focus:ring-[#9FFF00] focus:border-[#9FFF00]">
              <SelectValue placeholder="Selecionar edição" />
            </SelectTrigger>
            <SelectContent className="bg-[#191F26] text-white border-gray-700">
              {mockEditions.map((edition) => (
                <SelectItem key={edition.id} value={edition.id}>
                  {edition.id === "all"
                    ? edition.name
                    : `${edition.name} - ${formatDateForEdition(edition.startDate)} até ${formatDateForEdition(edition.endDate)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs para tipos de números */}
        <Tabs value={selectedTab} onValueChange={(value) => {
          setSelectedTab(value);
          setPage(1);
        }} className="mb-6">
          <TabsList className="w-full bg-[#1E2530] p-1">
            <TabsTrigger
              value="todos"
              className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="sorteios"
              className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
            >
              Sorteios
            </TabsTrigger>
            <TabsTrigger
              value="instantaneos"
              className="flex-1 data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26]"
            >
              Instantâneos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4" />
                <div className="h-8 bg-gray-700 rounded w-2/3 mb-4" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">Erro ao carregar seus números.</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-[#9FFF00] text-[#191F26] hover:bg-[#8FEF00]"
            >
              Tentar Novamente
            </Button>
          </div>
        ) : titulos.length === 0 ? (
          // Empty state
          <div className="text-center py-10">
            <Gift className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-6">Você ainda não possui números para a seleção atual.</p>
            <Link href="/home" passHref>
              <Button className="bg-[#9FFF00] text-[#191F26] px-6 py-2 rounded-lg font-semibold hover:bg-[#8FEF00] transition-colors">
                Comprar Números
              </Button>
            </Link>
          </div>
        ) : (
          // Lista de títulos
          <>
            <div className="grid gap-4">
              {titulos.map((titulo) => (
                <motion.div
                  key={titulo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CupomCard titulo={titulo} />
                </motion.div>
              ))}
            </div>

            {/* Paginação */}
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm text-gray-400">
                  Página {page} de {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages || isLoading}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </AuthenticatedLayout>
  )
}
