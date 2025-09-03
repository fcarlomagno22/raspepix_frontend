"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useCarteiraPremios } from "@/hooks/use-carteira-premios"

// Atualize a interface SlotBalancesProps para incluir currentMultiplier
interface SlotBalancesProps {
  gameChips: number // Fichas para jogar
  currentMultiplier: number // Multiplicador atual
}

export function SlotBalances({
  gameChips,
  currentMultiplier,
}: SlotBalancesProps) {
  const { saldo: saldoSacavel, isLoading: isLoadingSaldo } = useCarteiraPremios()
  return (
    <motion.div
      className="relative z-20 mt-4 p-2 bg-black bg-opacity-70 rounded-lg border border-yellow-500 shadow-md
                 w-full max-w-[350px] mx-auto flex flex-row items-center justify-around gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      {/* Fichas para Jogar Section */}
      <div className="flex items-center gap-2">
        <Image src="/images/moeda-2.png" alt="Moedas" width={24} height={24} className="drop-shadow-sm" />
        <p className="text-sm font-bold text-[#9FFF00]">{gameChips}</p> {/* Exibe as fichas de jogo */}
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-yellow-500/50" />

      {/* Saldo Sacável Section */}
      <div className="flex items-center gap-2">
        <Image src="/images/carteira_raspepix-2.png" alt="Carteira" width={24} height={24} className="drop-shadow-sm" />
        <p className="text-sm font-bold text-white">R$ {saldoSacavel.toFixed(2).replace(".", ",")}</p>{" "}
        {/* Exibe o saldo sacável */}
      </div>

      {/* Adicione a exibição do multiplicador dentro do componente SlotBalances */}
      {/* Adicione este bloco de código logo após o div do "Saldo Sacável Section" */}
      {currentMultiplier > 1 && (
        <>
          <div className="h-6 w-px bg-yellow-500/50" />
          <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <span className="text-xs font-bold text-blue-400">x{currentMultiplier}</span>
            <motion.span
              className="text-xs text-yellow-300 font-semibold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1, textShadow: "0 0 8px rgba(255,255,0,0.7)" }}
              transition={{
                duration: 0.4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 0.2,
              }}
            >
              BOOSTER!
            </motion.span>
          </motion.div>
        </>
      )}

      {/* O contador de fichas para o próximo nível do multiplicador foi movido para app/slot/page.tsx */}
    </motion.div>
  )
}
