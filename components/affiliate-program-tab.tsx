"use client"

import { useState, useEffect } from "react"
import { Users, Gift, Copy, Check, Share2, Loader2, ImageIcon, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSpring, animated } from "@react-spring/web"
import WithdrawModal from "./withdraw-modal" // Importar o WithdrawModal
import Link from "next/link"

// Helper para formatar valores como moeda BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

interface AffiliateProgramTabProps {
  affiliateBalance: number
  setAffiliateBalance: (amount: number) => void
  referralsCount: number
  setReferralsCount: (count: number) => void
  currentSaldoSacavel: number
  onUpdateSaldoSacavel: (newAmount: number) => void
  onWithdrawSuccess: (amount: number) => void // Passar o callback do WithdrawModal
  isTransferringBalance: boolean
  handleTransferBalance: () => void
}

export default function AffiliateProgramTab({
  affiliateBalance,
  setAffiliateBalance,
  referralsCount,
  setReferralsCount,
  currentSaldoSacavel,
  onUpdateSaldoSacavel,
  onWithdrawSuccess,
  isTransferringBalance,
  handleTransferBalance,
}: AffiliateProgramTabProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false) // Estado para controlar a animação
  const [showWithdrawModal, setShowWithdrawModal] = useState(false) // Estado para o modal de saque

  const affiliateLink = "https://raspepix.com/indique/seulinkunico12345" // Mock link

  // Animação para saldo e indicados - executa apenas uma vez
  const animatedAffiliateBalance = useSpring({
    from: { number: hasAnimated ? affiliateBalance : 0 },
    to: { number: affiliateBalance },
    config: { duration: 1000 },
    reset: false, // Não resetar a animação
  })

  const animatedTotalReferrals = useSpring({
    from: { number: hasAnimated ? referralsCount : 0 },
    to: { number: referralsCount },
    config: { duration: 1000 },
    reset: false, // Não resetar a animação
  })

  // Marca que a animação já ocorreu após a primeira renderização
  useEffect(() => {
    setHasAnimated(true)
  }, [])

  const handleSacarAffiliateBalance = () => {
    handleTransferBalance() // Chama a função de transferência centralizada
    // Abre o modal de saque APÓS a simulação de transferência
    setTimeout(() => {
      setShowWithdrawModal(true)
    }, 1000) // Espera a transferência simulada terminar
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RaspePix - Programa de Afiliados",
          text: "Ganhe comissões indicando seus amigos para a RaspePix!",
          url: affiliateLink,
        })
        console.log("Link compartilhado com sucesso!")
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      handleCopyLink()
      alert("Seu navegador não suporta o compartilhamento nativo. O link foi copiado para a área de transferência!")
    }
  }

  return (
    <div className="space-y-6">
      {/* Saldo de Afiliado */}
      <div className="bg-gradient-to-br from-[#366D51] to-[#1E3B3A] rounded-xl p-4 mb-6 relative overflow-hidden shadow-lg">
        {/* Efeitos de fundo */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#9FFF00]/10 rounded-full blur-[30px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#9FFF00]/10 rounded-full blur-[20px] translate-x-1/2 translate-y-1/2"></div>

        <h2 className="text-lg font-semibold text-center text-white mb-4 relative z-10">Saldo de Afiliado</h2>

        <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
          {/* Total de Indicados */}
          <div className="flex flex-col items-center justify-center bg-[#1a323a] rounded-lg p-3 shadow-inner">
            <div className="p-2 rounded-full bg-[#9FFF00]/20 mb-2">
              <Users className="h-6 w-6 text-[#9FFF00]" />
            </div>
            <animated.p className="text-2xl font-bold text-white">
              {animatedTotalReferrals.number.to((n) => Math.floor(n))}
            </animated.p>
            <p className="text-sm text-gray-400">Total de Indicados</p>
          </div>

          {/* Comissões */}
          <div className="flex flex-col items-center justify-center bg-[#1a323a] rounded-lg p-3 shadow-inner relative">
            {/* Efeito de brilho sutil */}
            <div className="absolute inset-0 rounded-lg bg-[#9FFF00]/5 animate-pulse-glow-golden"></div>
            <div className="p-2 rounded-full bg-[#9FFF00]/20 mb-2 relative z-10">
              <Gift className="h-6 w-6 text-[#9FFF00]" />
            </div>
            <animated.p className="text-2xl font-bold text-white relative z-10">
              {animatedAffiliateBalance.number.to((n) => formatCurrency(n))}
            </animated.p>
            <p className="text-sm text-gray-400 relative z-10">Comissões</p>
          </div>
        </div>

        <Button
          onClick={handleSacarAffiliateBalance}
          className="w-full bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow relative z-10"
          disabled={isTransferringBalance || affiliateBalance <= 0}
        >
          {isTransferringBalance ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transferindo...
            </>
          ) : (
            "Sacar"
          )}
        </Button>
      </div>

      {/* Link de Afiliado */}
      <div className="bg-[#1E2530] rounded-xl p-4 mb-4 shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Seu Link de Afiliado</h2>
        <div className="flex items-center space-x-2 mb-4">
          <Input
            type="text"
            value={affiliateLink}
            readOnly
            className="flex-grow bg-[#191F26] border-[#1a323a] text-[#9FFF00] truncate focus:border-[#9FFF00] focus:ring-[#9FFF00]"
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-[#9FFF00] hover:bg-[#1a323a] hover:text-white"
            onClick={handleCopyLink}
          >
            {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            <span className="sr-only">{isCopied ? "Copiado!" : "Copiar link"}</span>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Button
            onClick={handleShareLink}
            className="h-24 w-24 flex flex-col items-center justify-center gap-1 p-2 bg-[#9FFF00]/20 hover:bg-[#9FFF00]/30 text-[#9FFF00] font-medium transition-all duration-300"
          >
            <Share2 className="h-8 w-8" />
            <span className="text-xs text-center leading-tight">
              Compartilhar
              <br />
              Link
            </span>
          </Button>
          <Button className="h-24 w-24 flex flex-col items-center justify-center gap-1 p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-[#191F26] font-medium transition-all duration-300">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs text-center leading-tight">
              Biblioteca de
              <br />
              Criativos
            </span>
          </Button>
          <Link href="/carreira" passHref>
            <Button
              variant="outline"
              className="h-24 w-24 flex flex-col items-center justify-center gap-1 p-2 text-[#9FFF00] border-[#9FFF00] hover:bg-[#9FFF00] hover:text-[#191F26] transition-colors duration-200 bg-transparent"
            >
              <Award className="h-8 w-8" />
              <span className="text-xs text-center leading-tight">
                Plano de
                <br />
                Carreira
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Como Funciona */}
      <div className="bg-[#1E2530] rounded-xl p-4 shadow-lg mb-20">
        <h2 className="text-lg font-semibold text-white mb-4">Como Funciona</h2>
        <div className="space-y-4">
          {/* Passo 1 */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#9FFF00] flex items-center justify-center text-[#191F26] font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-semibold text-white">Compartilhe seu link</h3>
              <p className="text-sm text-gray-400">Envie seu link exclusivo para seus amigos e contatos.</p>
            </div>
          </div>
          {/* Passo 2 */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#9FFF00] flex items-center justify-center text-[#191F26] font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-semibold text-white">Seus amigos se cadastram</h3>
              <p className="text-sm text-gray-400">Eles se registram na RaspePix usando seu link.</p>
            </div>
          </div>
          {/* Passo 3 */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#9FFF00] flex items-center justify-center text-[#191F26] font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="font-semibold text-white">Eles fazem depósitos</h3>
              <p className="text-sm text-gray-400">Quando eles compram títulos, a mágica acontece!</p>
            </div>
          </div>
          {/* Passo 4 */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#9FFF00] flex items-center justify-center text-[#191F26] font-bold text-sm">
              4
            </div>
            <div>
              <h3 className="font-semibold text-white">Você ganha 5% de comissão!</h3>
              <p className="text-sm text-gray-400">Receba uma porcentagem de cada depósito que eles fizerem.</p>
            </div>
          </div>
        </div>
      </div>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        currentSaldoSacavel={currentSaldoSacavel} // Passa o saldo sacável atualizado
        onWithdrawSuccess={onWithdrawSuccess} // Passa o callback para o modal
      />
    </div>
  )
}
