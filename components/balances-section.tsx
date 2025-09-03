"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useSpring, animated } from "@react-spring/web"
import WithdrawModal from "./withdraw-modal"
import { obterChancesInstantaneasNaoUtilizadas } from "@/lib/sorteio-service"
import { useCarteiraPremios } from "@/hooks/use-carteira-premios"

// Helper para formatar valores como moeda BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

interface BalancesSectionProps {
  saldoParaJogar: number
  onOpenDepositModal: () => void
  onOpenTransferModal: () => void
  onWithdrawSuccess: (amount: number) => void // Callback para sucesso do saque
}

export default function BalancesSection({
  saldoParaJogar: initialSaldoParaJogar,
  onOpenDepositModal,
  onOpenTransferModal,
  onWithdrawSuccess,
}: BalancesSectionProps) {
  const { saldo: saldoSacavel, isLoading: isLoadingSaldo } = useCarteiraPremios()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [saldoParaJogar, setSaldoParaJogar] = useState(initialSaldoParaJogar)

  // Animação para saldo_para_jogar
  const animatedSaldoParaJogar = useSpring({
    from: { number: saldoParaJogar },
    to: { number: saldoParaJogar },
    config: { duration: 500 },
    reset: true,
  })

  // Função para buscar chances instantâneas não utilizadas
  const fetchChances = async () => {
    const chances = await obterChancesInstantaneasNaoUtilizadas();
    setSaldoParaJogar(chances);
  };

  // Buscar chances instantâneas não utilizadas ao montar o componente
  useEffect(() => {
    fetchChances();
  }, []);

  // Atualizar o saldo quando houver uma compra bem-sucedida
  useEffect(() => {
    if (initialSaldoParaJogar !== saldoParaJogar) {
      setSaldoParaJogar(initialSaldoParaJogar);
      fetchChances(); // Atualiza as chances após uma mudança no saldo
    }
  }, [initialSaldoParaJogar]);

  // Animação para saldoSacavel
  const animatedSaldoSacavel = useSpring({
    from: { number: saldoSacavel },
    to: { number: saldoSacavel },
    config: { duration: 500 },
    reset: true,
  })

  useEffect(() => {
    // Você pode buscar os dados reais do usuário aqui
  }, [])

  return (
    <div
      className="mb-4 md:mb-6 px-3 md:px-4 lg:px-8 max-w-full md:max-w-6xl mx-auto w-full bg-gradient-to-br from-[#1E3B3A] to-[#162A3A] rounded-xl md:rounded-2xl p-3 md:p-4 shadow-md relative"
      style={{ boxShadow: "0 0 20px rgba(30, 59, 58, 0.3)" }}
    >
      <div className="flex flex-row gap-4 items-center justify-center">
        {/* Card de Fichas */}
        <div className="flex-1 bg-[#1E3B3A]/40 backdrop-blur-md rounded-lg p-3 border border-[#9FFF00]/10 flex flex-col items-center text-center">
          <Image src="/images/moeda-2.png" alt="Fichas" width={40} height={40} className="mb-2" />
          <p className="text-sm text-gray-300">Chances Instantâneas</p>
          <animated.p className="text-2xl font-bold text-[#9FFF00] mb-3">
            {animatedSaldoParaJogar.number.to((n) => {
              const value = Math.max(0, Math.floor(n || 0));
              return value.toLocaleString("pt-BR");
            })}
          </animated.p>
          <Button
            onClick={onOpenDepositModal}
            className="w-full bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow"
          >
            + Chances
          </Button>
        </div>

        {/* Botão de Transferência Central - Temporariamente oculto */}
        {false && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-transparent border-2 border-[#9FFF00] rounded-full flex items-center justify-center shadow-lg hover:bg-[#9FFF00]/10 transition-colors"
            onClick={onOpenTransferModal}
          >
            <ArrowLeft className="h-5 w-5 text-[#9FFF00]" />
            <span className="sr-only">Transferir</span>
          </Button>
        )}

        {/* Card Para Sacar */}
        <div className="flex-1 bg-[#1E3B3A]/40 backdrop-blur-md rounded-lg p-3 border border-[#9FFF00]/10 flex flex-col items-center text-center">
          <Image src="/images/carteira_raspepix-2.png" alt="Carteira" width={40} height={40} className="mb-2" />
          <p className="text-sm text-gray-300">Para Sacar</p>
          <animated.p className="text-2xl font-bold text-white mb-3">
            {animatedSaldoSacavel.number.to((n) => formatCurrency(n))}
          </animated.p>
          <Button
            onClick={() => setShowWithdrawModal(true)}
            className="w-full bg-transparent hover:bg-white/10 text-white border border-white/20 font-medium transition-all duration-300"
          >
            Sacar Dindin $
          </Button>
        </div>
      </div>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        currentSaldoSacavel={saldoSacavel} // Passando o saldo sacável
        onWithdrawSuccess={onWithdrawSuccess} // Passando o callback de sucesso
      />
    </div>
  )
}
