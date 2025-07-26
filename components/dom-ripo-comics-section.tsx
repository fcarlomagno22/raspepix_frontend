"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DomRipoComicsSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simula uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsSubmitted(true)
    setEmail("") // Limpa o email após o envio
  }

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-50 via-yellow-100/50 to-gray-100 overflow-hidden">
      {/* Overlay de Grade */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Brilhos Amarelos/Laranjas */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob z-0"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col lg:flex-row items-center justify-center gap-12">
        <div className="text-center lg:text-left max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            HQs do{" "}
            <span className="bg-gradient-to-r from-[#9ffe00] to-lime-600 text-transparent bg-clip-text">Dom Ripo</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-800 mb-8">
            Explore as HQs do Dom Ripo e embarque nas aventuras mais insanas dele pelo mundo — luxo, zoeira e muita
            história pra contar!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 w-full lg:w-auto">
          <div className="relative group">
            <Image
              src="/images/foto_hq.png"
              alt="Capa da HQ do Dom Ripo"
              width={300}
              height={400}
              className="rounded-lg shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-yellow-500/50 group-hover:shadow-lg"
            />
            <span className="absolute -top-4 -right-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full rotate-12 animate-pulse-glow-golden">
              GRÁTIS
            </span>
          </div>

          <div className="w-full max-w-sm bg-white/80 p-6 rounded-lg shadow-xl border border-gray-200">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Digite seu melhor e-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-500 focus:ring-yellow-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow py-3 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Inscrevendo..." : "Bora Rir com o Dom Ripo!"}
                </Button>
              </form>
            ) : (
              <div className="text-center text-green-500">
                <h3 className="text-2xl font-bold mb-2">Parabéns! Dom Ripo já te adotou!</h3>
                <p className="text-lg">
                  Agora você faz parte da família Dom Ripo! Toda semana você receberá HQs que vão fazer você rir mais
                  que vídeo de gato na internet!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
