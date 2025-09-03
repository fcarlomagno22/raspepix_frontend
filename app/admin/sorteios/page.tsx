"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LotteryEditionsTable from "@/components/admin/sorteios/lottery-editions-table"
import LotteryEditionDrawer from "@/components/admin/lottery-edition-drawer"
import { type LotteryEdition, type LotteryEditionStatus } from "@/lib/mock-lottery-data"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { getEdicoes, type SorteioEdicao, atualizarStatusEdicao, excluirEdicao } from "@/services/sorteio"
import { getErrorMessage } from "@/services/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Cookies from "js-cookie"

export default function AdminLotteryPage() {
  useAuth(true); // Adiciona verificação de autenticação de admin

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [lotteryEditions, setLotteryEditions] = useState<LotteryEdition[]>([])
  const [filterStatus, setFilterStatus] = useState<"Todos" | LotteryEditionStatus>("Todos")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingEdition, setEditingEdition] = useState<LotteryEdition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // Adjust as needed

  useEffect(() => {
    loadEdicoes()
  }, [])

  const mapApiEditionToFrontend = (apiEdition: SorteioEdicao): LotteryEdition => {
    return {
      id: apiEdition.id,
      name: apiEdition.nome,
      lotteryPrize: apiEdition.valor_sorteio,
      instantPrizes: apiEdition.valor_premios_instantaneos,
      startDate: new Date(apiEdition.data_inicio),
      endDate: new Date(apiEdition.data_fim),
      status: apiEdition.status as LotteryEditionStatus,
      totalInstantTicketsToCreate: 0, // Campo não disponível na API
      numInstantPrizesToDistribute: 0,
      minInstantPrizeValue: 0,
      maxInstantPrizeValue: 0,
      generatedInstantPrizes: [],
      capitalizadoraWinningNumbersInput: "",
      capitalizadoraNumbers: []
    }
  }

  const loadEdicoes = async () => {
    try {
      setIsLoading(true)
      const edicoes = await getEdicoes()
      const mappedEdicoes = edicoes.map(mapApiEditionToFrontend)
      setLotteryEditions(mappedEdicoes)
    } catch (error) {
      console.error('Erro ao carregar edições:', error)
      toast({
        title: "Erro ao carregar edições",
        description: getErrorMessage(error),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!isDeletingId) return;

    try {
      setIsDeleting(true);
      await excluirEdicao(isDeletingId);
      // Remove localmente após confirmação da API
      setLotteryEditions(lotteryEditions.filter((ed) => ed.id !== isDeletingId));
      
      toast({
        title: "Sucesso",
        description: "Edição excluída com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao excluir edição:', error);
      
      // Verifica a mensagem exata da API
      if (error.message === "Não é possível excluir uma edição que já possui números comprados") {
        toast({
          title: "Operação não permitida",
          description: "Não é possível excluir esta edição pois existem números comprados. Esta é uma medida de segurança para proteger o histórico de vendas e garantir a integridade dos dados dos compradores.",
          variant: "warning",
          duration: 5000,
        });
      } else {
        toast({
          title: "Erro ao excluir edição",
          description: error.message || "Ocorreu um erro ao tentar excluir a edição",
          variant: error.type === 'warning' ? 'warning' : 'destructive'
        });
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setIsDeletingId(null);
    }
  };

  const handleDeleteEdition = (id: string) => {
    // Verifica se pode excluir baseado no status
    const edition = lotteryEditions.find(ed => ed.id === id)
    if (edition && edition.status !== "futuro") {
      toast({
        title: "Operação não permitida",
        description: "Apenas edições com status 'Futuro' podem ser excluídas.",
        variant: "warning"
      })
      return
    }
    
    setIsDeletingId(id)
    setShowDeleteConfirm(true)
  }

  const filteredEditions = lotteryEditions.filter((edition) => {
    if (filterStatus === "Todos") {
      return true
    }
    return edition.status === filterStatus
  })

  // Calculate pagination values
  const totalPages = Math.ceil(filteredEditions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEditions = filteredEditions.slice(startIndex, endIndex)

  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1)
  }, [filterStatus])

  const handleNewEdition = () => {
    setEditingEdition(null)
    setIsDrawerOpen(true)
  }

  const handleEditEdition = (edition: LotteryEdition) => {
    // Verifica se pode editar baseado no status
    if (edition.status !== "futuro") {
      toast({
        title: "Operação não permitida",
        description: "Apenas edições com status 'Futuro' podem ser editadas.",
        variant: "warning"
      })
      return
    }
    
    setEditingEdition(edition)
    setIsDrawerOpen(true)
  }

  const handleSaveEdition = (newEdition: LotteryEdition) => {
    if (editingEdition) {
      // Update existing edition
      setLotteryEditions(lotteryEditions.map((ed) => (ed.id === newEdition.id ? newEdition : ed)))
    } else {
      // Add new edition
      setLotteryEditions([...lotteryEditions, newEdition])
    }
    setIsDrawerOpen(false)
    setEditingEdition(null)
  }

  const handleStatusChange = async (id: string, newStatus: LotteryEditionStatus) => {
    try {
      await atualizarStatusEdicao(id, newStatus);
      setLotteryEditions(lotteryEditions.map((ed) => (ed.id === id ? { ...ed, status: newStatus } : ed)));
      toast({
        title: "Sucesso",
        description: "Status da edição atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      
      // Se for erro de autenticação, mostra mensagem específica
      if (error instanceof Error && error.message.includes('Sessão expirada')) {
        toast({
          title: "Sessão Expirada",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive"
        });
        
        // Redireciona após 2 segundos para dar tempo de ler a mensagem
        setTimeout(() => {
          Cookies.remove('admin_token');
          window.location.href = '/admin/login';
        }, 2000);
        
        return;
      }
      
      toast({
        title: "Erro ao atualizar status",
        description: getErrorMessage(error),
        variant: "destructive"
      });
      
      // Recarrega os dados para garantir consistência
      loadEdicoes();
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1 lg:ml-[240px]">
        <AdminHeaderMobile onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 mt-[60px] lg:mt-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-white">Sorteios por Edição</h1>
            <div className="flex gap-4">
              <Select
                onValueChange={(value: "Todos" | LotteryEditionStatus) => setFilterStatus(value)}
                value={filterStatus}
              >
                <SelectTrigger className="w-[180px] bg-[#1A2430] border-[#9FFF00]/10 text-white">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#0D1117] border-[#9FFF00]/10 text-white">
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                  <SelectItem value="futuro">Futuro</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleNewEdition}
                className="bg-[#9FFF00] text-black hover:bg-lime-400 px-4 py-2 font-semibold flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Nova Edição
              </Button>
            </div>
          </div>

          <LotteryEditionsTable
            editions={currentEditions}
            onEdit={handleEditEdition}
            onDelete={handleDeleteEdition}
            onStatusChange={handleStatusChange}
          />

          {filteredEditions.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-gray-400">
                Exibindo {startIndex + 1} a {Math.min(endIndex, filteredEditions.length)} de {filteredEditions.length}{" "}
                edições
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00]"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={
                      currentPage === page
                        ? "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black"
                        : "relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00]"
                    }
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative px-4 py-2 h-10 border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00]"
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <LotteryEditionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        edition={editingEdition}
        onSave={handleSaveEdition}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[#0D1117] border-[#9FFF00]/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#9FFF00]">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tem certeza que deseja excluir esta edição? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10"
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
