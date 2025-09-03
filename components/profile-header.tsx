"use client"

import Image from 'next/image'
import { Card } from "@/components/ui/card"

interface ProfileHeaderProps {
  name: string
  email: string
  avatarUrl: string
}

export function ProfileHeader({ name, email, avatarUrl }: ProfileHeaderProps) {
  return (
    <div className="relative w-full bg-[#0A1118] overflow-hidden">
      {/* Efeito de fundo */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9FFF00]/5 via-[#1A2430] to-[#0A1118]" />
        <div className="absolute inset-0 bg-[url('/images/golden-pattern-background.jpeg')] opacity-5" />
      </div>

      {/* Conteúdo do perfil */}
      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Avatar com efeito de brilho */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9FFF00] to-[#00FF94] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-black">
              <Image
                src={avatarUrl}
                alt={name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Informações do usuário com efeitos */}
          <div className="mt-8 space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {name}
            </h1>
            <p className="text-lg text-[#9FFF00]/80">
              {email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}