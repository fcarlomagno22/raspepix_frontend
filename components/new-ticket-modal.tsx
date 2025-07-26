"use client"

import type React from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { useState, useCallback } from "react"
import { suporteService } from "@/services/suporte"
import { useToast } from "@/components/ui/use-toast"

interface NewTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ValidationErrors {
  titulo?: string;
  mensagem?: string;
}

export default function NewTicketModal({
  isOpen,
  onClose,
  onSuccess,
}: NewTicketModalProps) {
  const [titulo, setTitulo] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const { toast } = useToast()

  const validateFields = useCallback(() => {
    const newErrors: ValidationErrors = {};

    if (titulo.trim().length < 5) {
      newErrors.titulo = "O assunto deve ter no mínimo 5 caracteres";
    }

    if (mensagem.trim().length < 10) {
      newErrors.mensagem = "A mensagem deve ter no mínimo 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [titulo, mensagem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateFields()) return;

    try {
      setIsSubmitting(true)

      // Criar o ticket
      console.log('Criando ticket...');
      const response = await suporteService.criarTicket({
        titulo: titulo.trim(),
        mensagem: mensagem.trim()
      });

      // Verificar se temos o ID do ticket
      if (!response?.chamado?.id) {
        throw new Error("Erro ao criar o chamado: ID não retornado");
      }

      console.log('Ticket criado com sucesso:', response);

      // Se a mensagem não foi criada junto com o ticket, enviar separadamente
      if (!response.mensagem) {
        console.log('Enviando primeira mensagem...');
        await suporteService.enviarMensagem(response.chamado.id, {
          mensagem: mensagem.trim()
        });
        console.log('Primeira mensagem enviada com sucesso');
      }
      
      // Limpar campos e fechar modal
      setTitulo("")
      setMensagem("")
      setErrors({})
      
      // Notificar sucesso e atualizar lista
      toast({
        title: "Sucesso",
        description: "Chamado aberto com sucesso!",
      })
      
      onSuccess()
    } catch (error: any) {
      console.error('Erro no processo de criação do chamado:', error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = titulo.trim().length >= 5 && mensagem.trim().length >= 10;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-[#1A2430] text-white border-[#9FFF00]/10 rounded-t-xl shadow-xl p-6 w-full h-full max-h-[90vh] flex flex-col">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-xl font-bold text-[#9FFF00]">Novo Chamado</DrawerTitle>
          <DrawerDescription className="text-gray-400 mt-2">
            Preencha os campos abaixo para abrir um novo chamado de suporte.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-y-auto pb-4">
          <div className="p-4 space-y-4 flex-grow">
            <div className="space-y-2">
              <Label htmlFor="ticket-title" className="text-gray-300">
                Assunto do Chamado
              </Label>
              <Input
                id="ticket-title"
                placeholder="Ex: Problema com pagamento"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  if (errors.titulo) validateFields();
                }}
                className={`bg-[#232D3F] border-[#9FFF00]/10 text-white focus:border-[#9FFF00] focus:ring-[#9FFF00] ${
                  errors.titulo ? 'border-red-500' : ''
                }`}
                required
                disabled={isSubmitting}
              />
              {errors.titulo && (
                <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ticket-message" className="text-gray-300">
                Mensagem Inicial
              </Label>
              <Textarea
                id="ticket-message"
                placeholder="Descreva detalhadamente seu problema ou dúvida..."
                value={mensagem}
                onChange={(e) => {
                  setMensagem(e.target.value);
                  if (errors.mensagem) validateFields();
                }}
                className={`bg-[#232D3F] border-[#9FFF00]/10 text-white focus:border-[#9FFF00] focus:ring-[#9FFF00] min-h-[120px] ${
                  errors.mensagem ? 'border-red-500' : ''
                }`}
                required
                disabled={isSubmitting}
              />
              {errors.mensagem && (
                <p className="text-red-500 text-sm mt-1">{errors.mensagem}</p>
              )}
            </div>
          </div>

          <DrawerFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 border-t border-gray-800 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-[#9FFF00]/30 text-[#9FFF00] hover:bg-[#9FFF00]/10 bg-transparent mt-2 sm:mt-0"
              onClick={() => onClose()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26] transition-all duration-300 shadow-glow-sm hover:shadow-glow flex items-center gap-2"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Abrir Chamado
                </>
              )}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
