"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion" // Keep import for mobile version if needed, or remove if not used elsewhere
import { useRef } from "react"
import { useInView } from "framer-motion" // Keep import for mobile version if needed, or remove if not used elsewhere
import Link from "next/link"

export default function CtaSection() {
  const textRef = useRef(null)
  const imageRef = useRef(null) // Still needed for mobile image
  const isInViewText = useInView(textRef, { once: true, amount: 0.5 })
  const isInViewImage = useInView(imageRef, { once: true, amount: 0.5 }) // Still needed for mobile image

  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  // imageDesktopVariants and imageMobileVariants are still defined but only imageMobileVariants will be used.
  // Keeping them for now, but could be removed if not used.
  const imageDesktopVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  const imageMobileVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  return (
    <section className="relative py-16 md:py-24 bg-[#191F26] text-white overflow-hidden">
      {/* Brilho verde de fundo para a imagem (desktop) */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-1/2 flex items-center justify-center z-0">
        <div className="absolute w-[400px] h-[400px] bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        <motion.div
          ref={textRef}
          initial="hidden"
          animate={isInViewText ? "visible" : "hidden"}
          variants={textVariants}
          className="text-center lg:text-left max-w-2xl lg:w-1/2"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Ainda Está Lendo? Já Podia Estar Ganhando!
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Cadastre-se agora e ganhe bônus de boas-vindas! É como um happy hour, mas em vez de bebida, você ganha
            dinheiro!
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link href="/cadastro">
              <Button className="bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium py-3 px-8 text-lg shadow-glow-sm hover:shadow-glow">
                Bora começar já!
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Imagem do mascote para desktop - Simplificada para garantir visibilidade */}
        <div className="hidden lg:block lg:w-1/2 flex justify-center items-center relative">
          <div
            // Removed framer-motion animation for troubleshooting
            className="relative z-10"
          >
            <Image
              src="/images/shooter (1).png"
              alt="Mascote Dom Ripo"
              width={500}
              height={500}
              className="object-contain"
            />
          </div>
        </div>

        {/* Imagem do mascote para mobile - Mantida com animação */}
        <motion.div
          ref={imageRef}
          initial="hidden"
          animate={isInViewImage ? "visible" : "hidden"}
          variants={imageMobileVariants}
          className="lg:hidden w-full flex justify-center items-center mt-8"
        >
          <Image
            src="/images/shooter (1).png"
            alt="Mascote Dom Ripo"
            width={300}
            height={300}
            className="object-contain"
          />
        </motion.div>
      </div>
    </section>
  )
}
