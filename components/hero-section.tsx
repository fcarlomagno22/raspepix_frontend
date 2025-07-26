"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 }) // Trigger when 50% of the section is visible

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch((error) => console.error("Video play failed:", error))
      } else {
        videoRef.current.pause()
      }
    }
  }, [isInView])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#191F26] flex flex-col md:flex-row items-center justify-center p-4 md:p-8 overflow-hidden pt-24 md:pt-16"
    >
      {/* Background blobs for visual interest */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#9ffe00] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-[#7cc200] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#9ffe00] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-6000"></div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left max-w-2xl mx-auto md:mx-0 md:mr-8 mb-8 md:mb-0">
        <motion.h1
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4"
        >
          Banheiro, celular e <span className="text-[#9ffe00] animate-text-glow">RaspePix</span>: o trio que faz a
          mágica acontecer.
        </motion.h1>
        <motion.p
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-lg md:text-xl text-gray-300 mb-8 max-w-md"
        >
          NÃO É BET, NÃO É CASSINO, NÃO É PEGADINHA, É CHANCE REAL DE GANHAR
        </motion.p>
        <div className="flex flex-wrap justify-center gap-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <Link href="/login" passHref>
              <Button className="w-full sm:w-auto bg-[#9ffe00] text-[#191F26] hover:bg-[#7cc200] transition-colors duration-300 text-lg px-8 py-6 rounded-full font-bold shadow-glow">
                Bora Divertir!
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <Link href="/cadastro" passHref>
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent text-[#9ffe00] border-[#9ffe00] hover:bg-[#9ffe00] hover:text-[#191F26] transition-colors duration-300 text-lg px-8 py-6 rounded-full font-bold shadow-glow-sm"
              >
                Cadastre-se
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Vídeo do celular */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 1, type: "spring", stiffness: 100 }}
        className="relative z-10 w-full max-w-xs md:max-w-sm lg:max-w-md mt-8 md:mt-0 animate-float"
      >
        <video
          ref={videoRef}
          className="w-full h-auto rounded-3xl border-4 border-[#9ffe00] shadow-video-glow object-cover"
          loop
          muted
          playsInline
          preload="auto"
        >
          <source
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/video_hero-loDF5STYu07qEnZjI22Z5GpuU79ZV6.mp4"
            type="video/mp4"
          />
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </motion.div>
    </section>
  )
}
