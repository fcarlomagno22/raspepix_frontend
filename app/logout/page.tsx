"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/") // Redirecionar para a página raiz
    }, 8000) // 8 segundos

    return () => clearTimeout(timer) // Limpa o timer se o componente for desmontado
  }, [router])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      {/* Grid de fundo */}
      <div className="absolute inset-0 z-0 bg-grid-pattern"></div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "brightness(0.5)" }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: "brightness(1)",
            boxShadow: [
              "0 0 0px rgba(0,0,0,0)", // Sem sombra inicial
              "0 0 20px rgba(0,255,0,0.7)", // Brilho verde neon
              "0 0 0px rgba(0,0,0,0)", // Volta para sem sombra
            ],
          }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 1 },
            filter: { duration: 1 },
            boxShadow: {
              duration: 2, // Duração da animação da sombra
              repeat: Number.POSITIVE_INFINITY, // Repete infinitamente
              ease: "easeInOut", // Suaviza a transição
              times: [0, 0.5, 1], // Pontos de controle para a animação da sombra
            },
          }}
          className="relative w-full max-w-md aspect-square flex items-center justify-center"
        >
          <Image
            src="/images/raspepix-saudades.png"
            alt="Volta logo! Já tô com saudades."
            width={500}
            height={500}
            priority
            className="rounded-lg object-contain"
          />
        </motion.div>
        <h1 className="mt-8 text-3xl md:text-4xl font-bold text-center">Volta logo! Já estamos com saudades!</h1>
        <p className="mt-4 text-lg text-center text-gray-300">Você será redirecionado em breve...</p>
      </div>
    </div>
  )
}
