"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function LandingHeader() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 w-full bg-[#191F26] p-4 flex items-center justify-center md:justify-between shadow-lg rounded-b-xl"
    >
      {/* Logo alinhada à esquerda */}
      <div className="flex-shrink-0">
        <Link href="/bem-vindo">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Image src="/images/raspepix-logo.png" alt="RaspePix Logo" width={150} height={45} priority />
          </motion.div>
        </Link>
      </div>

      {/* Botões de Acesso e Cadastro para telas maiores */}
      <div className="hidden md:flex items-center space-x-4">
        <Link href="/login" passHref>
          <Button className="text-lg px-8 py-6 rounded-full font-bold w-full sm:w-auto bg-[#9ffe00] text-[#191F26] hover:bg-[#7cc200] transition-colors duration-300 shadow-glow">
            Bora Divertir!
          </Button>
        </Link>
        <Link href="/cadastro" passHref>
          <Button
            variant="outline"
            className="text-lg px-8 py-6 rounded-full font-bold w-full sm:w-auto bg-transparent text-[#9ffe00] border-[#9ffe00] hover:bg-[#9ffe00] hover:text-[#191F26] transition-colors duration-300 shadow-glow-sm"
          >
            Cadastre-se
          </Button>
        </Link>
      </div>
    </motion.header>
  )
}
