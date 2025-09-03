"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User, Wallet, Ticket, Award, Users, LifeBuoy, LogOut, TextIcon as Telegram, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "@/contexts/audio-player-context"
import Cookies from 'js-cookie'

export default function LeftPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const { pauseSong } = useAudioPlayer()

  const navItems = [
    { href: "/profile", icon: User, label: "Meu Perfil" },
    { href: "/carteira", icon: Wallet, label: "Carteira" },
    { href: "/titulos", icon: Ticket, label: "Meus Títulos" },
    { href: "/resultados", icon: Award, label: "Resultados" },
    { href: "/indique", icon: Users, label: "Influencers" },
    { href: "/suporte", icon: LifeBuoy, label: "Suporte" },
    { href: "https://t.me/yourtelegramvip", icon: Telegram, label: "VIP Telegram", external: true }, // New button
    { href: "https://instagram.com/yourinstagram", icon: Instagram, label: "Instagram", external: true }, // New button
  ]

  const handleLogout = () => {
    pauseSong()
    // Limpar cookies de autenticação
    Cookies.remove('access_token', { path: '/' })
    Cookies.remove('refresh_token', { path: '/' })
    Cookies.remove('user', { path: '/' })
    
    // Limpar storage
    localStorage.clear()
    sessionStorage.clear()
    
    // Redirecionar usando replace para evitar voltar pelo histórico
    router.replace("/login")
  }

  return (
    <div className="flex flex-col h-full bg-[#1A2430] text-white p-4">
      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href && !item.external

          return item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive
                  ? "bg-[#9FFF00] text-[#1A2430] font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
      <div className="mt-auto pt-4 border-t border-gray-700">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  )
}
