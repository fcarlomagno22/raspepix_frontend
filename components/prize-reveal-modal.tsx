"use client"

import { useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"

interface PrizeRevealModalProps {
  open: boolean
  prize: number
  luckyNumber: string | null
  onClose: () => void
  onBuyAnotherClick: () => void
  onGoHomeClick: () => void // New prop for home button
}

export function PrizeRevealModal({
  open,
  prize,
  luckyNumber,
  onClose,
  onBuyAnotherClick,
  onGoHomeClick,
}: PrizeRevealModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const applauseAudioRef = useRef<HTMLAudioElement>(null)

  const videoUrl =
    prize > 0
      ? "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/videos/vitoria_resultado.mp4"
      : "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/videos/derrota_modal.mp4"
  const audioUrl =
    "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/sound%20effects/aplausos_raspepix.mp3"

  const fireConfetti = useCallback(() => {
    const common = {
      origin: { y: 0.7 },
      disableForReducedMotion: true,
    }

    confetti({
      ...common,
      particleCount: 100,
      spread: 70,
      scalar: 1.2,
      colors: ["#9FFF00", "#ffffff", "#FFD700"],
    })

    confetti({
      ...common,
      particleCount: 50,
      spread: 60,
      startVelocity: 25,
      scalar: 0.9,
      colors: ["#9FFF00", "#ffffff", "#FFD700"],
    })

    confetti({
      ...common,
      particleCount: 30,
      spread: 50,
      startVelocity: 35,
      scalar: 0.7,
      colors: ["#9FFF00", "#ffffff", "#FFD700"],
    })
  }, [])

  useEffect(() => {
    if (open) {
      if (videoRef.current) {
        videoRef.current.load()
        videoRef.current.play().catch((error) => console.error("Video playback failed:", error))
      }

      if (prize > 0) {
        const playAudio = setTimeout(() => {
          if (applauseAudioRef.current) {
            applauseAudioRef.current.play().catch((error) => console.error("Audio playback failed:", error))
          }
        }, 500)

        fireConfetti()

        return () => clearTimeout(playAudio)
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
      if (applauseAudioRef.current) {
        applauseAudioRef.current.pause()
        applauseAudioRef.current.currentTime = 0
      }
    }
  }, [open, prize, fireConfetti])

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
        className="relative bg-black rounded-xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col h-[500px] sm:h-[600px]"
      >
        {/* Video as background */}
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          muted
          autoPlay
          loop={prize === 0}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay for content */}
        <div className="absolute inset-0 bg-black/60 flex flex-col p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-200 hover:text-white z-10"
          >
            <X className="h-5 w-5" />
          </Button>
          {/* Content area */}
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            {prize > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="relative flex items-center justify-center mb-4"
                >
                  <motion.div
                    initial={{ boxShadow: "0 0 0px #9FFF00" }}
                    animate={{ boxShadow: ["0 0 0px #9FFF00", "0 0 20px #9FFF00", "0 0 0px #9FFF00"] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[#9FFF00]/20 blur-xl rounded-full"
                  />
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, type: "spring", damping: 10, stiffness: 200 }}
                    className="text-5xl font-bold text-white z-10"
                  >
                    {formatCurrency(prize)}
                  </motion.span>
                </motion.div>
                <motion.div
                  initial={{ y: 0, opacity: 1, rotate: 0 }}
                  animate={{ y: -100, opacity: 0, rotate: 30 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    ease: "easeOut",
                    delay: 0.2,
                  }}
                  className="absolute top-1/4 left-1/4 text-4xl text-[#9FFF00] opacity-70"
                >
                  $
                </motion.div>
                <motion.div
                  initial={{ y: 0, opacity: 1, rotate: 0 }}
                  animate={{ y: -120, opacity: 0, rotate: -40 }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    ease: "easeOut",
                    delay: 0.4,
                  }}
                  className="absolute top-1/3 right-1/4 text-4xl text-white opacity-70"
                >
                  R$
                </motion.div>
              </>
            )}

            <div className="text-center mb-6">
              {prize > 0 ? (
                <>
                  <h2 className="text-3xl font-bold text-white mb-2">Parabéns!</h2>
                  <p className="text-gray-200 text-lg mb-2">Você ganhou um prêmio!</p>
                  <p className="text-gray-200 text-lg mb-4">
                    Número da sorte: <span className="font-bold text-[#9FFF00]">{luckyNumber}</span>
                  </p>
                  <p className="text-gray-200 text-sm">O valor foi adicionado ao seu saldo sacável!</p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white mb-2">Não foi dessa vez!</h2>
                  <p className="text-gray-200 text-lg mb-4">Continue tentando para ganhar prêmios incríveis.</p>
                  <motion.span
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "easeInOut" }}
                    className="text-6xl"
                  >
                    😢
                  </motion.span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full">
            {" "}
            {/* Use flex-col and gap for vertical stacking */}
            <Button
              onClick={onBuyAnotherClick}
              className="w-full bg-[#9FFF00] text-[#191F26] py-3 rounded-lg font-bold shadow-lg hover:bg-[#8AE600]"
            >
              Tentar de novo!
            </Button>
            <Button
              onClick={onGoHomeClick}
              variant="outline" // Use outline variant for secondary action
              className="w-full border-gray-400 text-gray-200 hover:bg-gray-700 hover:text-white py-3 rounded-lg font-bold shadow-lg"
            >
              Voltar para a página principal
            </Button>
          </div>
        </div>
        <audio ref={applauseAudioRef} src={audioUrl} preload="auto" />
      </motion.div>
    </motion.div>
  )
}
