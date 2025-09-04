"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Gift, Plus, Trash2, Calendar, DollarSign, Award, Tag, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Promocao, promocoesService } from "@/services/promocoes"

interface PromotionParticipant {
  id: string
  nome: string
  codigo_influencer: string
  percentual_progresso: number
  status_premio: "pendente" | "recebido"
}

export interface Promotion {
  id: string
  titulo: string
  descricao: string
  tipo_premiacao: "bonus_dinheiro" | "premio_fisico" | "recompensa_especial"
  premio_descricao: string
  meta_vendas: number
  inicio_em: string
  fim_em: string
  is_ativa: boolean
  criado_em: string
  atualizado_em: string
  regras: string
}

interface PromotionsManagerProps {
  initialPromotions?: Promotion[]
  onSave?: (promotion: Promotion) => void
  onDelete?: (promotionId: string) => void
}

const PROMOTION_TYPES = {
  bonus_dinheiro: "Bônus em Dinheiro",
  premio_fisico: "Prêmio Físico",
  recompensa_especial: "Recompensa Especial",
} as const

const STATUS_COLORS = {
  active: "bg-[#9FFF00]/20 text-[#9FFF00]",
  inactive: "bg-gray-500/20 text-gray-400",
} as const

export function PromotionsManager({ initialPromotions, onSave, onDelete }: PromotionsManagerProps) {
  const { toast } = useToast()
  const [isAddingPromotion, setIsAddingPromotion] = useState(false)
  const [participants, setParticipants] = useState<Record<string, PromotionParticipant[]>>({})

  const loadParticipants = async (promotionId: string) => {
    try {
      const response = await promocoesService.buscarInfluencers(promotionId)
      if (response.success && response.data) {
        const participantsData = response.data || []
        setParticipants(prev => ({
          ...prev,
          [promotionId]: participantsData.map(p => ({
            id: p.id,
            nome: p.nome,
            codigo_influencer: p.codigo_influencer,
            percentual_progresso: p.percentual_progresso,
            status_premio: p.status_premio
          }))
        }))
      }
    } catch (error) {
      console.error("Erro ao carregar participantes:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os participantes da promoção.",
        variant: "destructive",
      })
    }
  }

  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(null)

  useEffect(() => {
    if (selectedPromotion) {
      loadParticipants(selectedPromotion)
    }
  }, [selectedPromotion])
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions || [])
  const [newPromotion, setNewPromotion] = useState<Omit<Promotion, "id" | "is_ativa" | "criado_em" | "atualizado_em">>({
    titulo: "",
    descricao: "",
    tipo_premiacao: "bonus_dinheiro",
    premio_descricao: "",
    meta_vendas: 0,
    inicio_em: format(new Date(), "yyyy-MM-dd"),
    fim_em: format(new Date(), "yyyy-MM-dd"),
    regras: "",
  })

  const handleAddPromotion = async () => {
    try {
      if (!newPromotion.titulo || !newPromotion.premio_descricao || !newPromotion.meta_vendas) {
        toast({
          title: "Campos Obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        })
        return
      }



      // Não precisamos mais fazer o mapeamento pois já estamos usando os valores corretos

      const response = await promocoesService.criar({
        ...newPromotion,
        inicio_em: `${newPromotion.inicio_em}T00:00:00Z`,
        fim_em: `${newPromotion.fim_em}T23:59:59Z`,
      })

      if (response.success) {
        const promotion: Promotion = {
          ...response.data,
          inicio_em: newPromotion.inicio_em,
          fim_em: newPromotion.fim_em,
        }

        setPromotions((prev) => [...prev, promotion])
        onSave?.(promotion)

        setNewPromotion({
          titulo: "",
          descricao: "",
          tipo_premiacao: "bonus_dinheiro",
          premio_descricao: "",
          meta_vendas: 0,
          inicio_em: format(new Date(), "yyyy-MM-dd"),
          fim_em: format(new Date(), "yyyy-MM-dd"),
          regras: "",
        })
        setIsAddingPromotion(false)

        toast({
          title: "Promoção Criada",
          description: "A promoção foi criada com sucesso.",
        })
      }
    } catch (error) {
      console.error("Erro ao criar promoção:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a promoção. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      const response = await promocoesService.excluir(promotionId)
      
      if (response.success) {
        setPromotions((prev) => prev.filter((p) => p.id !== promotionId))
        onDelete?.(promotionId)
        toast({
          title: "Promoção Removida",
          description: "A promoção foi removida com sucesso.",
        })
      }
    } catch (error) {
      console.error("Erro ao excluir promoção:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a promoção. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Botão Adicionar Promoção */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsAddingPromotion(!isAddingPromotion)}
          className="bg-[#9FFF00] text-[#191F26] hover:bg-[#8AE000]"
        >
          {isAddingPromotion ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Nova Promoção
            </>
          )}
        </Button>
      </div>

      {/* Formulário de Nova Promoção */}
      {isAddingPromotion && (
        <Card className="bg-[#232A34] border-[#366D51] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Nova Promoção</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Título</label>
              <Input
                value={newPromotion.titulo}
                onChange={(e) => setNewPromotion({ ...newPromotion, titulo: e.target.value })}
                className="bg-[#1A2430] border-[#366D51] text-white"
                placeholder="Ex: Desafio de Vendas do Mês"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Descrição</label>
              <Input
                value={newPromotion.descricao}
                onChange={(e) => setNewPromotion({ ...newPromotion, descricao: e.target.value })}
                className="bg-[#1A2430] border-[#366D51] text-white"
                placeholder="Descreva os detalhes da promoção"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Tipo de Promoção</label>
                <Select
                                  value={newPromotion.tipo_premiacao}
                onValueChange={(value: "bonus_dinheiro" | "premio_fisico" | "recompensa_especial") =>
                  setNewPromotion({ ...newPromotion, tipo_premiacao: value })
                  }
                >
                  <SelectTrigger className="bg-[#1A2430] border-[#366D51] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
                    {Object.entries(PROMOTION_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Meta de Vendas (R$)</label>
                <CurrencyInput
                                  value={newPromotion.meta_vendas}
                onChange={(value) => setNewPromotion({ ...newPromotion, meta_vendas: value })}
                  className="bg-[#1A2430] border-[#366D51] text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Recompensa</label>
              <Input
                value={newPromotion.premio_descricao}
                onChange={(e) => setNewPromotion({ ...newPromotion, premio_descricao: e.target.value })}
                className="bg-[#1A2430] border-[#366D51] text-white"
                placeholder="Ex: Bônus de R$ 1.000,00 ou iPhone 15"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Data de Início</label>
                <Input
                  type="date"
                                  value={newPromotion.inicio_em}
                onChange={(e) => setNewPromotion({ ...newPromotion, inicio_em: e.target.value })}
                  className="bg-[#1A2430] border-[#366D51] text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Data de Término</label>
                <Input
                  type="date"
                                  value={newPromotion.fim_em}
                onChange={(e) => setNewPromotion({ ...newPromotion, fim_em: e.target.value })}
                  className="bg-[#1A2430] border-[#366D51] text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Regulamento</label>
              <textarea
                value={newPromotion.regras}
                onChange={(e) => setNewPromotion({ ...newPromotion, regras: e.target.value })}
                className="w-full h-32 bg-[#1A2430] border-[#366D51] text-white rounded-md p-2 resize-none"
                placeholder="Digite aqui o regulamento da promoção..."
              />
            </div>

            <Button onClick={handleAddPromotion} className="w-full bg-[#9FFF00] text-[#191F26] hover:bg-[#8AE000]">
              <Gift className="h-4 w-4 mr-2" />
              Criar Promoção
            </Button>
          </div>
        </Card>
      )}

      {/* Seletor de Promoções */}
      <div className="space-y-6">
        <Select value={selectedPromotion || ""} onValueChange={setSelectedPromotion}>
          <SelectTrigger className="bg-[#1A2430] border-[#366D51] text-white w-full">
            <SelectValue placeholder="Selecione uma promoção" />
          </SelectTrigger>
          <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
            {promotions.map((promotion) => (
              <SelectItem key={promotion.id} value={promotion.id}>
                {promotion.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Detalhes da Promoção Selecionada */}
        {selectedPromotion && (
          <div className="space-y-6">
            {promotions.map((promotion) => {
              if (promotion.id !== selectedPromotion) return null;
              
              return (
                <div key={promotion.id} className="space-y-6">
                  <Card className="bg-[#232A34] border-[#366D51] p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium">{promotion.titulo}</h3>
                          <Badge className={promotion.is_ativa ? STATUS_COLORS.active : STATUS_COLORS.inactive}>
                            {promotion.is_ativa ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{promotion.descricao}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center text-[#9FFF00]">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Meta: R$ {promotion.meta_vendas?.toLocaleString() || "0"}
                          </span>
                          <span className="flex items-center text-[#9FFF00]">
                            <Award className="h-4 w-4 mr-1" />
                            {promotion.premio_descricao}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(promotion.inicio_em), "dd/MM/yyyy", { locale: ptBR })} até{" "}
                          {format(new Date(promotion.fim_em), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPromotionToDelete(promotion)}
                        className="border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>

                  {/* Tabela de Participantes */}
                  <div className="rounded-md border border-[#366D51] overflow-hidden">
                    <Table>
                      <TableHeader className="bg-[#1A2430]">
                        <TableRow>
                          <TableHead className="text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Nome
                          </TableHead>
                          <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Código do Afiliado
                          </TableHead>
                          <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Progresso
                          </TableHead>
                          <TableHead className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status do Prêmio
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="bg-[#232A34] divide-y divide-[#366D51]">
                        {participants[promotion.id]?.map((participant) => (
                          <TableRow key={participant.id} className="hover:bg-[#1A2430]">
                            <TableCell className="font-medium text-white">
                              {participant.nome}
                            </TableCell>
                            <TableCell className="text-center text-gray-300">
                              {participant.codigo_influencer}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <div className="w-full max-w-xs bg-[#1A2430] rounded-full h-2.5 mr-2">
                                  <div
                                    className="bg-[#9FFF00] h-2.5 rounded-full"
                                    style={{ width: `${participant.percentual_progresso}%` }}
                                  />
                                </div>
                                <span className="text-[#9FFF00] text-sm">{participant.percentual_progresso.toFixed(2)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                className={
                                  participant.status_premio === "recebido"
                                    ? "bg-[#9FFF00]/20 text-[#9FFF00]"
                                    : "bg-yellow-500/20 text-yellow-500"
                                }
                              >
                                {participant.status_premio === "recebido" ? "Recebido" : "Pendente"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Modal de Confirmação de Deleção */}
      <AlertDialog open={promotionToDelete !== null} onOpenChange={(open) => !open && setPromotionToDelete(null)}>
        <AlertDialogContent className="bg-[#232A34] border-[#366D51]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir a promoção "{promotionToDelete?.titulo}"?<br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-transparent border-[#366D51] text-white hover:bg-[#1A2430] hover:text-white"
              onClick={() => setPromotionToDelete(null)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                if (promotionToDelete) {
                  handleDeletePromotion(promotionToDelete.id)
                  setPromotionToDelete(null)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 