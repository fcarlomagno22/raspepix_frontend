"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function LoginLeftPanel() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#1a323a] overflow-hidden">
      {/* Gradiente de fundo animado */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #9FFF00 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, #9FFF00 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, #9FFF00 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, #9FFF00 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, #9FFF00 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Padrão de grade sutil */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(#9FFF00 1px, transparent 1px),
            linear-gradient(90deg, #9FFF00 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Círculos decorativos */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full border border-[#9FFF00]/10"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Imagem principal flutuante */}
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-[80%] max-w-[400px] z-10"
      >
        <Image
          src="/images/raspepix-gold-bar-new.png"
          alt="RaspePix Gold Bar"
          width={500}
          height={700}
          className="w-full h-auto"
          priority
        />
      </motion.div>
    </div>
  )
} 