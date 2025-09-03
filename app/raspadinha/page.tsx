"use client"

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExitConfirmationDialog } from "@/components/exit-confirmation-dialog"
import { PrizeRevealModal } from "@/components/prize-reveal-modal"
import { ScratchCard } from "@/components/scratch-card"
import { fetchRaspadinhaData, fetchUserProfile, type Raspadinha } from "@/lib/raspadinha-data"
import { realizarSorteioInstantaneo, obterChancesInstantaneasNaoUtilizadas } from "@/lib/sorteio-service"
import type { UserProfile } from "@/types/user"
import { motion } from "framer-motion"
import { useAudioPlayer } from "@/contexts/audio-player-context" // Import useAudioPlayer
import { InsufficientChancesModal } from "@/components/insufficient-chances-modal"

export default function RaspadinhaPage() {
  const router = useRouter()
  const { volume, setVolume } = useAudioPlayer() // Get volume (to read initial) and setVolume (to control)

  const originalVolumeRef = useRef<number | null>(null) // Store original volume
  const hasSetInitialVolumeRef = useRef(false) // Flag to ensure initial volume setting runs only once

  const [raspadinha, setRaspadinha] = useState<Raspadinha | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [prizeWon, setPrizeWon] = useState<number>(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)
  const [isCardScratched, setIsCardScratched] = useState(false)
  const [isCardFullyRevealed, setIsCardFullyRevealed] = useState(false)
  const [luckyNumber, setLuckyNumber] = useState<string | null>(null)
  const [playCount, setPlayCount] = useState(0) // New state to track plays
  const [isInsufficientChancesModalOpen, setIsInsufficientChancesModalOpen] = useState(false)

  const imageRef = useRef<HTMLImageElement>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  // Effect to handle volume change on mount and unmount
  useEffect(() => {
    // Only set initial volume if it hasn't been set yet and volume is available
    if (!hasSetInitialVolumeRef.current && volume !== undefined) {
      originalVolumeRef.current = volume // Capture the current volume from context
      setVolume(volume * 0.5) // Decrease volume by 50% using context's setVolume
      hasSetInitialVolumeRef.current = true // Mark as set
    }

    return () => {
      // Cleanup: restore original volume when component unmounts
      if (originalVolumeRef.current !== null) {
        setVolume(originalVolumeRef.current) // Restore volume using context's setVolume
        originalVolumeRef.current = null // Reset ref for potential future remounts
        hasSetInitialVolumeRef.current = false // Reset flag
      }
    }
  }, [setVolume, volume]) // `volume` is a dependency to ensure we capture its *initial* value when it's ready.
  // `setVolume` is stable due to useCallback. The `hasSetInitialVolumeRef` prevents re-execution.

  // Effect to restore volume when modal closes
  useEffect(() => {
    if (!isModalOpen && originalVolumeRef.current !== null) {
      setVolume(originalVolumeRef.current) // Restore volume using context's setVolume
    }
  }, [isModalOpen, setVolume]) // Depend on isModalOpen and setVolume (stable)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [cardData, profileData, chances] = await Promise.all([
          fetchRaspadinhaData(),
          fetchUserProfile(),
          obterChancesInstantaneasNaoUtilizadas()
        ])
        
        setRaspadinha(cardData)
        setUserProfile(profileData)

        // Verificar se o usuário tem chances suficientes usando o valor real do banco
        if (chances <= 0) {
          setIsInsufficientChancesModalOpen(true)
        }
      } catch (error) {
        console.error("Failed to load raspadinha or user data:", error)
        // Não abrimos o modal em caso de erro, apenas se confirmamos que não há chances
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  useLayoutEffect(() => {
    const img = imageRef.current
    if (img) {
      const updateDimensions = () => {
        // Get the rendered size of the image
        setImageDimensions({
          width: img.offsetWidth,
          height: img.offsetHeight,
        })
      }

      // If image is already loaded, update dimensions immediately
      if (img.complete) {
        updateDimensions()
      } else {
        // Otherwise, wait for it to load
        img.onload = updateDimensions
      }

      // Also update dimensions on window resize
      window.addEventListener("resize", updateDimensions)
      return () => window.removeEventListener("resize", updateDimensions)
    }
  }, [isLoading])

  const handleScratchComplete = useCallback(
    async (percent: number) => {
      setIsCardScratched(true)
      // Trigger reveal when 55% scratched
      if (percent >= 55 && !isCardFullyRevealed) {
        setIsCardFullyRevealed(true)

        try {
          const resultado = await realizarSorteioInstantaneo();
          
          if (resultado.sucesso) {
            setPrizeWon(resultado.valor_premio || 0);
            setLuckyNumber(resultado.numero_sorteado);
          } else {
            setPrizeWon(0);
            setLuckyNumber(resultado.numero_sorteado);
          }
          
          setIsModalOpen(true);
          setPlayCount((prev) => prev + 1);

        } catch (error) {
          console.error('Erro ao realizar sorteio:', error);
          setPrizeWon(0);
          setLuckyNumber(null);
          setIsModalOpen(true);
        }
      }
    },
    [isCardFullyRevealed],
  )

  const handleReveal = useCallback(() => {
    setIsCardFullyRevealed(true)
    // This callback is triggered when the card is fully revealed (e.g., by scratching enough)
    // The prize calculation and modal opening are now handled in handleScratchComplete
  }, [])

  const handlePlayAgain = useCallback(() => {
    setIsModalOpen(false)
    setIsCardScratched(false)
    setIsCardFullyRevealed(false)
    setPrizeWon(0)
    setLuckyNumber(null)
    // Volume restoration is now handled by the useEffect watching `isModalOpen`
  }, [])

  const handleBack = useCallback(() => {
    if (isCardScratched && !isCardFullyRevealed) {
      setIsExitConfirmOpen(true)
    } else {
      router.back()
    }
  }, [isCardScratched, isCardFullyRevealed, router])

  const confirmExit = useCallback(() => {
    setIsExitConfirmOpen(false)
    // Volume restoration is now handled by the useEffect cleanup on unmount
    router.back()
  }, [router])

  const cancelExit = useCallback(() => {
    setIsExitConfirmOpen(false)
  }, [])

  // New handler for navigating to /home
  const handleGoHome = useCallback(() => {
    setIsModalOpen(false) // Close the modal first
    if (originalVolumeRef.current !== null) {
      setVolume(originalVolumeRef.current) // Restore volume before navigating
    }
    router.push("/home") // Navigate to /home
  }, [router, setVolume])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#191F26] text-white">
        Carregando Raspadinha...
      </div>
    )
  }

  if (!raspadinha) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#191F26] text-white">
        Erro ao carregar a raspadinha.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#191F26] relative overflow-hidden">
      {/* Floating Money and Coin Icons Background */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`money-${i}`}
          initial={{ y: "100vh", x: `${Math.random() * 100}vw`, opacity: 0, rotate: 0 }}
          animate={{
            y: ["100vh", "-100vh"],
            x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
            opacity: [0, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 10 + 5, // 5 to 15 seconds
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 5,
            ease: "linear",
          }}
          className="absolute text-yellow-400 text-5xl z-0"
          style={{ left: `${Math.random() * 100}vw`, top: `${Math.random() * 100}vh` }}
        >
          💸
        </motion.div>
      ))}
      {[...Array(10)].map((_, i) => (
        <motion.img
          key={`coin-${i}`}
          src={i % 2 === 0 ? "/images/coin.png" : "/images/moeda-2.png"}
          alt="Coin"
          initial={{ y: "100vh", x: `${Math.random() * 100}vw`, opacity: 0, rotate: 0 }}
          animate={{
            y: ["100vh", "-100vh"],
            x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
            opacity: [0, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 10 + 5, // 5 to 15 seconds
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 5,
            ease: "linear",
          }}
          className="absolute w-10 h-10 z-0"
          style={{ left: `${Math.random() * 100}vw`, top: `${Math.random() * 100}vh` }}
        />
      ))}
      {/* New: Floating Sparkle/Star Icons Background */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          initial={{ y: "100vh", x: `${Math.random() * 100}vw`, opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{
            y: ["100vh", "-100vh"],
            x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: Math.random() * 8 + 4, // 4 to 12 seconds
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 4,
            ease: "linear",
          }}
          className="absolute text-yellow-300 text-3xl z-0"
          style={{ left: `${Math.random() * 100}vw`, top: `${Math.random() * 100}vh` }}
        >
          {Math.random() > 0.5 ? "✨" : "⭐"}
        </motion.div>
      ))}

      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 text-[#9ffe00] hover:bg-[#1a323a] hover:text-white z-30"
        onClick={handleBack}
      >
        <ArrowLeft className="h-6 w-6" />
        <span className="sr-only">Voltar</span>
      </Button>

      {/* Centralized and large image */}
      <img
        ref={imageRef}
        src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//Design%20sem%20nome-16-2.png"
        alt="Super Raspepix Scratch Card"
        className="max-w-[85vw] max-h-[85vh] w-auto h-auto object-contain z-10"
      />

      {/* ScratchCard component overlaying the image */}
      {imageDimensions.width > 0 && imageDimensions.height > 0 && (
        <ScratchCard
          raspadinha={raspadinha}
          isRevealed={isCardFullyRevealed}
          onScratchComplete={handleScratchComplete}
          onReveal={handleReveal}
          imageDimensions={imageDimensions}
        />
      )}

      {/* Prize Reveal Modal */}
      <PrizeRevealModal
        open={isModalOpen}
        onClose={handlePlayAgain} // Use handlePlayAgain for closing
        prize={prizeWon}
        luckyNumber={luckyNumber} // Pass luckyNumber
        onBuyAnotherClick={handlePlayAgain} // Use handlePlayAgain for "Tentar de novo!" button
        onGoHomeClick={handleGoHome} // Pass the new handler
      />

      {/* Exit Confirmation Dialog */}
      <ExitConfirmationDialog isOpen={isExitConfirmOpen} onConfirm={confirmExit} onCancel={cancelExit} />

      {/* Insufficient Chances Modal */}
      <InsufficientChancesModal
        open={isInsufficientChancesModalOpen}
        onOpenChange={setIsInsufficientChancesModalOpen}
      />
    </div>
  )
}
