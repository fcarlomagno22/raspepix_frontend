"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useInfluencerStatus } from "@/hooks/use-influencer-status"

interface PartnershipTermsModalProps {
  onAccept: () => void
  isOpen: boolean
}

export default function PartnershipTermsModal({ onAccept, isOpen }: PartnershipTermsModalProps) {
  const [accepted, setAccepted] = useState(false)
  const { toast } = useToast()
  const { acceptTerms, isLoading } = useInfluencerStatus()

  const handleAcceptTerms = async () => {
    if (!accepted) {
      toast({
        title: "Atenção",
        description: "Você precisa aceitar os termos para continuar.",
        variant: "destructive"
      })
      return
    }

    try {
      await acceptTerms()
      onAccept()
      toast({
        title: "Sucesso",
        description: "Termos aceitos com sucesso!",
        variant: "default"
      })
      // Recarrega a página após aceitar os termos
      window.location.reload()
    } catch (error: any) {
      console.error('Erro ao aceitar termos:', error)
      toast({
        title: "Erro",
        description: error.response?.data?.error || error.message || "Não foi possível aceitar os termos. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1E2530] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border-2 border-[#9ffe00]/20"
      >
        <div className="flex flex-col items-center">
          {/* Imagem */}
          <div className="relative w-full max-w-[210px] mb-6">
            <Image
              src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//raspepix_parceria.png"
              alt="Parceria RaspePix"
              width={210}
              height={140}
              className="w-full h-auto rounded-2xl"
              priority
            />
          </div>

          {/* Título */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            Seja um Parceiro RaspePix!
          </h2>

          {/* Texto */}
          <p className="text-gray-300 text-center mb-8 leading-relaxed">
            Para continuar, você precisa aceitar os termos da parceria para atuar como Afiliado ou Influencer 
            da RaspePix, dentro do modelo de marketing multinível da plataforma.
          </p>

          {/* Checkbox */}
          <div className="flex items-start space-x-3 mb-8">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              className="mt-1 data-[state=checked]:bg-[#9ffe00] data-[state=checked]:border-[#9ffe00]"
            />
            <label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
              Li e aceito o{" "}
              <Link
                href="/termos-parceria"
                target="_blank"
                className="text-[#9ffe00] hover:underline"
              >
                Termo de Parceria de Influencers e Afiliados
              </Link>
            </label>
          </div>

          {/* Botão */}
          <Button
            onClick={handleAcceptTerms}
            disabled={!accepted || isLoading}
            className="w-full max-w-sm bg-[#9ffe00] text-[#191F26] hover:bg-[#8FEF00] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg py-6 rounded-full"
          >
            {isLoading ? "Processando..." : "Continuar"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}