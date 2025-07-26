"use client"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare, X, Loader2 } from "lucide-react"
import { formatDate, renderStatusIndicator } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { useState, useRef, useEffect } from "react"
import { suporteService, type Ticket, type TicketMessage } from "@/services/suporte"
import { useToast } from "@/components/ui/use-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"

interface TicketDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  ticket: Ticket
  onMessageSent?: () => void
}

export default function TicketDetailDrawer({
  isOpen,
  onClose,
  ticket,
  onMessageSent,
}: TicketDetailDrawerProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query para buscar mensagens
  const {
    data: messagesData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["ticket-messages", ticket.id],
    queryFn: () => suporteService.listarMensagens(ticket.id),
    enabled: isOpen, // Só busca quando o drawer está aberto
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
      await suporteService.enviarMensagem(ticket.id, {
        mensagem: newMessage.trim()
      })
      
      setNewMessage("")
      await refetch() // Recarrega as mensagens
      onMessageSent?.() // Notifica o componente pai
      
      // Scroll para última mensagem
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
            {renderStatusIndicator(ticket.status)}
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
                  messagesData.mensagens.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.remetente_tipo === "usuario" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`${
                          msg.remetente_tipo === "usuario"
                            ? "bg-[#9FFF00]/20 text-white border border-[#9FFF00]/20"
                            : "bg-yellow-500/20 text-white border border-yellow-500/20"
                        } p-4 rounded-lg max-w-[80%]`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium ${
                            msg.remetente_tipo === "usuario"
                              ? "text-[#9FFF00]"
                              : "text-yellow-400"
                          }`}>
                            {msg.remetente_tipo === "usuario" ? "Você" : "Atendente"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(msg.criado_em)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.mensagem}</p>
                      </div>
                    </div>
                  ))
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
