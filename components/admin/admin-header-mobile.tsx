"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface AdminHeaderMobileProps {
  onOpenSidebar: () => void
}

export default function AdminHeaderMobile({ onOpenSidebar }: AdminHeaderMobileProps) {
  return (
    <header className="lg:hidden w-full bg-[#1A2430] p-4 flex items-center justify-between shadow-lg border-b border-[#9FFF00]/10 fixed top-0 left-0 right-0 z-30">
      <Button variant="ghost" size="icon" className="text-[#9FFF00]" onClick={onOpenSidebar}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Abrir menu</span>
      </Button>
      <Image
        src="/images/raspepix-logo.png"
        alt="RaspePix Logo"
        width={120}
        height={30}
        className="animate-pulse-glow-golden"
        priority
      />
      <div className="w-10"></div> {/* Espaçador para centralizar a logo */}
    </header>
  )
}
