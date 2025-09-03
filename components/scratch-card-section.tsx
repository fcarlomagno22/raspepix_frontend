"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

// Dados mockados para as raspadinhas - agora apenas a Super RaspePix
const scratchCards = [
  {
    id: 1,
    name: "Super RaspePix",
    image_url:
      "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//Suoer_RaspePix_ScratchCard.png", // A imagem já está definida com esta URL
    max_prize: 50000.0, // Mantido para referência, mas não exibido
    price: 100,
  },
]

// Helper para formatar valores como moeda BRL (mantido caso precise em outro lugar)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Helper para determinar coinCount (mantido caso precise em outro lugar)
const getCoinCount = (name: string) => {
  switch (name) {
    case "Mini RaspePix":
      return 1
    case "RaspePix Pro":
      return 2
    case "RaspePix Max":
      return 8
    case "Super RaspePix":
      return 15
    default:
      return 5 // Valor padrão
  }
}

interface ScratchCardSectionProps {
  targetLink?: string // Nova prop para o link de destino
  showButton?: boolean // Nova prop para controlar a visibilidade do botão
  imageUrl?: string // NEW: Prop para a URL da imagem
  imageScale?: number // NEW: Prop to control image scale
}

export default function ScratchCardSection({
  targetLink,
  showButton = true,
  imageUrl,
  imageScale,
}: ScratchCardSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false) // Simular estado vazio
  const router = useRouter() // Initialize useRouter

  const playRaspadinha = () => {
    // Redireciona para a página da raspadinha ou para o link de destino
    router.push(targetLink || "/raspadinha")
  }

  // Animação de borda pulsante
  const borderAnimation = {
    scale: [1, 1.02, 1],
    borderColor: ["#FFD700", "#FFA500", "#FFD700"],
    boxShadow: ["0 0 10px rgba(255,215,0,0.4)", "0 0 20px rgba(255,165,0,0.8)", "0 0 10px rgba(255,215,0,0.4)"],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  }

  return (
    <section className="mb-4 md:mb-6 relative flex flex-col items-center justify-center">
      {/* Efeito de brilho de fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-[#FFD700]/10 to-[#FFD700]/5 rounded-xl blur-xl opacity-70"></div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-[#9FFF00]" />
        </div>
      ) : isEmpty ? (
        <div className="text-center text-gray-400 py-10">Nenhuma raspadinha disponível no momento.</div>
      ) : (
        <>
          {/* O card da raspadinha agora é o conteúdo principal da seção */}
          <motion.div
            key={scratchCards[0].id} // Apenas um card
            className="relative bg-[#1E2530] rounded-xl overflow-hidden shadow-2xl cursor-pointer w-full max-w-xl h-[400px] border-2 border-[#FFD700] transform transition-all duration-300 hover:scale-105 hover:shadow-gold-glow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={playRaspadinha} // Redireciona ao clicar no card
          >
            {/* Animação de Borda Pulsante */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={borderAnimation}
              style={{
                border: "2px solid", // Borda mais fina
                borderColor: "#FFD700",
                boxShadow: "0 0 10px rgba(255,215,0,0.4)",
              }}
            />

            {/* Nova Animação de Brilho Diagonal */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"
              style={{
                backgroundSize: "200% 200%",
              }}
              initial={{ backgroundPosition: "200% 200%" }}
              animate={{ backgroundPosition: "-50% -50%" }}
              transition={{
                duration: 3.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                repeatDelay: Math.random() * 7 + 5,
                ease: "easeInOut",
              }}
            />

            {/* Imagem da Raspadinha - Agora ocupa 100% do card */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={imageUrl || scratchCards[0].image_url || "/placeholder.svg"}
                alt={scratchCards[0].name}
                fill
                sizes="(max-width: 768px) 100vw, 36rem"
                style={{ objectFit: "contain", transform: `scale(${imageScale || 1})` }}
                priority
              />
            </div>
          </motion.div>

          {/* Botão "Raspe Agora" - Renderizado condicionalmente */}
          {showButton && (
            <Button
              className="mt-6 w-full max-w-xs bg-[#9FFF00] text-[#191F26] py-3 rounded-lg font-bold shadow-lg hover:bg-[#8AE600] transition-colors duration-300"
              onClick={playRaspadinha} // Redireciona ao clicar no botão
            >
              Raspe Agora!
            </Button>
          )}
        </>
      )}
    </section>
  )
}
