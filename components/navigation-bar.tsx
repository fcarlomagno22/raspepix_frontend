"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HomeIcon, WalletIcon, UsersIcon, BookOpen, Ticket } from "lucide-react"
import { ExitConfirmationDialog } from "@/components/exit-confirmation-dialog"
import { useAudioPlayer } from "@/contexts/audio-player-context"

export default function NavigationBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const { pauseSong } = useAudioPlayer()

  // Define the navigation items as per your request
  const navItems = [
    { href: "/indique", icon: UsersIcon, label: "Indique" },
    { href: "/carteira", icon: WalletIcon, label: "Carteira" },
    { href: "/home", icon: HomeIcon, label: "Início" },
    { href: "/titulos", icon: Ticket, label: "Cupons" }, // Texto alterado aqui
    { href: "/hqs", icon: BookOpen, label: "HQs" },
  ]

  const handleLogout = () => {
    pauseSong()
    localStorage.clear()
    sessionStorage.clear()
    router.push("/login")
    setShowExitConfirmation(false)
  }

  return (
    <>
      <footer className="fixed bottom-4 left-0 right-0 z-40 px-2 md:px-4">
        <div className="flex items-center justify-center max-w-sm md:max-w-lg mx-auto bg-[#9FFF00] rounded-full py-3 px-6 shadow-lg">
          <div className="grid grid-cols-5 gap-4 w-full max-w-xs items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center text-center group"
                >
                  {isActive ? (
                    <div className="bg-[#191F26] rounded-full p-2">
                      <Icon className="h-6 w-6 text-[#9FFF00]" />
                    </div>
                  ) : (
                    <Icon className="h-6 w-6 text-[#191F26]/70 group-hover:text-[#191F26]" />
                  )}
                  <span
                    className={`text-xs md:text-sm mt-1 md:mt-1.5 transition-colors duration-200 ${
                      isActive ? "text-[#191F26] font-medium" : "text-[#191F26]/70 group-hover:text-[#191F26]"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </footer>

      <ExitConfirmationDialog
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
        onConfirm={handleLogout}
        onCancel={() => setShowExitConfirmation(false)}
      />
    </>
  )
}
