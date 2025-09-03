"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flag, X } from "lucide-react"
import Image from "next/image"
import { usePromocoes } from "@/hooks/use-promocoes"
import { useRegulamento } from "@/hooks/use-regulamento"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Cookies from 'js-cookie'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"

export function PromotionProgress() {
  const { promocoes, isLoading: isLoadingPromocoes, error: errorPromocoes } = usePromocoes()
  const { regulamento, isLoading: isLoadingRegulamento } = useRegulamento()
  const promocaoAtiva = promocoes.find(p => p.is_ativa)
  
  const currentProgress = promocaoAtiva ? (promocaoAtiva.progresso_vendas / promocaoAtiva.meta_vendas) * 100 : 0

  if (isLoadingPromocoes) {
    return (
      <Card className="bg-[#1E2530] border-gray-700 p-4 mb-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (errorPromocoes) {
    return (
      <Card className="bg-[#1E2530] border-gray-700 p-4 mb-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Promoção da vez</h3>
          <p className="text-gray-400 text-sm">
            Não foi possível carregar as informações da promoção no momento.
            Por favor, tente novamente mais tarde.
          </p>
        </div>
      </Card>
    )
  }

  if (!promocaoAtiva) {
    return (
      <Card className="bg-[#1E2530] border-gray-700 p-4 mb-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Promoção da vez</h3>
          <p className="text-[#9ffe00] font-semibold">
            Nenhuma promoção ativa no momento
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Fique de olho! Em breve teremos novas promoções para você.
          </p>
        </div>
      </Card>
    )
  }

  const dataTermino = format(new Date(promocaoAtiva.fim_em), "dd/MM/yyyy", { locale: ptBR })
  const metaFormatada = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(promocaoAtiva.meta_vendas)

  return (
    <Card className="bg-[#1E2530] border-gray-700 p-4 mb-4">
      <h3 className="text-lg font-semibold text-white mb-2 text-center">Promoção da vez</h3>
      
      <div className="text-center mb-4">
        <p className="text-[#9ffe00] font-semibold">Prêmio: {promocaoAtiva.premio_descricao}</p>
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>Meta: {metaFormatada} (Atingido: {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
          }).format(promocaoAtiva.progresso_vendas || 0)})</span>
          <span>Término: {dataTermino}</span>
        </div>
      </div>

      <div className="relative mb-4">
        {/* Barra de progresso */}
        <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#9ffe00] rounded-full transition-all duration-500"
            style={{ width: `${currentProgress}%` }}
          />
        </div>

        {/* Ícone de progresso */}
        <div 
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${currentProgress}%`, transform: `translateX(-50%) translateY(-50%)` }}
        >
          <div className="relative w-12 h-12">
            <Image
              src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//promocao_raspepix.png"
              alt="Progresso"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Ícone da bandeira */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <Flag className="w-6 h-6 text-[#9ffe00]" />
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full text-[#9ffe00] border-[#9ffe00] hover:bg-[#9ffe00] hover:text-[#191F26]"
          >
            Regulamento
          </Button>
        </DialogTrigger>
        <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[#1E2530]/90 text-white border-gray-700 max-w-3xl w-[90vw] max-h-[85vh] overflow-y-auto z-50 rounded-xl">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4 text-white" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
          {/* Imagem de fundo com overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-overlay"
            style={{
              backgroundImage: 'url(https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/regulamentos_raspepix.png)',
              zIndex: 1
            }}
          />
          
          {/* Conteúdo do modal */}
          <div className="relative" style={{ zIndex: 2 }}>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-[#9ffe00] drop-shadow-lg">
                Regulamento da Promoção
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-6 space-y-6 bg-[#1E2530]/30 p-6 rounded-lg">
              <div className="flex items-center justify-between border-b border-[#9ffe00]/30 pb-4">
                <h3 className="font-semibold text-xl text-[#9ffe00]">
                  {promocaoAtiva?.premio_descricao}
                </h3>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Término em</p>
                  <p className="text-lg font-semibold text-[#9ffe00]">
                    {format(new Date(promocaoAtiva?.fim_em || new Date()), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#1E2530]/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#9ffe00] mb-3">Meta da Promoção</h4>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    }).format(promocaoAtiva?.meta_vendas || 0)}
                  </p>
                </div>
                
                <div className="bg-[#1E2530]/50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#9ffe00] mb-3">Regras Gerais</h4>
                  {isLoadingRegulamento ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-700 rounded w-4/5"></div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {regulamento}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-400 italic border-t border-gray-700/50 pt-4 mt-6">
                * Este regulamento pode ser alterado sem aviso prévio. Consulte sempre a versão mais recente.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}