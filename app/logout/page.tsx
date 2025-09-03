"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import Cookies from 'js-cookie'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Limpa todos os cookies e localStorage
    Cookies.remove('access_token')
    Cookies.remove('admin_token')
    localStorage.clear()

    const timer = setTimeout(() => {
      router.push("/")
      router.refresh() // Força um refresh completo da aplicação
    }, 8000)

    return () => clearTimeout(timer)
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
              "0 0 0px rgba(0,0,0,0)",
              "0 0 20px rgba(0,255,0,0.7)",
              "0 0 0px rgba(0,0,0,0)",
            ],
          }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 1 },
            filter: { duration: 1 },
            boxShadow: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              times: [0, 0.5, 1],
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
