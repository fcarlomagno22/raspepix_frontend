"use client"

import { useEffect, useRef } from "react"
import { useInView } from "framer-motion"
import { animate, useMotionValue, useTransform, motion } from "framer-motion"

interface CounterProps {
  target: string
}

export default function Counter({ target }: CounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 }) // Ativa quando 50% do elemento está visível

  // Função para parsear o valor alvo (ex: "5M+", "240K+", "99.9%")
  const parseTarget = (value: string): number => {
    if (value.includes("M+")) {
      return Number.parseFloat(value) * 1_000_000
    }
    if (value.includes("K+")) {
      return Number.parseFloat(value) * 1_000
    }
    if (value.includes("%")) {
      return Number.parseFloat(value)
    }
    return Number.parseFloat(value) // Para valores numéricos puros
  }

  // Função para formatar o valor animado de volta para o formato original
  const formatValue = (value: number, originalTarget: string): string => {
    if (originalTarget.includes("M+")) {
      return `${(value / 1_000_000).toFixed(0)}M+`
    }
    if (originalTarget.includes("K+")) {
      return `${(value / 1_000).toFixed(0)}K+`
    }
    if (originalTarget.includes("%")) {
      return `${value.toFixed(1)}%`
    }
    return value.toFixed(0) // Para valores inteiros
  }

  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => formatValue(latest, target))

  useEffect(() => {
    if (isInView) {
      const targetNum = parseTarget(target)
      const controls = animate(count, targetNum, {
        duration: 2, // Duração da animação de contagem
        ease: "easeOut",
      })
      return controls.stop
    }
  }, [isInView, count, target])

  // Para o caso específico "24/7" que não é um número para contar
  if (target === "24/7") {
    return <span ref={ref}>{target}</span>
  }

  return <motion.span ref={ref}>{rounded}</motion.span>
}
