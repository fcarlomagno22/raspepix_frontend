"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import DepositModal from "@/components/deposit-modal"
import BalancesSection from "@/components/balances-section"
import WinnerAvatar from "@/components/winner-avatar"
import ScratchCardSection from "@/components/scratch-card-section"
import TransferModal from "@/components/transfer-modal"
import { useAudioPlayer } from "@/contexts/audio-player-context"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { api } from "@/services/api"
import { getMusicas } from "@/services/musica"
import type { Musica, MusicaResponse } from "@/types/musica"

interface Winner {
  id: number;
  name: string;
  prize: string;
  video: string;
}

interface ParticleElement {
  key: string;
  element: React.ReactElement;
}

export default function HomePage() {
  const router = useRouter();
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [saldoParaJogar, setSaldoParaJogar] = useState(0)
  const [saldoSacavel, setSaldoSacavel] = useState(500.0)
  const [particles2, setParticles2] = useState<ParticleElement[]>([])
  const [pluralParticles, setPluralParticles] = useState<ParticleElement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { isPlaying, playRandomSong, shufflePlaylist } = useAudioPlayer()
  const hasAttemptedInitialPlay = useRef(false)
  const hasFetchedPlaylist = useRef(false)

  useEffect(() => {
    const fetchInitialBalance = async () => {
      try {
        const response = await api.get('/api/sorteio/instantaneos/nao-utilizados');
        setSaldoParaJogar(response.data.quantidade || 0);
      } catch (error) {
        console.error('Erro ao buscar saldo inicial:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialBalance();
  }, [])

  useEffect(() => {
    if (hasFetchedPlaylist.current) return;
    hasFetchedPlaylist.current = true;

    (async () => {
      try {
        const response = await api.get<MusicaResponse>("/api/musica");
        if (response.data?.data) {
          const musicas = response.data.data;
          shufflePlaylist(musicas);
          
          // Só toca uma música nova se não estiver tocando nenhuma
          if (!isPlaying) {
            playRandomSong();
          }
        }
      } catch (err) {
        console.error("Erro ao carregar playlist:", err);
        if (err && typeof err === 'object' && 'response' in err && (err.response as any)?.status === 401) {
          router.replace('/login?from=/home');
        }
      }
    })();
  }, [isPlaying, shufflePlaylist, playRandomSong, router]); // Adicionando todas as dependências necessárias

  useEffect(() => {
    const particles = Array.from({ length: 15 }).map((_, i) => ({
      key: `p2-${i}`,
      element: (
      <motion.div
        key={`p2-${i}`}
        className="absolute rounded-full"
        style={{
          width: `${Math.random() * 8 + 4}px`,
          height: `${Math.random() * 8 + 4}px`,
          backgroundColor: "#FFD700",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          filter: `blur(${Math.random() * 1.5}px)`,
        }}
        animate={{
          opacity: [0, 0.8, 0],
          scale: [0.7, 1.2, 0.7],
          y: [0, Math.random() * 40 - 20, 0],
          x: [0, Math.random() * 30 - 15, 0],
        }}
        transition={{
          duration: Math.random() * 4 + 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          delay: Math.random() * 1.5,
        }}
      />
      )
    }))

    const pluralParticles = Array.from({ length: 10 }).map((_, i) => ({
      key: `pp-${i}`,
      element: (
      <motion.div
        key={`pp-${i}`}
        className="absolute rounded-full"
        style={{
          width: `${Math.random() * 6 + 3}px`,
          height: `${Math.random() * 6 + 3}px`,
          backgroundColor: "#9FFF00",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          filter: `blur(${Math.random() * 1}px)`,
        }}
        animate={{
          opacity: [0, 0.7, 0],
          scale: [0.8, 1.1, 0.8],
          y: [0, Math.random() * 30 - 15, 0],
          x: [0, Math.random() * 20 - 10, 0],
        }}
        transition={{
          duration: Math.random() * 3 + 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          delay: Math.random() * 1,
        }}
      />
      )
    }))

    setParticles2(particles)
    setPluralParticles(pluralParticles)
  }, []) // Executa apenas uma vez na montagem

  const winners: Winner[] = [
    { id: 1, name: "Carlos S.", prize: "R$ 20.000", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 2, name: "Ana M.", prize: "R$ 85,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 3, name: "Roberto L.", prize: "R$ 50,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 4, name: "Juliana P.", prize: "R$ 100,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 5, name: "Marcos T.", prize: "R$ 25,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 6, name: "Fernanda C.", prize: "R$ 75,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 7, name: "João P.", prize: "R$ 15,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 8, name: "Maria L.", prize: "R$ 60,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 9, name: "Pedro A.", prize: "R$ 120,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 10, name: "Sofia R.", prize: "R$ 30,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 11, name: "Lucas G.", prize: "R$ 90,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
    { id: 12, name: "Beatriz F.", prize: "R$ 45,00", video: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4" },
  ]

  const handleDepositSuccess = (data: { 
    numerosCapitalizadora: string[], 
    numerosPremiosInstantaneos: string[],
    quantidade: number
  }) => {
    // Atualiza o saldo com a quantidade correta de números comprados
    setSaldoParaJogar((prevSaldo) => prevSaldo + data.quantidade)
    
    // TODO: Implementar lógica para mostrar os números comprados
    console.log('Números da Capitalização:', data.numerosCapitalizadora)
    console.log('Números de Prêmios Instantâneos:', data.numerosPremiosInstantaneos)
    
    setShowDepositModal(false)
  }

  const handleTransferSuccess = (amountBRL: number, chipsQuantity: number) => {
    setSaldoSacavel((prev) => prev - amountBRL)
    setSaldoParaJogar((prev) => prev + chipsQuantity)
    setShowTransferModal(false)
  }

  const handleWithdrawSuccess = (amount: number) => {
    setSaldoSacavel((prev) => prev - amount)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ffe00]"></div>
      <p className="ml-4 text-white">Carregando...</p>
    </div>
  }

  return (
    <AuthenticatedLayout>
      <div className="relative w-full h-auto overflow-hidden mb-6 md:mb-8">
        <video
          src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/videos/banner_telegram.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto object-cover"
        />
      </div>
      
      <main className="flex-1 pb-24 md:pb-28 px-3 md:px-4 lg:px-8 max-w-full md:max-w-6xl mx-auto w-full">
        {/* Segundo Vídeo Banner */}
        <div className="relative rounded-lg md:rounded-xl overflow-hidden mb-6 md:mb-8">
          {/* Animações de Partículas Douradas */}
          {particles2.map(particle => particle.element)}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative z-0"
          >
            <video
              src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/videos/iphone_novo_banner.mp4"
              autoPlay
              muted
              playsInline
              className="w-full h-auto rounded-lg md:rounded-xl"
            />
          </motion.div>
        </div>

        <Button
          onClick={() => setShowDepositModal(true)}
          className="w-full max-w-sm bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-bold text-xl h-12 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl relative z-10 flex items-center justify-center gap-2 mx-auto mb-4 md:mb-6"
        >
          Compre e Concorra
        </Button>

        {/* Seção de Saldos */}
        <BalancesSection
          saldoParaJogar={saldoParaJogar}
          saldoSacavel={saldoSacavel}
          onOpenDepositModal={() => setShowDepositModal(true)}
          onOpenTransferModal={() => setShowTransferModal(true)}
          onWithdrawSuccess={handleWithdrawSuccess}
        />
        {/* Quebra de Página Verde Limão */}
        <hr className="border-0 h-px bg-[#9FFF00]/70 rounded-full my-8 md:my-12" />
        <h2 className="text-white text-base md:text-lg font-bold mb-4 text-center">Prêmios Extras Instantâneos</h2>
        {/* Seção de Raspadinhas */}
        <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex-shrink-0 w-[280px]">
            <ScratchCardSection showButton={false} imageScale={1.2} />
          </div>
          <div className="flex-shrink-0 w-[280px]">
            <ScratchCardSection
              targetLink="/giragira"
              showButton={false}
              imageUrl="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/slots%20elements/slot.png"
            />
          </div>
          {/* Adicione mais ScratchCardSection aqui se houver mais raspadinhas para rolar */}
        </div>
        {/* Quebra de Página Verde Limão */}
        <hr className="border-0 h-px bg-[#9FFF00]/70 rounded-full my-4 md:my-6" />
        {/* Seção de Ganhadores */}
        <section className="mb-4 md:mb-6">
          <h2 className="text-white text-base md:text-lg font-bold mb-4 text-center">Conheça alguns Ganhadores</h2>
          <div className="relative">
            <div className="overflow-x-auto py-4 px-2 scrollbar-hide">
              <div className="flex space-x-4 pb-2">
                {winners.map((winner) => (
                  <WinnerAvatar
                    key={winner.id}
                    winner={winner}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Seção do Instituto Plural (Filantropia Premiável) */}
        <section
          className="mb-6 md:mb-8 bg-gradient-to-br from-[#1E3B3A] to-[#162A3A] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md relative overflow-hidden"
          style={{ boxShadow: "0 0 20px rgba(30, 59, 58, 0.3)" }}
        >
          {/* Partículas Verdes */}
          {pluralParticles.map(particle => particle.element)}

          <h2 className="text-white text-base md:text-lg font-bold mb-4 text-center relative z-10">
            Filantropia Premiável
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10">
            <div className="relative w-56 h-56 md:w-72 md:h-72 flex-shrink-0">
              <Image
                src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//instituto-plural.png"
                alt="Instituto Plural Logo"
                fill
                sizes="(max-width: 768px) 224px, 288px"
                style={{ objectFit: "contain" }}
                className="filter brightness-0 invert"
              />
            </div>
            <div className="text-center md:text-left space-y-2 flex-grow">
              <p className="text-white text-lg md:text-xl">
                <span className="text-[#9FFF00] font-semibold">Raspou, brilhou, ajudou.</span>
              </p>
              <p className="text-white text-sm md:text-base">
                É sorte com propósito. E o <span className="text-[#9FFF00] font-semibold">Instituto Plural</span> tá
                nessa com a gente.
              </p>
              <Button
                asChild
                className="mt-4 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-bold text-base h-10 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <a href="https://www.instagram.com/institutopluraloficial/" target="_blank" rel="noopener noreferrer">
                  Segue lá, vai!
                </a>
              </Button>
            </div>
          </div>
        </section>
        {/* Quebra de Página Verde Limão após a seção do Instituto Plural */}
        <hr className="border-0 h-px bg-[#9FFF00]/70 rounded-full my-8 md:my-12" />
        {/* Nova Seção de Rodapé Legal */}
        <section className="mb-6 md:mb-8 bg-[#1E2530] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md text-center">
          <div className="text-gray-400 text-xs md:text-sm leading-relaxed mb-4">
            CAPEMISA Capitalização S/A, Processo SUSEP 15414.XXXXXX/XXXX-XX. É proibida a venda de Título de
            Capitalização a menores de dezesseis anos. Antes de contratar consulte previamente as Condições Gerais. SAC
            0800 940 1130. Ouvidoria 0800 707 4936.
          </div>
          <div className="flex justify-center items-center gap-6">
            <div className="relative w-24 h-12">
              <Image
                src="/images/logo-capemisa.png"
                alt="CAPEMISA Logo"
                fill
                sizes="96px"
                style={{ objectFit: "contain" }}
                className="opacity-70"
              />
            </div>
            <div className="relative w-24 h-12">
              <Image
                src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//instituto-plural.png"
                alt="Instituto Plural Logo"
                fill
                sizes="96px"
                style={{ objectFit: "contain" }}
                className="filter brightness-0 invert opacity-70"
              />
            </div>
          </div>
        </section>
      </main>
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDepositSuccess={handleDepositSuccess}
      />
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        currentSaldoParaJogar={saldoParaJogar}
        currentSaldoSacavel={saldoSacavel}
        onTransferSuccess={handleTransferSuccess}
      />
    </AuthenticatedLayout>
  )
}

