"use client"
import { useState, useCallback, useEffect, useRef } from "react"
import { SlotMachineGrid } from "@/components/slot-machine-grid"
import { SlotBalances } from "@/components/slot-balances"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { SlotPrizeRevealModal } from "@/components/slot-prize-reveal-modal"
import { useAudioPlayer } from "@/contexts/audio-player-context"
import { realizarSorteioInstantaneo } from "@/lib/sorteio-service"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SlotPage() {
  const spinSoundRef = useRef<HTMLAudioElement | null>(null)
  const originalBackgroundVolumeRef = useRef(0.5) // Ref para armazenar o volume original da música de fundo

  // Acessar o contexto do player de áudio de fundo
  const { audioRef: backgroundAudioRef, setVolume: setBackgroundVolume } = useAudioPlayer()

  const [currentMultiplier, setCurrentMultiplier] = useState(1)
  const [chipsSpentSinceLastMultiplierIncrease, setChipsSpentSinceLastMultiplierIncrease] = useState(0)

  const CHIPS_PER_MULTIPLIER_LEVEL = 3 // Gaste 3 fichas para aumentar o multiplicador em 1
  const MAX_MULTIPLIER = 20 // Multiplicador máximo é 20x
  const BASE_WIN_AMOUNT = 10 // Valor base ganho por vitória

  const [gameChips, setGameChips] = useState(100) // Fichas para jogar, inicializadas com 100
  const [saldoSacavel, setSaldoSacavel] = useState(500) // Saldo para sacar, inicializado com 500
  const [isAutoplayActive, setIsAutoplayActive] = useState(false)
  const [spinCount, setSpinCount] = useState(0)
  const [showPrizeModal, setShowPrizeModal] = useState(false)
  const [highlightedCells, setHighlightedCells] = useState<number[][] | null>(null)
  const [announcement, setAnnouncement] = useState("")

  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const PAUSE_BETWEEN_SPINS = 500

  const [spinTrigger, setSpinTrigger] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [isFirstSpin, setIsFirstSpin] = useState(true)

  // REMOVIDO: useEffect que criava new Audio()

  const getOutcomeType = useCallback(() => {
    if (isFirstSpin) {
      console.log(`[SlotPage] Outcome for first spin: win`)
      return "win"
    } else {
      // A partir da segunda rodada, o resultado será sempre "loss"
      console.log(`[SlotPage] Outcome for spin ${spinCount}: loss (forced)`)
      return "loss"
    }
  }, [isFirstSpin, spinCount])

  const startSpin = useCallback(() => {
    if (gameChips <= 0) {
      setIsAutoplayActive(false)
      if (autoplayIntervalRef.current) clearTimeout(autoplayIntervalRef.current)
      return false
    }
    if (!isSpinning) {
      const newSpinCount = spinCount + 1
      console.log(`[SlotPage] Starting spin. New spinCount will be: ${newSpinCount}`)
      setGameChips((prev) => prev - 1) // Decrementa as fichas de jogo

      setSpinCount(newSpinCount)

      // Lógica do multiplicador: incrementa fichas gastas, verifica aumento do multiplicador
      setChipsSpentSinceLastMultiplierIncrease((prev) => {
        const newChipsSpent = prev + 1
        if (newChipsSpent % CHIPS_PER_MULTIPLIER_LEVEL === 0 && currentMultiplier < MAX_MULTIPLIER) {
          setCurrentMultiplier((prevMult) => prevMult + 1)
          return 0 // Reseta o contador após aumentar o multiplicador
        }
        return newChipsSpent
      })

      setSpinTrigger(true)
      setIsSpinning(true)
      setHighlightedCells(null)
      setAnnouncement("Girando...")

      // Diminuir o volume da música de fundo e tocar o som de giro
      if (backgroundAudioRef.current) {
        originalBackgroundVolumeRef.current = backgroundAudioRef.current.volume // Armazena o volume atual
        setBackgroundVolume(0.1) // Define um volume baixo para a música de fundo
      }
      if (spinSoundRef.current) {
        // Não é necessário load() aqui, pois o navegador já deve ter pré-carregado o <audio>
        spinSoundRef.current.play().catch((e) => console.error("Error playing spin sound:", e))
      }

      return true
    }
    return false
  }, [gameChips, isSpinning, spinCount, currentMultiplier, backgroundAudioRef, setBackgroundVolume])

  const handleSpinClick = useCallback(() => {
    if (isAutoplayActive) {
      setIsAutoplayActive(false)
      if (autoplayIntervalRef.current) clearTimeout(autoplayIntervalRef.current)
    } else {
      startSpin()
    }
  }, [isAutoplayActive, startSpin])

  const handleWin = useCallback(
    (winningCells: number[][] | null) => {
      console.log("[SlotPage] handleWin called with winningCells:", winningCells)
      if (winningCells && winningCells.length > 0) {
        setAnnouncement("Você ganhou!")
        // Reseta o multiplicador após uma vitória
        setCurrentMultiplier(1)
        setChipsSpentSinceLastMultiplierIncrease(0)
        setShowPrizeModal(true)
        setAnnouncement("Você ganhou!")
        setIsFirstSpin(false) // Define isFirstSpin como false após a primeira vitória
      } else {
        setShowPrizeModal(false)
        setAnnouncement("Não houve vitória nesta rodada.")
      }
      setHighlightedCells(winningCells)
    },
    [setIsFirstSpin],
  )

  const handlePrizeRevealed = useCallback((amount: number) => {
    const finalAmount = amount

    setSaldoSacavel((prevSaldo) => {
      const novoSaldo = prevSaldo + finalAmount
      console.log(`[SlotPage] Prêmio revelado: ${finalAmount}. Novo saldo sacável: ${novoSaldo}`)
      return novoSaldo
    })
  }, [])

  const handleSpinEnd = useCallback(() => {
    console.log(`[SlotPage] Spin ended. Total spins completed: ${spinCount}`)
    setSpinTrigger(false)
    setIsSpinning(false)
    setAnnouncement("")

    // Pausar e resetar o som de giro
    if (spinSoundRef.current) {
      spinSoundRef.current.pause()
      spinSoundRef.current.currentTime = 0
    }
    // Restaurar o volume da música de fundo
    if (backgroundAudioRef.current) {
      setBackgroundVolume(originalBackgroundVolumeRef.current)
    }

    // Realizar sorteio instantâneo
    realizarSorteioInstantaneo()
      .then(resultado => {
        if (resultado.sucesso) {
          handleWin([[0, 0], [1, 1], [2, 2]]); // Padrão de vitória diagonal
          handlePrizeRevealed(resultado.valor_premio || 0);
        } else {
          handleWin(null); // Sem vitória
        }
      })
      .catch(error => {
        console.error('Erro ao realizar sorteio:', error);
        handleWin(null); // Em caso de erro, não há vitória
      });

  }, [spinCount, backgroundAudioRef, setBackgroundVolume, handleWin, handlePrizeRevealed])

  const handlePrizeModalClose = useCallback(() => {
    setShowPrizeModal(false)
    setAnnouncement("")
  }, [])

  const handleMouseDown = useCallback(() => {
    if (!isAutoplayActive) {
      pressTimerRef.current = setTimeout(() => {
        setIsAutoplayActive(true)
        startSpin()
      }, 1500)
    }
  }, [isAutoplayActive, startSpin])

  const handleMouseUp = useCallback(() => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current)
  }, [])

  useEffect(() => {
    if (isAutoplayActive && !isSpinning && gameChips > 0 && !showPrizeModal) {
      if (autoplayIntervalRef.current) clearTimeout(autoplayIntervalRef.current)
      autoplayIntervalRef.current = setTimeout(() => {
        startSpin()
      }, PAUSE_BETWEEN_SPINS)
    } else if ((!isAutoplayActive || gameChips <= 0 || showPrizeModal) && autoplayIntervalRef.current) {
      clearTimeout(autoplayIntervalRef.current)
      autoplayIntervalRef.current = null
      if (gameChips <= 0 || showPrizeModal) {
        setIsAutoplayActive(false)
      }
    }
    return () => {
      if (autoplayIntervalRef.current) clearTimeout(autoplayIntervalRef.current)
    }
  }, [isAutoplayActive, isSpinning, gameChips, showPrizeModal, startSpin])

  const phrases = [
    "🍀 A sorte não bate, ela dá tapa!",
    "🧠 Usei o cérebro… agora só falta a sorte usar também!",
    "🤑 Bora raspar o destino!",
    "💥 Hoje é dia de fazer história (ou rir tentando)!",
    "🐷 Até porquinho da sorte hoje tá comigo!",
    "💃 Quem tem brilho no olhar, não precisa de truque!",
    "✨ Gira aí, universo! Surpreende a quebrada!",
    "🤞 Se não for agora, é depois… ou depois do depois!",
    "🤡 Tô sorrindo, mas por dentro tô no modo expectativa!",
    "🔮 Senti no ar... algo me diz que vem coisa boa!",
    "🧃 Tomei meu suco de coragem. Agora vai!",
    "👽 Se tiver sorte em Marte, me manda pra lá!",
    "🎯 Mira no topo e vai na fé!",
    "🛸 Sorte, pousa aqui rapidinho!",
    "🧙‍♂️ Hoje é tudo ou meme!",
    "🎩 Mais mágica que isso, só meu Pix chegando!",
    "🧠 O plano é simples: raspar, sorrir e gritar!",
    "😝 Quem nunca sonhou alto, nunca gritou de alegria!",
    "🧤 Tá na hora da virada, segura firme!",
    "🥵 Raspei tanto que quase liguei o ventilador!",
    "😅 Tá tudo sob controle… da sorte!",
    "🚀 Bora subir sem escada, só na emoção!",
    "🧃 Bebi coragem no café da manhã. Tô pronto(a)!",
    "📦 Vem, presente da vida!",
    "🧘‍♂️ Zen por fora, ansioso por dentro!",
    "🦄 Sorte boa, me atropela com carinho!",
    "😬 Hoje fui com calma, mas torcendo alto!",
    "💌 Mandei um recado pra sorte: tô aqui, viu?",
    "🌪️ Que hoje sopre um vento de vitória!",
    "📞 Sorte, atende! Tô te ligando faz tempo!",
    "🎡 Emoção nível parque de diversão!",
    "👑 Hoje eu brilho mesmo sem holofote!",
    "😇 Deus ajuda quem gira com fé!",
    "🐾 Um passo de cada vez… até o prêmio!",
    "🔁 Gira que gira… uma hora para no brilho!",
    "😍 Só quero um motivo pra gritar de alegria!",
    "🧂 Botei sal grosso no dedo. Bora ver se ajuda!",
    "💣 Tô pronto pra explodir de emoção!",
    "🤖 Nível de esperança: atualizado para 100%!",
    "🎬 Preparei até o discurso de agradecimento!",
    "🦾 Hoje fui na coragem, amanhã vou no iate!",
    "🐒 Se não for pela sorte, que seja pela resenha!",
    "🫶 Ganhar é bom. Raspar sorrindo é melhor ainda!",
    "😹 Vem, surpresa boa! Me arranca um grito!",
    "📍Foco no brilho, fé no resultado!",
    "🥂 Se der bom, comemoro. Se não der, repito!",
    "🥸 Raspar é fácil. Difícil é segurar o grito!",
    "🚨 Sinto que o universo tá tramando algo bom…",
    "🦋 Hoje o frio na barriga tá diferente!",
    "🏁 Cada clique é um passo pro topo (ou pra risada)!",
  ]
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const phraseIntervalRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    phraseIntervalRef.current = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length)
    }, 4000)
    return () => {
      if (phraseIntervalRef.current) clearInterval(phraseIntervalRef.current)
    }
  }, [phrases.length])

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  const chipsToNextLevel =
    CHIPS_PER_MULTIPLIER_LEVEL - (chipsSpentSinceLastMultiplierIncrease % CHIPS_PER_MULTIPLIER_LEVEL)

  const progressPercentage = (chipsSpentSinceLastMultiplierIncrease / CHIPS_PER_MULTIPLIER_LEVEL) * 100

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden">
      {/* Elemento de áudio para o som de giro */}
      <audio
        ref={spinSoundRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/roulette-digital-wheel-spinning-bop-audio-1-1-00-04-hcDjiuQB4pbYWfPlT255gLjklC0ELW.mp3"
        loop
        preload="auto"
        className="sr-only"
      />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <Image
        src="/images/golden-glow-lights-dark-background.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="absolute inset-0 w-full h-full z-0"
      />
      <div className="relative z-20 w-full flex items-center justify-between px-4 mt-8 mb-4">
        <Link href="/home" passHref>
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Voltar para Home</span>
          </Button>
        </Link>
        <h1 className="flex-grow text-center md:text-4xl lg:text-5xl font-extrabold text-white text-2xl">
          Gira, gira, Dom Ripo!
        </h1>
        {/* Adiciona um elemento transparente para balancear o espaçamento e manter o h1 centralizado */}
        <div className="w-10 h-10"></div>
      </div>
      <div className="relative z-20 p-2 mt-2 w-11/12 max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <SlotMachineGrid
          triggerSpin={spinTrigger}
          onSpinEnd={handleSpinEnd}
          onWin={handleWin}
          outcomeType={getOutcomeType()}
          highlightedCells={highlightedCells}
          spinCount={spinCount}
          currentMultiplier={currentMultiplier}
        />
      </div>

      {currentMultiplier < MAX_MULTIPLIER && (
        <motion.div
          className="relative z-20 mt-2 w-[350px] h-6 bg-gray-800 rounded-full overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500 to-yellow-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
            Próximo Booster (x{currentMultiplier + 1}) em {chipsToNextLevel} Rodadas
          </div>
        </motion.div>
      )}

      <SlotBalances gameChips={gameChips} saldoSacavel={saldoSacavel} currentMultiplier={currentMultiplier} />
      <div className="mt-4 w-full max-w-[369px] mx-auto z-30">
        <Button
          onClick={handleSpinClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchCancel={handleMouseLeave}
          disabled={isSpinning || gameChips <= 0}
          className={`w-full max-w-[350px] mx-auto flex items-center justify-center gap-2 ${isAutoplayActive ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600" : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"} text-black font-bold py-3 px-8 rounded-md text-sm shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <motion.div
            animate={isSpinning ? { rotate: [0, 360] } : { rotate: 0 }}
            transition={{ duration: 1, ease: "linear", repeat: isSpinning ? Infinity : 0 }}
          >
            <Image src="/images/spin.png" alt="Spin Icon" width={24} height={24} />
          </motion.div>
          {isAutoplayActive ? "Toque para parar" : "Gira e Solta o Pix, Dom Ripo!"}
        </Button>
      </div>
      <div className="relative w-full max-w-[369px] mx-auto mt-4 z-10">
        <Image
          src="/images/new-text-frame.png"
          alt="Decorative Frame"
          width={600}
          height={300}
          layout="responsive"
          objectFit="contain"
        />
        <div className="absolute inset-0 flex items-center justify-center px-8 py-4 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentPhraseIndex}
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="text-white text-base md:text-lg font-bold leading-tight"
            >
              {phrases[currentPhraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <SlotPrizeRevealModal
        isOpen={showPrizeModal}
        onClose={handlePrizeModalClose}
        onPrizeRevealed={handlePrizeRevealed}
      />
    </div>
  )
}
