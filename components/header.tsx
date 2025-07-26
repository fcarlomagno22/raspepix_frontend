"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Play,
  Menu,
  User,
  CreditCard,
  Ticket,
  BarChart3,
  Gift,
  HelpCircle,
  LogOut,
  Bell,
  Send,
  Instagram,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUnreadNotifications } from "@/hooks/use-notifications"

export default function Header() {
  const { hasUnread } = useUnreadNotifications();

  return (
    <header className="w-full bg-[#191F26] p-4 flex items-center justify-between shadow-lg rounded-b-xl">
      {/* Logo alinhada à esquerda */}
      <div className="flex-shrink-0">
        <Link href="/home">
          <Image
            src="/images/raspepix-logo.png"
            alt="RaspePix Logo"
            width={150}
            height={45}
            className="animate-pulse-glow-golden"
            priority
          />
        </Link>
      </div>

      {/* Espaçador para empurrar os botões para a direita */}
      <div className="flex-grow"></div>

      {/* Ícones do lado direito com espaçamento reduzido */}
      <div className="flex items-center space-x-2">
        {" "}
        {/* space-x-2 para diminuir a distância */}
        <Link href="/playlist" passHref>
          <Button variant="ghost" size="icon" className="text-[#9ffe00] hover:bg-[#1a323a] hover:text-white">
            <Play className="h-6 w-6" />
            <span className="sr-only">Play</span>
          </Button>
        </Link>
        {/* Botão de Notificações */}
        <Link href="/notificacoes" passHref>
          <Button variant="ghost" size="icon" className="relative text-[#9ffe00] hover:bg-[#1a323a] hover:text-white">
            <Bell className="h-6 w-6" />
            {hasUnread && (
              <motion.span
                className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border border-[#191F26]"
                initial={{ boxShadow: "0 0 0px 0px rgba(239, 68, 68, 0.4)" }}
                animate={{
                  boxShadow: [
                    "0 0 2px 2px rgba(239, 68, 68, 0.2)",
                    "0 0 4px 4px rgba(239, 68, 68, 0.3)",
                    "0 0 2px 2px rgba(239, 68, 68, 0.2)"
                  ]
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            )}
            <span className="sr-only">Notificações</span>
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-[#9ffe00] hover:bg-[#1a323a] hover:text-white">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-[#191F26] border-[#1a323a] text-white shadow-lg rounded-md">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer hover:bg-[#1a323a] rounded-sm">
                <User className="h-4 w-4 text-[#9ffe00]" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/carteira" className="flex items-center gap-2 cursor-pointer hover:bg-[#1a323a] rounded-sm">
                <CreditCard className="h-4 w-4 text-[#9ffe00]" />
                Carteira
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/titulos" className="flex items-center gap-2 cursor-pointer hover:bg-[#1a323a] rounded-sm">
                <Ticket className="h-4 w-4 text-[#9ffe00]" />
                Meus Títulos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/resultados" className="flex items-center gap-2 cursor-pointer hover:bg-[#1a323a] rounded-sm">
                <BarChart3 className="h-4 w-4 text-[#9ffe00]" />
                Resultados
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/indique" className="flex items-center gap-2 cursor-pointer hover:bg-[#1a323a] rounded-sm">
                <Gift className="h-4 w-4 text-[#9ffe00]" />
                Indique e Ganhe
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/suporte" className="flex items-center gap-2 cursor-pointer hover:bg-[#1a323a] rounded-sm">
                <HelpCircle className="h-4 w-4 text-[#9ffe00]" />
                Suporte
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="https://t.me/yourtelegramvip"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer hover:bg-[#1a323a] rounded-sm"
              >
                <Send className="h-4 w-4 text-[#9ffe00]" />
                VIP Telegram
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="https://instagram.com/yourinstagram"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer hover:bg-[#1a323a] rounded-sm"
              >
                <Instagram className="h-4 w-4 text-[#9ffe00]" />
                Instagram
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem asChild>
              <Link href="/logout" className="flex items-center gap-2 cursor-pointer hover:bg-[#1a323a] rounded-sm">
                <LogOut className="h-4 w-4 text-red-400" />
                <span className="text-red-400">Sair</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
