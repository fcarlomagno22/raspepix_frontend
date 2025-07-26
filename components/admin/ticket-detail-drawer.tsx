"use client"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, X, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { useState, useRef, useEffect } from "react"
import { adminSuporteService, type AdminTicket, type AdminTicketMessage, type UpdateTicketStatusParams } from "@/services/suporte"
import { useToast } from "@/components/ui/use-toast"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AdminTicketDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  ticket: AdminTicket
  onMessageSent?: () => void
  onStatusChange?: () => void
}

const STATUS_OPTIONS = [
  { value: 'aberto', label: 'Aguardando', color: 'text-yellow-400' },
  { value: 'em_atendimento', label: 'Em Atendimento', color: 'text-blue-400' },
  { value: 'resolvido', label: 'Encerrado', color: 'text-green-400' }
] as const

export default function AdminTicketDetailDrawer({
  isOpen,
  onClose,
  ticket,
  onMessageSent,
  onStatusChange,
}: AdminTicketDetailDrawerProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: async (params: UpdateTicketStatusParams) => {
      return adminSuporteService.atualizarStatus(ticket.id, params)
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "Status atualizado com sucesso",
        variant: "default",
      })
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] })
      onStatusChange?.()
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o status",
        variant: "destructive",
      })
    },
  })

  // Query para buscar mensagens
  const {
    data: messagesData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["admin-ticket-messages", ticket.id],
    queryFn: async () => {
      const response = await adminSuporteService.listarMensagens(ticket.id);
      return response;
    },
    enabled: isOpen,
  })

  // Scroll para última mensagem
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [isOpen, messagesData])

  // Handler para enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSendingMessage(true)
    try {
      await adminSuporteService.enviarMensagem(ticket.id, {
        mensagem: newMessage.trim()
      })
      
      setNewMessage("")
      await refetch()
      onMessageSent?.()
      
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar a mensagem",
        variant: "destructive"
      })
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Handler para atualizar status
  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate({ status: newStatus as UpdateTicketStatusParams['status'] })
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-[#1A2430] text-white border-[#9FFF00]/10 rounded-t-xl shadow-xl p-6 w-full h-full max-h-[90vh] flex flex-col">
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-[#9FFF00]/10"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </Button>

        <DrawerHeader className="text-center">
          <DrawerTitle className="text-xl font-bold text-[#9FFF00]">Detalhes do Chamado</DrawerTitle>
          <DrawerDescription className="sr-only">Detalhes do chamado de suporte: {ticket.titulo}</DrawerDescription>
        </DrawerHeader>
        
        {/* Cabeçalho fixo */}
        <div className="bg-[#191F26]/60 rounded-lg p-4 border border-gray-800">
          <h3 className="font-medium text-white text-lg mb-2">{ticket.titulo}</h3>
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Criado em: {formatDate(ticket.criado_em)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={ticket.status}
                onValueChange={handleStatusChange}
                disabled={updateStatusMutation.isPending}
              >
                <SelectTrigger className="w-[180px] bg-[#232D3F] border-[#9FFF00]/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#232D3F] border-[#9FFF00]/10">
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value}
                      className={`${status.color} cursor-pointer hover:bg-[#9FFF00]/10`}
                    >
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {updateStatusMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin text-[#9FFF00]" />
              )}
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>Cliente: {ticket.usuario.full_name}</span>
          </div>
        </div>

        {/* Área de conversa com scroll */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="bg-[#191F26]/60 rounded-lg p-4 border border-gray-800 mt-4">
              <h3 className="font-medium text-white text-lg mb-2 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#9FFF00]" />
                Conversa
              </h3>
              <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#9FFF00]" />
                  </div>
                ) : isError ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>{error instanceof Error ? error.message : "Erro ao carregar mensagens"}</p>
                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      className="mt-2 border-[#9FFF00]/30 text-[#9FFF00] hover:bg-[#9FFF00]/10"
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                ) : !messagesData?.mensagens.length ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>Nenhuma mensagem encontrada</p>
                  </div>
                ) : (
                  messagesData.mensagens.map((msg, index) => {
                    const isUserMessage = msg.remetente_id === ticket.usuario_id;
                    return (
                      <div
                        key={msg.id || `msg-${index}`}
                        className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`${
                            isUserMessage
                              ? "bg-[#9FFF00]/20 text-white border border-[#9FFF00]/20"
                              : "bg-yellow-500/20 text-white border border-yellow-500/20"
                          } p-4 rounded-lg max-w-[80%]`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-medium ${
                              isUserMessage
                                ? "text-[#9FFF00]"
                                : "text-yellow-400"
                            }`}>
                              {isUserMessage ? "Cliente" : "Atendente"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(msg.criado_em)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.mensagem}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Área de envio de mensagem fixa */}
        <div className="bg-[#191F26]/60 rounded-lg p-4 border border-gray-800 mt-4">
          <h3 className="font-medium text-white text-lg mb-2">Enviar Mensagem</h3>
          <div className="flex flex-col space-y-2">
            <Textarea
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow bg-[#232D3F] border-[#9FFF00]/10 text-white min-h-[40px] max-h-[100px] focus:border-[#9FFF00] focus:ring-[#9FFF00]"
              rows={1}
              disabled={isSendingMessage}
            />
            <Button
              className="w-full bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow"
              onClick={handleSendMessage}
              disabled={isSendingMessage || newMessage.trim() === ""}
            >
              {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isSendingMessage ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 