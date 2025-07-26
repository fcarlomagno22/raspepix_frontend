"use client"

import { LogOut, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useProModal } from "@/hooks/use-pro-modal"
import { useAudioPlayer } from "@/contexts/audio-player-context"

interface AdminSidebarProps {
  isPro: boolean
  onLogout: () => void
}

export const AdminSidebar = ({ isPro = false, onLogout }: AdminSidebarProps) => {
  const proModal = useProModal()
  const { pauseSong } = useAudioPlayer()

  return (
    <div className="p-4 space-y-2 w-full">
      {isPro ? null : (
        <Button onClick={proModal.onOpen} variant="secondary" className="w-full">
          Upgrade to Pro
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-sky-500/10 hover:text-sky-400 transition-colors"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 space-y-0" align="start">
          <DropdownMenuItem onClick={proModal.onOpen} className="font-medium">
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        onClick={() => {
          pauseSong() // Parar a música imediatamente
          onLogout() // Chamar o handler de logout do pai
        }}
        variant="ghost"
        className="w-full justify-start text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
      >
        <LogOut className="h-5 w-5 mr-3" />
        Sair
      </Button>
    </div>
  )
}
