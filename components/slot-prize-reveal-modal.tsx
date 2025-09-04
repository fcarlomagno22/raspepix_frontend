"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useRef, useState } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface SlotPrizeRevealModalProps {
  isOpen: boolean
  onClose: () => void
  onPrizeRevealed: (amount: number) => void
  prizeAmount: number // Valor real do prêmio vindo da API
}

export function SlotPrizeRevealModal({ isOpen, onClose, onPrizeRevealed, prizeAmount: realPrizeAmount }: SlotPrizeRevealModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [prizeAmount, setPrizeAmount] = useState<string>("")
  const [canClose, setCanClose] = useState(false)

  const videoSrc =
    "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/videos/vitoria_resultado.mp4"
  const applauseAudioSrc =
    "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/sound%20effects/aplausos_raspepix.mp3"

  // chama o callback **apenas** quando o modal abre
  const hasReported = useRef(false)

  useEffect(() => {
    if (isOpen && !hasReported.current) {
      // Usa o valor real do prêmio vindo da API
      const formattedPrize = realPrizeAmount.toFixed(2)
      setPrizeAmount(formattedPrize.replace(".", ","))
      onPrizeRevealed(realPrizeAmount)
      hasReported.current = true
      setCanClose(false) // Impede fechamento prematuro

      if (videoRef.current) {
        videoRef.current.play().catch((e) => console.error("Error playing video:", e))
        
        // Quando o vídeo terminar, permite fechar o modal
        videoRef.current.onended = () => {
          console.log("Vídeo terminou, permitindo fechamento do modal")
          setCanClose(true)
        }
      }
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.error("Error playing audio:", e))
      }
    } else if (!isOpen) {
      hasReported.current = false
      setCanClose(false)
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
        videoRef.current.onended = null
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [isOpen, onPrizeRevealed, realPrizeAmount])

  const handleClose = () => {
    if (canClose) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="
          sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px]
          w-[calc(100vw-2rem)] mx-auto
          p-0 overflow-hidden rounded-lg bg-gray-900 border-none
        "
      >
        <VisuallyHidden>
          <DialogTitle>Revelação do Prêmio</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-[450px] md:h-[550px] lg:h-[650px] bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover object-[50%_60%]"
            autoPlay
            playsInline
            muted={true}
          />
          <audio ref={audioRef} src={applauseAudioSrc} preload="auto" />
        </div>
        <div className="p-4 text-center">
          <h3 className="text-2xl font-bold text-green-500 mb-2">Parabéns!</h3>
          <p className="text-lg text-gray-200 mb-2">Você ganhou um prêmio!</p>
          <p className="text-3xl font-extrabold text-yellow-400 mb-4">R$ {prizeAmount}</p>
          <p className="text-md text-gray-400 mb-4">Seu saldo foi atualizado!</p>
          
          {canClose ? (
            <button
              onClick={handleClose}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Fechar
            </button>
          ) : (
            <p className="text-sm text-gray-500">Aguarde o vídeo terminar...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
