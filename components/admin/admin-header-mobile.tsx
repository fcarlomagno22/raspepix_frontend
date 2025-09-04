"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Menu,
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Ticket, 
  Gift, 
  Bell, 
  Settings, 
  HelpCircle,
  LogOut,
  Music,
  BookOpen,
  Network,
  FileText,
  Gamepad2
} from "lucide-react"
import { useAdminPermissions } from "@/hooks/use-admin-permissions"

interface AdminHeaderMobileProps {
  onLogout: () => void
}

export default function AdminHeaderMobile({ onLogout }: AdminHeaderMobileProps) {
  const pathname = usePathname()
  const { hasPermission } = useAdminPermissions()

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", permission: "dashboard" },
    { href: "/admin/clientes", icon: Users, label: "Clientes", permission: "clientes" },
    { href: "/admin/financeiro", icon: DollarSign, label: "Financeiro", permission: "financeiro" },
    { href: "/admin/sorteios", icon: Ticket, label: "Sorteios", permission: "sorteio" },
    { href: "/admin/raspadinhas", icon: Gift, label: "Raspadinhas", permission: "raspadinhas" },
    { href: "/admin/afiliados", icon: Network, label: "Afiliados", permission: "afiliados" },
    { href: "/admin/afiliados", icon: Users, label: "Afiliados", permission: "afiliados" },
    { href: "/admin/playlist", icon: Music, label: "Playlist", permission: "playlist" },
    { href: "/admin/hq", icon: BookOpen, label: "HQs", permission: "hq" },
    { href: "/admin/portaldosorteado", icon: Gamepad2, label: "Portal do Sorteado", permission: "portaldosorteado" },
    { href: "/admin/notificacoes", icon: Bell, label: "Notificações", permission: "notificacoes" },
    { href: "/admin/auditoria", icon: FileText, label: "Auditoria", permission: "logs_auditoria" },
    { href: "/admin/suporte", icon: HelpCircle, label: "Suporte", permission: "suporte" },
    { href: "/admin/configuracoes", icon: Settings, label: "Configurações", permission: "configuracoes" },
  ]

  return (
    <header className="lg:hidden w-full bg-[#131B24] p-4 flex items-center justify-between shadow-lg border-b border-[#9FFF00]/10 fixed top-0 left-0 right-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-[#9FFF00]">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-[#131B24] border-r border-[#9FFF00]/10">
          <div className="flex flex-col h-full">
            <div className="p-6">
              <Link href="/admin/dashboard">
                <h1 className="text-2xl font-bold text-white">
                  Raspe<span className="text-[#9FFF00]">Pix</span>
                </h1>
                <p className="text-sm text-gray-400">Painel Administrativo</p>
              </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                // Verificar se o usuário tem permissão para este item
                if (item.permission && !hasPermission(item.permission)) {
                  return null
                }

                const Icon = item.icon
                const isActive = pathname === item.href

                return (
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
            </nav>

            <div className="p-4 border-t border-[#9FFF00]/10">
              <Button
                onClick={onLogout}
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
