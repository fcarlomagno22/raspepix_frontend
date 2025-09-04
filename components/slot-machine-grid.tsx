"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { CentralVideoSlot } from "./central-video-slot" // Importar o novo componente

const slotElements = [
  "/images/slot-element-new-1.png",
  "/images/slot-element-new-2.png",
  "/images/slot-element-new-3.png",
  "/images/slot-element-new-4.png",
  "/images/slot-element-new-5.png",
  "/images/slot-element-new-6.png",
  "/images/slot-element-new-7.png",
  "/images/slot-element-new-8.png",
]

// Atualize a interface SlotMachineGridProps para incluir currentMultiplier
interface SlotMachineGridProps {
  triggerSpin: boolean
  onSpinEnd: () => void
  onWin: (winningCells: number[][] | null) => void
  outcomeType: "win" | "loss" | "random" | null
  highlightedCells: number[][] | null
  spinCount: number
  currentMultiplier: number // Nova prop para o multiplicador
  forceWinningPayline: boolean // Nova prop para forçar payline vencedora
}

// Destructure a nova prop currentMultiplier na função SlotMachineGrid
export function SlotMachineGrid({
  triggerSpin,
  onSpinEnd,
  onWin,
  outcomeType,
  highlightedCells,
  spinCount,
  currentMultiplier, // Desestruture a nova prop
  forceWinningPayline, // Desestruture a nova prop
}: SlotMachineGridProps) {
  const [reels, setReels] = useState<string[][]>(() =>
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(slotElements[0])),
  )
  const [isReelSpinning, setIsReelSpinning] = useState<boolean[]>([false, false, false])
  const [isPreWinVibrating, setIsPreWinVibrating] = useState(false)
  const [isFalsePreWinVibrating, setIsFalsePreWinVibrating] = useState(false)

  const intervalRefs = useRef<(NodeJS.Timeout | null)[]>([null, null, null])
  const timeoutRefs = useRef<(NodeJS.Timeout | null)[]>([null, null, null])
  const preWinVibrationStartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const preWinVibrationEndTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const falsePreWinVibrationStartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const falsePreWinVibrationEndTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const predeterminedFinalReelsRef = useRef<string[][] | null>(null)

  // Pré-carrega as imagens dos elementos do slot
  useEffect(() => {
    slotElements.forEach((src) => {
      const img = new window.Image()
      img.src = src
      // Opcional: adicionar listeners para load/error se for necessário um carregamento mais robusto
    })
  }, [])

  const getWinningPositions = useCallback(
    (symbols: string[][]): { type: string; positions: [number, number][] } | null => {
      if (!symbols || symbols.length !== 3 || !symbols.every((col) => col.length === 3)) {
        console.error("[SlotMachineGrid] Invalid symbols structure for getWinningPositions:", symbols)
        return null
      }

      // Verifica linhas horizontais considerando coringa
      for (let row = 0; row < 3; row++) {
        const elements = [symbols[0][row], symbols[1][row], symbols[2][row]]
        const hasJoker = elements[1] === "VIDEO_CORINGA"
        
        if (hasJoker) {
          // Se tem coringa no centro, verifica se os outros dois são iguais
          if (elements[0] === elements[2]) {
            return {
              type: "row",
              positions: [
                [0, row],
                [1, row],
                [2, row],
              ],
            }
          }
        } else {
          // Se não tem coringa, verifica se todos são iguais
          if (elements[0] === elements[1] && elements[1] === elements[2]) {
            return {
              type: "row",
              positions: [
                [0, row],
                [1, row],
                [2, row],
              ],
            }
          }
        }
      }

      // Verifica colunas verticais considerando coringa
      for (let col = 0; col < 3; col++) {
        const elements = [symbols[col][0], symbols[col][1], symbols[col][2]]
        const hasJoker = elements[1] === "VIDEO_CORINGA"
        
        if (hasJoker) {
          // Se tem coringa no centro, verifica se os outros dois são iguais
          if (elements[0] === elements[2]) {
            return {
              type: "col",
              positions: [
                [col, 0],
                [col, 1],
                [col, 2],
              ],
            }
          }
        } else {
          // Se não tem coringa, verifica se todos são iguais
          if (elements[0] === elements[1] && elements[1] === elements[2]) {
            return {
              type: "col",
              positions: [
                [col, 0],
                [col, 1],
                [col, 2],
              ],
            }
          }
        }
      }

      // Verifica diagonais considerando coringa
      // Diagonal principal: [0,0], [1,1], [2,2]
      const diagonal1 = [symbols[0][0], symbols[1][1], symbols[2][2]]
      const hasJokerDiagonal1 = diagonal1[1] === "VIDEO_CORINGA"
      if (hasJokerDiagonal1) {
        if (diagonal1[0] === diagonal1[2]) {
          return {
            type: "diagonal",
            positions: [
              [0, 0],
              [1, 1],
              [2, 2],
            ],
          }
        }
      } else {
        if (diagonal1[0] === diagonal1[1] && diagonal1[1] === diagonal1[2]) {
          return {
            type: "diagonal",
            positions: [
              [0, 0],
              [1, 1],
              [2, 2],
            ],
          }
        }
      }

      // Diagonal secundária: [0,2], [1,1], [2,0]
      const diagonal2 = [symbols[0][2], symbols[1][1], symbols[2][0]]
      const hasJokerDiagonal2 = diagonal2[1] === "VIDEO_CORINGA"
      if (hasJokerDiagonal2) {
        if (diagonal2[0] === diagonal2[2]) {
          return {
            type: "diagonal",
            positions: [
              [0, 2],
              [1, 1],
              [2, 0],
            ],
          }
        }
      } else {
        if (diagonal2[0] === diagonal2[1] && diagonal2[1] === diagonal2[2]) {
          return {
            type: "diagonal",
            positions: [
              [0, 2],
              [1, 1],
              [2, 0],
            ],
          }
        }
      }

      return null
    },
    [],
  )

  // Função para verificar paylines considerando o vídeo central como coringa
  const checkForWinningPaylinesWithJoker = useCallback((symbols: string[][]): boolean => {
    if (!symbols || symbols.length !== 3 || !symbols.every((col) => col.length === 3)) {
      return false
    }

    // Verifica linhas horizontais
    for (let row = 0; row < 3; row++) {
      const elements = [symbols[0][row], symbols[1][row], symbols[2][row]]
      const hasJoker = elements[1] === "VIDEO_CORINGA" // Vídeo central é coringa
      
      if (hasJoker) {
        // Se tem coringa no centro, verifica se os outros dois são iguais
        if (elements[0] === elements[2]) {
          return true
        }
      } else {
        // Se não tem coringa, verifica se todos são iguais
        if (elements[0] === elements[1] && elements[1] === elements[2]) {
          return true
        }
      }
    }

    // Verifica colunas verticais
    for (let col = 0; col < 3; col++) {
      const elements = [symbols[col][0], symbols[col][1], symbols[col][2]]
      const hasJoker = elements[1] === "VIDEO_CORINGA" // Vídeo central é coringa
      
      if (hasJoker) {
        // Se tem coringa no centro, verifica se os outros dois são iguais
        if (elements[0] === elements[2]) {
          return true
        }
      } else {
        // Se não tem coringa, verifica se todos são iguais
        if (elements[0] === elements[1] && elements[1] === elements[2]) {
          return true
        }
      }
    }

    // Verifica diagonais
    // Diagonal principal: [0,0], [1,1], [2,2]
    const diagonal1 = [symbols[0][0], symbols[1][1], symbols[2][2]]
    const hasJokerDiagonal1 = diagonal1[1] === "VIDEO_CORINGA"
    if (hasJokerDiagonal1) {
      if (diagonal1[0] === diagonal1[2]) {
        return true
      }
    } else {
      if (diagonal1[0] === diagonal1[1] && diagonal1[1] === diagonal1[2]) {
        return true
      }
    }

    // Diagonal secundária: [0,2], [1,1], [2,0]
    const diagonal2 = [symbols[0][2], symbols[1][1], symbols[2][0]]
    const hasJokerDiagonal2 = diagonal2[1] === "VIDEO_CORINGA"
    if (hasJokerDiagonal2) {
      if (diagonal2[0] === diagonal2[2]) {
        return true
      }
    } else {
      if (diagonal2[0] === diagonal2[1] && diagonal2[1] === diagonal2[2]) {
        return true
      }
    }

    return false
  }, [])

  const generateRandomReels = useCallback((): string[][] => {
    return Array(3)
      .fill(null)
      .map((_, colIndex) =>
        Array(3)
          .fill(null)
          .map((_, rowIndex) => {
            // Posição central (1,1) sempre é o vídeo coringa
            if (colIndex === 1 && rowIndex === 1) {
              return "VIDEO_CORINGA"
            }
            return slotElements[Math.floor(Math.random() * slotElements.length)]
          }),
      )
  }, [])

  const generateWinningReels = useCallback((): string[][] => {
    const newReels = Array(3)
      .fill(null)
      .map(() => Array(3).fill(""))
    const winningElement = slotElements[Math.floor(Math.random() * slotElements.length)]
    const winTypes = ["horizontal", "vertical", "diagonal1", "diagonal2"]
    const chosenWinType = winTypes[Math.floor(Math.random() * winTypes.length)]

    if (chosenWinType === "horizontal") {
      const rowIndex = Math.floor(Math.random() * 3)
      for (let col = 0; col < 3; col++) newReels[col][rowIndex] = winningElement
    } else if (chosenWinType === "vertical") {
      const colIndex = Math.floor(Math.random() * 3)
      for (let row = 0; row < 3; row++) newReels[colIndex][row] = winningElement
    } else if (chosenWinType === "diagonal1") {
      for (let i = 0; i < 3; i++) newReels[i][i] = winningElement
    } else {
      // diagonal2
      newReels[0][2] = winningElement
      newReels[1][1] = winningElement
      newReels[2][0] = winningElement
    }

    // Preenche as posições vazias com elementos diferentes
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        if (newReels[col][row] === "") {
          let el
          do {
            el = slotElements[Math.floor(Math.random() * slotElements.length)]
          } while (el === winningElement && slotElements.length > 1)
          newReels[col][row] = el
        }
      }
    }

    // Garante que a posição central seja o vídeo coringa
    newReels[1][1] = "VIDEO_CORINGA"

    console.log("[SlotMachineGrid] Generated WINNING reels:", JSON.parse(JSON.stringify(newReels)))
    return newReels
  }, [])

  const generateLosingReels = useCallback((): string[][] => {
    let newReels: string[][]
    let attempts = 0
    const maxAttempts = 200 // Aumentado para garantir que encontre uma configuração válida
    
    do {
      newReels = generateRandomReels()
      attempts++
      
      // Verifica se há paylines vencedoras considerando o vídeo central como coringa
      const hasWinningPayline = checkForWinningPaylinesWithJoker(newReels)
      
      if (!hasWinningPayline) {
        break // Encontrou uma configuração sem paylines vencedoras
      }
    } while (attempts < maxAttempts)
    
    if (attempts >= maxAttempts) {
      console.warn("[SlotMachineGrid] Max attempts reached for losing reels. Using fallback configuration.")
      // Fallback: configuração manual que garante não ter paylines
      newReels = [
        [slotElements[0], slotElements[1], slotElements[2]],
        [slotElements[3], "VIDEO_CORINGA", slotElements[4]], // Vídeo central como coringa
        [slotElements[5], slotElements[6], slotElements[7]]
      ]
    }
    
    console.log("[SlotMachineGrid] Generated LOSING reels:", JSON.parse(JSON.stringify(newReels)))
    return newReels
  }, [generateRandomReels])

  useEffect(() => {
    if (triggerSpin) {
      console.log(`[SlotMachineGrid] useEffect for triggerSpin. Current spinCount prop: ${spinCount}`)
      // Limpa timeouts e intervalos anteriores
      intervalRefs.current.forEach((id) => id && clearInterval(id))
      timeoutRefs.current.forEach((id) => id && clearTimeout(id))
      if (preWinVibrationStartTimeoutRef.current) clearTimeout(preWinVibrationStartTimeoutRef.current)
      if (preWinVibrationEndTimeoutRef.current) clearTimeout(preWinVibrationEndTimeoutRef.current)
      if (falsePreWinVibrationStartTimeoutRef.current) clearTimeout(falsePreWinVibrationStartTimeoutRef.current)
      if (falsePreWinVibrationEndTimeoutRef.current) clearTimeout(falsePreWinVibrationEndTimeoutRef.current)

      intervalRefs.current = [null, null, null]
      timeoutRefs.current = [null, null, null]
      setIsPreWinVibrating(false) // Reseta o estado da vibração de vitória
      setIsFalsePreWinVibrating(false) // Reseta o estado da vibração de falsa pré-vitória

      setIsReelSpinning([true, true, true])

      const currentOutcome = outcomeType
      console.log(`[SlotMachineGrid] Outcome for this spin (spin ${spinCount}): ${currentOutcome}`)

      let finalReelsConfig: string[][]
      if (currentOutcome === "win" || forceWinningPayline) {
        // Se outcomeType for "win" ou se forceWinningPayline for true, gera reels vencedores
        finalReelsConfig = generateWinningReels()
      } else {
        // Para todos os outros casos (loss, null, etc.), gera reels perdedores
        // Isso garante que NUNCA haverá paylines quando não for premiado
        finalReelsConfig = generateLosingReels()
      }
      predeterminedFinalReelsRef.current = JSON.parse(JSON.stringify(finalReelsConfig)) // Deep copy
      console.log(
        "[SlotMachineGrid] Predetermined final reels for this spin:",
        JSON.parse(JSON.stringify(predeterminedFinalReelsRef.current)),
      )

      // Lógica para vibração de pré-vitória (real)
      if (currentOutcome === "win" || forceWinningPayline) {
        preWinVibrationStartTimeoutRef.current = setTimeout(() => {
          setIsPreWinVibrating(true)
          preWinVibrationEndTimeoutRef.current = setTimeout(() => {
            setIsPreWinVibrating(false)
          }, 1500) // Vibra por 1.5 segundos
        }, 500) // Começa a vibrar 0.5 segundos após o início do giro
      }
      // Lógica para vibração de falsa pré-vitória (apenas quando não é vitória garantida)
      else if (currentOutcome !== "win" && !forceWinningPayline && Math.random() < 0.3) {
        // 30% de chance de falsa pré-vitória em giros não-vencedores
        falsePreWinVibrationStartTimeoutRef.current = setTimeout(() => {
          setIsFalsePreWinVibrating(true)
          falsePreWinVibrationEndTimeoutRef.current = setTimeout(() => {
            setIsFalsePreWinVibrating(false)
          }, 800) // Vibra por 0.8 segundos (mais curto)
        }, 700) // Começa a vibrar 0.7 segundos após o início do giro (um pouco depois da real)
      }

      reels.forEach((_, reelIndex) => {
        intervalRefs.current[reelIndex] = setInterval(() => {
          setReels((prev) => {
            const newReels = prev.map((r) => [...r])
            newReels[reelIndex] = newReels[reelIndex].map((currentElement, rowIndex) => {
              // If it's the central element (reelIndex 1, rowIndex 1), keep its current content (the video)
              if (reelIndex === 1 && rowIndex === 1) {
                return currentElement
              }
              // Otherwise, pick a random slot element for the spin effect
              return slotElements[Math.floor(Math.random() * slotElements.length)]
            })
            return newReels
          })
        }, 50) // Ajustado para 50ms
      })

      const stopDelays = [1000, 2000, 3000]
      reels.forEach((_, reelIndex) => {
        timeoutRefs.current[reelIndex] = setTimeout(() => {
          if (intervalRefs.current[reelIndex]) clearInterval(intervalRefs.current[reelIndex]!)
          intervalRefs.current[reelIndex] = null

          setIsReelSpinning((prev) => {
            const n = [...prev]
            n[reelIndex] = false
            return n
          })

          setReels((prevReels) => {
            const newReelsState = prevReels.map((r) => [...r])
            if (predeterminedFinalReelsRef.current) {
              newReelsState[reelIndex] = [...predeterminedFinalReelsRef.current[reelIndex]] // Deep copy column
            }
            console.log(
              `[SlotMachineGrid] Reel ${reelIndex} stopped. Column set to:`,
              predeterminedFinalReelsRef.current ? predeterminedFinalReelsRef.current[reelIndex] : "N/A",
            )
            if (reelIndex === reels.length - 1)
              console.log(
                "[SlotMachineGrid] All reels stopped. Final visual state should be:",
                JSON.parse(JSON.stringify(newReelsState)),
              )
            return newReelsState
          })

          if (reelIndex === reels.length - 1) {
            console.log(
              "[SlotMachineGrid] Last reel stopped. Checking win condition against:",
              JSON.parse(JSON.stringify(predeterminedFinalReelsRef.current)),
            )
            
            // Só verifica vitória se forceWinningPayline for true
            console.log("🔍 DEBUG SlotMachineGrid - forceWinningPayline:", forceWinningPayline);
            
            if (forceWinningPayline) {
              const winResult = predeterminedFinalReelsRef.current
                ? getWinningPositions(predeterminedFinalReelsRef.current)
                : null
              console.log("🎯 SlotMachineGrid - ForceWinningPayline=true, Win result:", winResult)
              onWin(winResult ? winResult.positions : null)
            } else {
              // Se não deve forçar payline, nunca há vitória
              console.log("❌ SlotMachineGrid - ForceWinningPayline=false - no win, no highlight")
              onWin(null)
            }
            onSpinEnd()
          }
        }, stopDelays[reelIndex])
      })
    }
    return () => {
      intervalRefs.current.forEach((id) => id && clearInterval(id))
      timeoutRefs.current.forEach((id) => id && clearTimeout(id))
      if (preWinVibrationStartTimeoutRef.current) clearTimeout(preWinVibrationStartTimeoutRef.current)
      if (preWinVibrationEndTimeoutRef.current) clearTimeout(preWinVibrationEndTimeoutRef.current)
      if (falsePreWinVibrationStartTimeoutRef.current) clearTimeout(falsePreWinVibrationStartTimeoutRef.current)
      if (falsePreWinVibrationEndTimeoutRef.current) clearTimeout(falsePreWinVibrationEndTimeoutRef.current)
    }
  }, [
    triggerSpin,
    spinCount,
    outcomeType,
    forceWinningPayline,
    generateWinningReels,
    generateLosingReels,
    generateRandomReels,
    getWinningPositions,
    onWin,
    onSpinEnd,
  ])

  // Defina um array de paletas de cores para os multiplicadores
  const multiplierColorPalettes = [
    // Index 0 (não usado diretamente para multiplicadores > 1, mas para consistência)
    { borderColor: "#fbbf24", boxShadow: "none" }, // Amarelo padrão

    // Index 1 (para multiplicador 2)
    {
      borderColor: ["#fcd34d", "#fbbf24", "#fcd34d"], // Amarelo/Dourado
      boxShadow: ["0 0 25px #fcd34d", "0 0 50px #fde047", "0 0 25px #fcd34d"],
    },
    // Index 2 (para multiplicador 3)
    {
      borderColor: ["#ef4444", "#f87171", "#ef4444"], // Vermelho
      boxShadow: ["0 0 30px #ef4444", "0 0 60px #fca5a5", "0 0 30px #ef4444"],
    },
    // Index 3 (para multiplicador 4) - Azul/Ciano
    {
      borderColor: ["#3b82f6", "#60a5fa", "#3b82f6"],
      boxShadow: ["0 0 35px #3b82f6", "0 0 70px #60a5fa", "0 0 35px #3b82f6"],
    },
    // Index 4 (para multiplicador 5) - Roxo/Magenta
    {
      borderColor: ["#a855f7", "#c084fc", "#a855f7"],
      boxShadow: ["0 0 40px #a855f7", "0 0 80px #d8b4fe", "0 0 40px #a855f7"],
    },
    // Index 5 (para multiplicador 6) - Verde/Lima
    {
      borderColor: ["#22c55e", "#4ade80", "#22c55e"],
      boxShadow: ["0 0 45px #22c55e", "0 0 90px #86efac", "0 0 45px #22c55e"],
    },
    // Index 6 (para multiplicador 7) - Laranja
    {
      borderColor: ["#f97316", "#fb923c", "#f97316"],
      boxShadow: ["0 0 50px #f97316", "0 0 100px #fdba74", "0 0 50px #f97316"],
    },
    // Index 7 (para multiplicador 8) - Rosa
    {
      borderColor: ["#ec4899", "#f472b6", "#ec4899"],
      boxShadow: ["0 0 55px #ec4899", "0 0 110px #fbcfe8", "0 0 55px #ec4899"],
    },
    // Index 8 (para multiplicador 9) - Teal
    {
      borderColor: ["#14b8a6", "#2dd4bf", "#14b8a6"],
      boxShadow: ["0 0 60px #14b8a6", "0 0 120px #5eead4", "0 0 60px #14b8a6"],
    },
    // Index 9 (para multiplicador 10) - Indigo
    {
      borderColor: ["#6366f1", "#818cf8", "#6366f1"],
      boxShadow: ["0 0 65px #6366f1", "0 0 130px #a5b4fc", "0 0 65px #6366f1"],
    },
    // Adicione mais paletas se quiser mais variações antes de reciclar
  ]

  const multiplierAnimation = (() => {
    if (currentMultiplier === 1) {
      return {
        borderColor: "#fbbf24", // Amarelo padrão
        boxShadow: "none",
        transition: {},
      }
    }

    // Calcula o índice da paleta de cores para ciclar
    // Subtraímos 2 porque o array começa do 0, e o multiplicador 1 é o default.
    // O +1 no final garante que o índice comece do 1 (primeira paleta dinâmica)
    const dynamicPalettesCount = multiplierColorPalettes.length - 1 // Número de paletas dinâmicas
    const paletteIndex = ((currentMultiplier - 2) % dynamicPalettesCount) + 1
    const palette = multiplierColorPalettes[paletteIndex]

    return {
      borderColor: palette.borderColor,
      boxShadow: palette.boxShadow,
      transition: {
        borderColor: { duration: 1.2, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" },
        boxShadow: { duration: 1.2, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" },
      },
    }
  })()

  return (
    <motion.div
      className="grid grid-cols-3 gap-2 p-4 bg-black bg-opacity-80 rounded-xl shadow-2xl border-4 border-yellow-500"
      animate={
        isPreWinVibrating
          ? { x: [0, -5, 5, -5, 5, 0], y: [0, 5, -5, 5, -5, 0] } // Vibração mais forte para vitória real
          : isFalsePreWinVibrating
            ? { x: [0, -2, 2, -2, 2, 0], y: [0, 2, -2, 2, -2, 0] } // Vibração mais suave para falsa pré-vitória
            : multiplierAnimation // Aplica a animação do multiplicador
      }
      transition={
        isPreWinVibrating
          ? { duration: 0.05, repeat: 30, repeatType: "mirror" }
          : isFalsePreWinVibrating
            ? { duration: 0.08, repeat: 10, repeatType: "mirror" }
            : multiplierAnimation.transition // Aplica a transição do multiplicador
      }
    >
      {reels.map((reel, reelIndex) => (
        <div
          key={reelIndex === 1 ? "central-reel-static" : `reel-${reelIndex}-${spinCount}`}
          className="flex flex-col gap-2"
        >
          {reel.map((elementSrc, rowIndex) => {
            const isHighlighted = highlightedCells?.some(([col, row]) => col === reelIndex && row === rowIndex)
            return (
              <motion.div
                key={
                  reelIndex === 1 && rowIndex === 1
                    ? "central-video-slot-static" // Chave estática para o vídeo central
                    : `cell-${reelIndex}-${rowIndex}-${spinCount}-${elementSrc}`
                }
                className={cn(
                  "relative w-full aspect-square rounded-lg overflow-hidden border-2",
                  isHighlighted ? "border-green-400" : "border-yellow-600",
                )}
                initial={false}
                animate={
                  isHighlighted
                    ? {
                        scale: 1.15,
                        rotateZ: [-2, 2],
                        boxShadow: ["0 0 20px #9ffe00", "0 0 30px #ffeb3b"],
                      }
                    : { 
                        scale: 1, 
                        rotateZ: 0, 
                        boxShadow: "none" 
                      }
                }
                transition={
                  isHighlighted
                    ? {
                        scale: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse"
                        },
                        rotateZ: {
                          duration: 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse"
                        },
                        boxShadow: {
                          duration: 0.8,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse"
                        }
                      }
                    : {}
                }
              >
                {reelIndex === 1 && rowIndex === 1 ? (
                  <CentralVideoSlot /> // Usar o componente memoizado
                ) : (
                  <Image
                    src={elementSrc || "/placeholder.svg"}
                    alt={`Slot Element ${reelIndex}-${rowIndex}`}
                    layout="fill"
                    objectFit="contain"
                    className="p-1"
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      ))}
    </motion.div>
  )
}
