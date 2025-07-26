"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Settings,
  Gift,
  Users,
  Network,
  Megaphone,
  Ticket,
  Banknote,
  Layers,
  BookOpenText,
  FileSearch,
  Bell,
  Headphones,
  LogOut,
  X,
  ChevronDown,
  Music,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { adminAuth } from "@/services/auth"

// Definição dos itens do menu
const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Integração", path: "/admin/integracao", icon: Settings },
  { name: "Portal do Sorteado", path: "/admin/portaldosorteado", icon: Gift },
  {
    name: "Usuários", // Item pai expansível
    icon: Users,
    children: [
      { name: "Clientes", path: "/admin/clientes", icon: Users },
      { name: "Afiliados", path: "/admin/afiliados", icon: Network },
      { name: "Influencers", path: "/admin/influencers", icon: Megaphone },
    ],
  },
  { name: "Sorteios", path: "/admin/sorteios", icon: Ticket },
  { name: "Financeiro", path: "/admin/financeiro", icon: Banknote },
  { name: "Raspadinhas", path: "/admin/raspadinhas", icon: Layers },
  { name: "Playlist", path: "/admin/playlist", icon: Music },
  { name: "HQ", path: "/admin/hq", icon: BookOpenText },
  { name: "Logs de Auditoria", path: "/admin/auditoria", icon: FileSearch },
  { name: "Notificações", path: "/admin/notificacoes", icon: Bell },
  { name: "Suporte", path: "/admin/suporte", icon: Headphones },
  { name: "Configurações", path: "/admin/configuracoes", icon: Settings },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await adminAuth.logout()
      router.replace('/admin/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const sidebarContent = (
    <div className="flex h-full w-full flex-col bg-[#1A2430] border-r border-[#9FFF00]/10 text-white">
      {/* Header com Logo */}
      <div className="flex items-center justify-center p-4 border-b border-[#9FFF00]/10 relative">
        <Image src="/images/raspepix-logo.png" alt="RaspePix Logo" width={120} height={30} priority />
        {/* Botão X para fechar no mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 lg:hidden text-gray-400 hover:bg-transparent hover:text-white"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar menu</span>
        </Button>
      </div>

      {/* Informações do Admin */}
      <div className="p-3 border-b border-[#9FFF00]/10 text-center">
        <p className="text-sm text-gray-400">Logado como:</p>
        <p className="font-medium text-[#9FFF00]">Admin RaspePix</p>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon

          if (item.children) {
            // Renderizar como Collapsible (menu expansível)
            const isChildActive = item.children.some((child) => pathname === child.path)
            return (
              <Collapsible key={item.name} defaultOpen={isChildActive}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start flex items-center p-3 rounded-lg transition-colors duration-200",
                      isChildActive
                        ? "bg-[#9FFF00]/10 text-[#9FFF00]"
                        : "text-gray-300 hover:bg-[#9FFF00]/5 hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">Usuários</span>
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.path
                    const ChildIcon = child.icon
                    return (
                      <Link
                        key={child.name}
                        href={child.path}
                        className={cn(
                          "flex items-center p-3 rounded-lg transition-colors duration-200",
                          isChildActive
                            ? "bg-[#9FFF00]/10 text-[#9FFF00]"
                            : "text-gray-300 hover:bg-[#9FFF00]/5 hover:text-white",
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ChildIcon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{child.name}</span>
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          } else {
            // Renderizar como item de menu normal
            return (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "flex items-center p-3 rounded-lg transition-colors duration-200",
                  isActive ? "bg-[#9FFF00]/10 text-[#9FFF00]" : "text-gray-300 hover:bg-[#9FFF00]/5 hover:text-white",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{item.name}</span>
              </Link>
            )
          }
        })}
      </nav>

      {/* Rodapé do Sidebar */}
      <div className="p-4 border-t border-[#9FFF00]/10">
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

  return (
    <>
      {/* Sidebar para Desktop */}
      <aside className="hidden lg:flex flex-shrink-0 w-64 h-screen transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-20">
        {sidebarContent}
      </aside>

      {/* Sidebar para Mobile (Overlay) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden">
          {/* Este trigger será usado no AdminHeaderMobile */}
          <Button variant="ghost" size="icon" className="text-[#9FFF00]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-[#1A2430] border-r border-[#9FFF00]/10">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  )
}
