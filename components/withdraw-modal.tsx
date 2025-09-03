"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, Camera, Video, RefreshCcw, Send } from "lucide-react"
import { formatCPF, formatCurrency } from "@/lib/utils"
import { useCarteiraPremios } from "@/hooks/use-carteira-premios"
import { api } from "@/services/api"
import { toast } from "sonner"

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  onWithdrawSuccess: (amount: number) => void
}

const MIN_WITHDRAWAL_AMOUNT = 5.0 // R$ 5,00
const MIN_VIDEO_DURATION = 5 // segundos
const MAX_VIDEO_DURATION = 15 // segundos
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB em bytes

export default function WithdrawModal({ isOpen, onClose, onWithdrawSuccess }: WithdrawModalProps) {
  const { saldo: currentSaldoSacavel, isLoading: isLoadingSaldo, refetch: refetchSaldo } = useCarteiraPremios()
  const [currentStep, setCurrentStep] = useState(1)
  const [withdrawAmountDisplay, setWithdrawAmountDisplay] = useState("")
  const [withdrawAmountCents, setWithdrawAmountCents] = useState<number | null>(null)
  const [pixKeyDisplay, setPixKeyDisplay] = useState("")
  const [pixKeyRaw, setPixKeyRaw] = useState("")
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  // Video Selfie States
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoSent, setVideoSent] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null)

  const availableBalance = currentSaldoSacavel

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1)
      setWithdrawAmountDisplay("")
      setWithdrawAmountCents(null)
      setPixKeyDisplay("")
      setPixKeyRaw("")
      setWithdrawError(null)
      // Reset video states
      stopCamera()
      setVideoPreviewUrl(null)
      setVideoBlob(null)
      setVideoSent(false)
      setUploadingVideo(false)
      setUploadProgress(0)
      setVideoError(null)
      setUploadedVideoUrl(null)
    } else if (isOpen && currentStep === 3) {
      // Changed to currentStep === 3 for video step
      // Automatically start camera when video step is active
      startCamera()
    }
  }, [isOpen, currentStep])

  // Cleanup media stream on unmount or modal close
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = useCallback(async () => {
    setVideoError(null)
    setVideoPreviewUrl(null)
    setVideoBlob(null)
    setVideoSent(false)
    setIsRecording(false)
    setRecordingTime(0)
    recordedChunksRef.current = []

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true // Habilitando áudio
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Configurar o MediaRecorder com opções específicas
      const options = {
        mimeType: 'video/webm;codecs=vp8,opus', // WebM com VP8 para vídeo e Opus para áudio
        videoBitsPerSecond: 2500000, // 2.5 Mbps para vídeo
        audioBitsPerSecond: 128000 // 128 kbps para áudio
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      console.log('MediaRecorder configurado com formato:', mediaRecorderRef.current.mimeType)

      mediaRecorderRef.current.onstop = () => {
        // Criar o Blob especificando o tipo
        const recordedBlob = new Blob(recordedChunksRef.current, { 
          type: 'video/webm'
        })
        
        console.log('Vídeo gravado:', {
          tipo: recordedBlob.type,
          tamanho: recordedBlob.size
        })

        const url = URL.createObjectURL(recordedBlob)
        setVideoPreviewUrl(url)
        setVideoBlob(recordedBlob)
        setIsRecording(false)
        stopCamera() // Stop camera after recording is done
      }
      setIsCameraActive(true)
    } catch (err) {
      console.error("Error accessing camera:", err)
      setVideoError("Não foi possível acessar a câmera. Por favor, conceda permissão.")
      setIsCameraActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      ;(videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
  }, [])

  const startRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      recordedChunksRef.current = []
      
      // Resetar estados
      setIsRecording(true)
      setRecordingTime(0)
      setVideoPreviewUrl(null)
      setVideoBlob(null)
      setVideoSent(false)
      setVideoError(null)

      // Iniciar gravação coletando dados a cada segundo
      console.log('Iniciando gravação com formato:', mediaRecorderRef.current.mimeType)
      mediaRecorderRef.current.start(1000)

      // Iniciar timer para controlar duração máxima
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          const newTime = prevTime + 1
          if (newTime >= MAX_VIDEO_DURATION) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)
    } else {
      console.warn('MediaRecorder não está pronto ou já está gravando:', 
        mediaRecorderRef.current?.state || 'não inicializado')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
  }, [])

  const handleSendVideo = useCallback(async () => {
    if (!videoBlob) {
      setVideoError("Nenhum vídeo gravado para enviar.")
      return
    }

    // Verificar tamanho do vídeo
    if (videoBlob.size > MAX_VIDEO_SIZE) {
      setVideoError(`O vídeo excede o tamanho máximo permitido de ${MAX_VIDEO_SIZE / (1024 * 1024)}MB.`)
      return
    }

    setUploadingVideo(true)
    setVideoError(null)

    try {
      // Garantir que o tipo do vídeo está correto
      console.log('Tipo original do blob:', videoBlob.type)
      
      // Se o tipo estiver vazio ou incorreto, forçar para webm
      const videoType = videoBlob.type || 'video/webm'
      
      // Criar um novo blob com o tipo correto se necessário
      const videoWithType = videoBlob.type ? videoBlob : new Blob([videoBlob], { type: videoType })
      
      // Criar um arquivo com extensão correta
      const videoFile = new File([videoWithType], 'video.webm', { type: videoType })
      
      console.log('Arquivo a ser enviado:', {
        nome: videoFile.name,
        tipo: videoFile.type,
        tamanho: videoFile.size
      })

      const formData = new FormData()
      formData.append('video', videoFile)

      // Verificar o conteúdo do FormData
      console.log('Conteúdo do FormData:')
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      const response = await api.post('/api/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
          setUploadProgress(percentCompleted)
        }
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao fazer upload do vídeo')
      }

      setUploadedVideoUrl(response.data.url)
      setVideoSent(true)
      toast.success("Vídeo enviado com sucesso!")
      
    } catch (error: any) {
      console.error('Erro detalhado:', error)
      setVideoError(error.response?.data?.message || "Erro ao enviar o vídeo. Por favor, tente novamente.")
      toast.error("Erro ao enviar o vídeo")
    } finally {
      setUploadingVideo(false)
    }
  }, [videoBlob])

  const handleRetakeVideo = useCallback(() => {
    setVideoPreviewUrl(null)
    setVideoBlob(null)
    setVideoSent(false)
    setUploadingVideo(false)
    setRecordingTime(0)
    recordedChunksRef.current = []
    startCamera() // Restart camera for new recording
  }, [startCamera])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")

    if (value === "") {
      setWithdrawAmountCents(null)
      setWithdrawAmountDisplay("")
      return
    }

    const cents = Number.parseInt(value, 10)
    setWithdrawAmountCents(cents)

    const formatted = (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    setWithdrawAmountDisplay(formatted)

    setWithdrawError(null)
  }

  const handleQuickSelectAmount = (amount: number) => {
    setWithdrawAmountCents(amount * 100)
    setWithdrawAmountDisplay(formatCurrency(amount))
  }

  const handlePixKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = value.replace(/\D/g, "")
    setPixKeyRaw(cleaned)
    setPixKeyDisplay(formatCPF(cleaned))
  }

  const handleNextStep = () => {
    setWithdrawError(null)
    setVideoError(null)

    if (currentStep === 1) {
      const amount = withdrawAmountCents ? withdrawAmountCents / 100 : 0
      if (amount < MIN_WITHDRAWAL_AMOUNT) {
        setWithdrawError(`O valor mínimo para saque é ${formatCurrency(MIN_WITHDRAWAL_AMOUNT)}.`)
        return
      }
      if (amount > availableBalance) {
        setWithdrawError(`Saldo insuficiente. Você tem ${formatCurrency(availableBalance)} disponível.`)
        return
      }
    } else if (currentStep === 2) {
      // Now PIX Key step
      if (pixKeyRaw.length !== 11) {
        setWithdrawError("Por favor, insira um CPF válido com 11 dígitos.")
        return
      }
    } else if (currentStep === 3) {
      // Now Video Selfie step
      if (!videoSent) {
        setVideoError("Por favor, grave e envie seu vídeo selfie para continuar.")
        return
      }
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setWithdrawError(null)
    setVideoError(null)
    setCurrentStep((prev) => prev - 1)
  }

  const handleConfirmWithdrawal = async () => {
    const amountToWithdraw = withdrawAmountCents ? withdrawAmountCents / 100 : 0
    
    if (!uploadedVideoUrl) {
      setVideoError("É necessário enviar um vídeo para confirmar o saque.")
      return
    }

    try {
      const response = await api.post('/api/saque/solicitar', {
        valor: amountToWithdraw.toFixed(2),
        cpf: pixKeyRaw,
        videoUrl: uploadedVideoUrl
      })

      if (response.data.success) {
        await refetchSaldo() // Atualiza o saldo imediatamente
        onWithdrawSuccess(amountToWithdraw)
        onClose()
        toast.success('Saque solicitado com sucesso!')
      } else {
        throw new Error(response.data.message || 'Erro ao solicitar saque')
      }
    } catch (error: any) {
      console.error('Erro ao solicitar saque:', error)
      setWithdrawError(error.response?.data?.message || 'Erro ao solicitar saque. Por favor, tente novamente.')
      toast.error('Erro ao solicitar saque')
    }
  }

  const progressValue = (currentStep / 4) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#191F26] border-[#1a323a] text-white rounded-xl shadow-xl p-6 w-full max-w-[85vw] md:max-w-md max-h-[85vh] h-full overflow-y-auto flex flex-col">
        <DialogHeader className="relative">
          {currentStep > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-0 text-gray-400 hover:bg-[#1a323a] hover:text-white"
              onClick={handlePrevStep}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Voltar</span>
            </Button>
          )}
          <DialogTitle className="text-2xl font-bold text-center text-[#9ffe00]">Realizar Saque</DialogTitle>
          <DialogDescription className="text-center text-gray-400 mt-2">
            Siga os passos para sacar seu dindin.
          </DialogDescription>
          <div className="w-full mt-4">
            <Progress value={progressValue} className="w-full h-2 bg-gray-700" indicatorClassName="bg-[#9ffe00]" />
            <p className="text-center text-sm text-gray-400 mt-1">Passo {currentStep} de 4</p>
          </div>
        </DialogHeader>

        {withdrawError && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm text-center mt-4">{withdrawError}</div>
        )}
        {videoError && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm text-center mt-4">{videoError}</div>
        )}

        {/* Passo 1: Valor */}
        {currentStep === 1 && (
          <div className="mt-6 space-y-5 flex-grow">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount" className="text-gray-300 text-sm">
                Valor do Saque
              </Label>
              <Input
                id="withdraw-amount"
                type="text"
                placeholder="R$ 0,00"
                value={withdrawAmountDisplay}
                onChange={handleAmountChange}
                className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white h-10 text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[20, 50, 100, 200].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className="bg-[#1a323a] border-[#9ffe00]/30 text-white hover:bg-[#9ffe00]/10 hover:border-[#9ffe00] h-9 text-sm"
                  onClick={() => handleQuickSelectAmount(amount)}
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>
                Saldo disponível: <span className="font-bold text-white">{formatCurrency(availableBalance)}</span>
              </p>
              <p>
                Valor mínimo para saque:{" "}
                <span className="font-bold text-white">{formatCurrency(MIN_WITHDRAWAL_AMOUNT)}</span>
              </p>
            </div>
            <Button
              onClick={handleNextStep}
              className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow h-10 text-base"
              disabled={!withdrawAmountCents || withdrawAmountCents <= 0}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Passo 2: Chave PIX (antigo passo 3) */}
        {currentStep === 2 && (
          <div className="mt-6 space-y-5 flex-grow">
            <div className="space-y-2">
              <Label htmlFor="pix-key" className="text-gray-300 text-sm">
                Chave PIX (CPF)
              </Label>
              <Input
                id="pix-key"
                type="text"
                placeholder="000.000.000-00"
                value={pixKeyDisplay}
                onChange={handlePixKeyChange}
                maxLength={14}
                className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white h-10 text-base"
              />
              <p className="text-xs text-gray-500">A chave PIX deve ser o CPF do titular da conta.</p>
            </div>
            <div className="bg-[#1a323a] p-3 rounded-lg space-y-1 border border-[#9ffe00]/20">
              <h3 className="text-base font-bold text-[#9ffe00]">Resumo do Saque</h3>
              <div className="text-xs text-gray-300">
                <p>Valor do Saque: {formatCurrency(withdrawAmountCents ? withdrawAmountCents / 100 : 0)}</p>
                <p>Chave PIX: {pixKeyDisplay || "Não informada"}</p>
                <p className="font-bold text-white">Taxa: 0,00</p>
              </div>
            </div>
            <Button
              onClick={handleNextStep}
              className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow h-10 text-base"
              disabled={pixKeyRaw.length !== 11}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Passo 3: Video Selfie (antigo passo 2) */}
        {currentStep === 3 && (
          <div className="mt-6 space-y-4 flex-grow flex flex-col items-center justify-center">
            <p className="text-sm text-gray-400 text-center">
              Grave um vídeo de 5 a 15 segundos agradecendo ou mostrando sua vitória.
            </p>

            {!videoPreviewUrl && (
              <div className="relative w-full max-w-md aspect-video bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!isCameraActive && !videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/70 text-gray-400">
                    <Camera className="h-12 w-12 animate-pulse" />
                    <p className="ml-2">Ativando câmera...</p>
                  </div>
                )}
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 text-red-300 text-center p-4">
                    <p>{videoError}</p>
                  </div>
                )}
                {isRecording && (
                  <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Gravando: {recordingTime}s
                  </div>
                )}
              </div>
            )}

            {videoPreviewUrl && (
              <div className="relative w-full max-w-md aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <video src={videoPreviewUrl} controls className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex gap-2 mt-4 w-full max-w-md">
              {!videoPreviewUrl && (
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 h-10 text-base ${
                    isRecording ? "bg-red-600 hover:bg-red-700" : "bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26]"
                  }`}
                  disabled={!isCameraActive || uploadingVideo || recordingTime >= MAX_VIDEO_DURATION}
                >
                  {isRecording ? (
                    <>
                      <Video className="h-5 w-5 mr-2" /> Parar
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5 mr-2" /> Gravar
                    </>
                  )}
                </Button>
              )}

              {videoPreviewUrl && (
                <>
                  <Button
                    onClick={handleRetakeVideo}
                    variant="outline"
                    className="flex-1 bg-[#1a323a] border-[#9ffe00]/30 text-white hover:bg-[#9ffe00]/10 hover:border-[#9ffe00] h-10 text-base"
                    disabled={uploadingVideo}
                  >
                    <RefreshCcw className="h-5 w-5 mr-2" /> Regravar
                  </Button>
                  <Button
                    onClick={handleSendVideo}
                    className="flex-1 bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow h-10 text-base"
                    disabled={uploadingVideo || videoSent}
                  >
                    {uploadingVideo ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span>Enviando {uploadProgress}%</span>
                          <Progress value={uploadProgress} className="w-16 h-2" />
                        </div>
                      </>
                    ) : videoSent ? (
                      "Enviado!"
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" /> Enviar
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
            <Button
              onClick={handleNextStep}
              className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow h-10 text-base mt-4"
              disabled={!videoSent || uploadingVideo}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Passo 4: Confirmação (antigo passo 4) */}
        {currentStep === 4 && (
          <div className="mt-6 space-y-4 flex flex-col">
            <h3 className="text-xl font-bold text-center text-white">Confirme seu Saque</h3>
            <div className="bg-[#1a323a] p-3 rounded-lg space-y-1 border border-[#9ffe00]/20">
              <div className="text-xs text-gray-300">
                <p>Valor Solicitado: {formatCurrency(withdrawAmountCents ? withdrawAmountCents / 100 : 0)}</p>
                <p>Chave PIX: {pixKeyDisplay}</p>
                <p>Taxa: 0,00</p>
                <p className="font-bold text-white text-base mt-2">
                  Valor a Receber: {formatCurrency(withdrawAmountCents ? withdrawAmountCents / 100 : 0)}
                </p>
              </div>
            </div>
            <Button
              onClick={handleConfirmWithdrawal}
              className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow h-10 text-base"
            >
              Confirmar Saque
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
