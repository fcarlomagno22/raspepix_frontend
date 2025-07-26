"use client"
import { useRef, useEffect, useState, useCallback } from "react"
import type React from "react"
import { motion } from "framer-motion"

import type { Raspadinha } from "@/lib/raspadinha-data"

interface ScratchCardProps {
  raspadinha: Raspadinha
  isRevealed: boolean
  onScratchComplete: (percent: number) => void
  onReveal: () => void
  imageDimensions: { width: number; height: number }
}

export function ScratchCard({
  raspadinha,
  isRevealed,
  onScratchComplete,
  onReveal,
  imageDimensions,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null) // Ref for the audio element
  const [isDrawing, setIsDrawing] = useState(false)
  const [scratchPercentage, setScratchPercentage] = useState(0)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  const ORIGINAL_IMAGE_WIDTH = 500
  const ORIGINAL_IMAGE_HEIGHT = 700
  const ORIGINAL_CANVAS_WIDTH_FACTOR = 0.63
  const ORIGINAL_CANVAS_WIDTH_OFFSET = 22
  const ORIGINAL_CANVAS_HEIGHT_FACTOR = 0.21
  const ORIGINAL_CANVAS_HEIGHT_OFFSET = -25
  const ORIGINAL_CANVAS_LEFT_OFFSET_ADJUSTMENT = -2
  const ORIGINAL_CANVAS_TOP_OFFSET_PIXELS = 445

  const brushSize = 20

  const canvasWidth = imageDimensions.width * ORIGINAL_CANVAS_WIDTH_FACTOR + ORIGINAL_CANVAS_WIDTH_OFFSET
  const canvasHeight = imageDimensions.height * ORIGINAL_CANVAS_HEIGHT_FACTOR + ORIGINAL_CANVAS_HEIGHT_OFFSET

  const canvasLeftOffset = (imageDimensions.width - canvasWidth) / 2 + ORIGINAL_CANVAS_LEFT_OFFSET_ADJUSTMENT
  const canvasTopOffset = imageDimensions.height * (ORIGINAL_CANVAS_TOP_OFFSET_PIXELS / ORIGINAL_IMAGE_HEIGHT)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    if (!isRevealed) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, "#555555")
      gradient.addColorStop(0.5, "#AAAAAA")
      gradient.addColorStop(1, "#555555")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < 7000; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = Math.random() * 1.5
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.07})`
        ctx.fill()
      }

      for (let i = 0; i < 3500; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const reliefRadius = Math.random() * 0.8
        ctx.beginPath()
        ctx.arc(x, y, reliefRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.07})`
        ctx.fill()
      }
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [isRevealed, canvasWidth, canvasHeight])

  const getMousePos = useCallback((canvas: HTMLCanvasElement, evt: MouseEvent | Touch) => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    }
  }, [])

  const draw = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.globalCompositeOperation = "destination-out"
      ctx.globalAlpha = 0.7

      ctx.beginPath()
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2, false)
      ctx.fill()

      if (lastPoint.current) {
        ctx.beginPath()
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
        ctx.lineTo(x, y)
        ctx.lineWidth = brushSize
        ctx.lineCap = "round"
        ctx.stroke()
      }
      lastPoint.current = { x, y }
    },
    [brushSize],
  )

  const calculateScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return 0
    const ctx = canvas.getContext("2d")
    if (!ctx) return 0

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let transparentPixels = 0

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 50) {
        transparentPixels++
      }
    }

    const totalPixels = canvas.width * canvas.height
    const percent = (transparentPixels / totalPixels) * 100
    setScratchPercentage(percent)
    onScratchComplete(percent)

    // Auto-reveal logic
    if (percent >= 55 && !isRevealed) {
      // Stop scratching sound
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      // Set a timeout for the full reveal
      setTimeout(() => {
        // Clear canvas completely
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
        }
        onReveal() // Call the reveal callback
      }, 500) // 500ms delay
    }
    return percent
  }, [onScratchComplete, onReveal, isRevealed])

  const handleScratchStart = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (isRevealed) return
      e.preventDefault() // Prevent default touch behavior like scrolling
      setIsDrawing(true)
      lastPoint.current = getMousePos(e.currentTarget, "touches" in e ? e.touches[0] : e)
      draw(lastPoint.current.x, lastPoint.current.y)

      if (audioRef.current) {
        audioRef.current.volume = 1.0
        // Play the audio and catch the AbortError
        audioRef.current.play().catch((error) => {
          if (error.name === "AbortError") {
            // This is expected when play() is interrupted by pause()
            // console.log('Audio play aborted:', error);
          } else {
            console.error("Error playing audio:", error)
          }
        })
      }
    },
    [draw, getMousePos, isRevealed],
  )

  const handleScratchMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing || isRevealed) return
      e.preventDefault() // Prevent default touch behavior like scrolling
      const currentPoint = getMousePos(e.currentTarget, "touches" in e ? e.touches[0] : e)
      draw(currentPoint.x, currentPoint.y)
    },
    [isDrawing, draw, getMousePos, isRevealed],
  )

  const handleScratchEnd = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false)
      lastPoint.current = null
      calculateScratchPercentage()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [isDrawing, calculateScratchPercentage])

  const textOpacity = 1 - scratchPercentage / 100

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20"
      style={{
        width: imageDimensions.width,
        height: imageDimensions.height,
      }}
    >
      <div
        className="absolute"
        style={{
          left: canvasLeftOffset,
          top: canvasTopOffset,
          width: canvasWidth,
          height: canvasHeight,
        }}
      >
        {/* New: Golden Glow/Shimmer Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: (scratchPercentage / 100) * 0.7, // Max opacity 0.7
            scale: 0.8 + (scratchPercentage / 100) * 0.2, // Scale from 0.8 to 1.0
          }}
          transition={{ duration: 0.1 }} // Quick transition for responsiveness
          style={{
            background: "radial-gradient(circle at center, rgba(255, 215, 0, 0.7) 0%, rgba(255, 215, 0, 0) 70%)", // Golden color
          }}
        />
        <canvas
          ref={canvasRef}
          className="touch-none rounded-2xl text-slate-700"
          onMouseDown={handleScratchStart}
          onMouseMove={handleScratchMove}
          onMouseUp={handleScratchEnd}
          onMouseLeave={handleScratchEnd}
          onTouchStart={handleScratchStart}
          onTouchMove={handleScratchMove}
          onTouchEnd={handleScratchEnd}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          }}
        />
        {!isRevealed && (
          <div
            className="absolute flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300"
            style={{
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              opacity: textOpacity,
            }}
          >
            <p className="text-4xl font-bold text-black drop-shadow-lg mb-1">Raspe Aqui</p>
            <p className="text-lg text-black drop-shadow-md">Deslize o dedo para raspar</p>
          </div>
        )}
      </div>
      {/* Audio element for scratching sound */}
      <audio
        ref={audioRef}
        src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/sound%20effects/Som%20de%20Raspando.mp3"
        preload="auto"
        loop
      />
    </div>
  )
}
