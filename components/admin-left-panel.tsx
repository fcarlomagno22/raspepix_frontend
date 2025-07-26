"use client"
import { motion } from "framer-motion"

export default function AdminLeftPanel() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-white overflow-hidden bg-gradient-to-br from-[#1A2430] to-[#0D1117]">
      {/* Hexagonal Pattern SVG Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="hex-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M5 0L10 2.88675V8.66025L5 11.547L0 8.66025V2.88675L5 0Z"
              fill="none"
              stroke="#9FFF00"
              strokeWidth="0.1"
            />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#hex-pattern)" />
      </svg>

      {/* Blur Circles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#9FFF00]/5 rounded-full mix-blend-overlay filter blur-2xl"
        animate={{
          x: ["-20%", "20%", "-20%"],
          y: ["-20%", "20%", "-20%"],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#9FFF00]/3 rounded-full mix-blend-overlay filter blur-2xl"
        animate={{
          x: ["20%", "-20%", "20%"],
          y: ["20%", "-20%", "20%"],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
      />

      {/* Decorative Horizontal Lines */}
      <div className="absolute top-[30%] left-0 w-full h-px bg-gradient-to-r from-transparent via-[#9FFF00]/20 to-transparent"></div>
      <div className="absolute top-[70%] left-0 w-full h-px bg-gradient-to-r from-transparent via-[#9FFF00]/20 to-transparent"></div>

      {/* Central Card */}
      <div className="relative z-10 bg-[#1A2430]/80 backdrop-blur-md border border-[#9FFF00]/20 rounded-xl p-8 text-center max-w-sm shadow-2xl">
        <h2 className="text-3xl font-extrabold leading-tight text-white mb-2">
          Painel de <span className="text-[#9FFF00]">Gestão</span>
        </h2>
        <p className="text-lg text-gray-300">
          Acesso exclusivo para administradores. Gerencie o RaspePix com segurança e eficiência.
        </p>
      </div>
    </div>
  )
}
