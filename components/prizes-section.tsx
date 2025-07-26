"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlayCircle } from "lucide-react"
import WinnerAvatar from "./winner-avatar"
import WinnerVideoOverlay from "./winner-video-overlay"
import { mockWinnerVideos } from "@/lib/mock-winner-videos"
import { useRouter } from "next/navigation" // Import useRouter

export default function PrizesSection() {
  const [selectedWinner, setSelectedWinner] = useState(null)
  const router = useRouter() // Initialize useRouter

  const handleWinnerClick = (winner: any) => {
    // Navigate to the /ganhadores page when a winner avatar is clicked
    router.push("/ganhadores")
  }

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 to-gray-950 overflow-hidden">
      {/* Overlay de Grade */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Brilhos Verdes/Roxos */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#9FFF00] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob z-0"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-white">
          Conheça alguns{" "}
          <span className="bg-gradient-to-r from-[#9FFF00] to-lime-600 text-transparent bg-clip-text">Ganhadores</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Veja a alegria de quem já foi sorteado e transformou a vida com a RaspePix!
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12 justify-items-center">
          {mockWinnerVideos.slice(0, 6).map((winner) => (
            <WinnerAvatar key={winner.id} winner={winner} onClick={handleWinnerClick} />
          ))}
        </div>

        <Button
          className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow py-3 px-8 text-lg inline-flex items-center gap-2"
          onClick={() => router.push("/ganhadores")} // Also link the main button
        >
          Ver Todos os Ganhadores
          <PlayCircle className="w-5 h-5" />
        </Button>
      </div>

      {selectedWinner && <WinnerVideoOverlay video={selectedWinner} onClose={() => setSelectedWinner(null)} />}
    </section>
  )
}
