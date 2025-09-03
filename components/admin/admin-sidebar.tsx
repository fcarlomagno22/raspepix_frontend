"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Ticket, 
  Bell, 
  Settings, 
  HelpCircle,
  LogOut,
  Music,
  BookOpen,
  FileText,
  Gamepad2,
  ChevronDown,
  Network,
  Megaphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "@/contexts/audio-player-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminPermissions } from "@/hooks/use-admin-permissions"

interface AdminSidebarProps {
  onLogout: () => void
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname()
  const { pauseSong } = useAudioPlayer()
  const { hasPermission, loading } = useAdminPermissions()

  const mainNavItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", permission: "dashboard" },
    {
      type: "dropdown",
      icon: Users,
      label: "Usuários",
      permission: "usuarios",
      items: [
        { href: "/admin/clientes", label: "Clientes", permission: "clientes" },
        { href: "/admin/afiliados", label: "Influencers", permission: "afiliados" },
      ],
    },
    { href: "/admin/financeiro", icon: DollarSign, label: "Financeiro", permission: "financeiro" },
    { href: "/admin/sorteios", icon: Ticket, label: "Sorteios", permission: "sorteio" },
    { href: "/admin/portaldosorteado", icon: Gamepad2, label: "Portal do Sorteado", permission: "portaldosorteado" },
    { href: "/admin/marketing", icon: Megaphone, label: "Marketing", permission: "marketing" },
    { href: "/admin/hq", icon: BookOpen, label: "HQs", permission: "hq" },
    { href: "/admin/playlist", icon: Music, label: "Playlist", permission: "playlist" },
  ]

  const communicationNavItems = [
    { href: "/admin/notificacoes", icon: Bell, label: "Notificações", permission: "notificacoes" },
    { href: "/admin/suporte", icon: HelpCircle, label: "Suporte", permission: "suporte" },
  ]

  const systemNavItems = [
    { href: "/admin/integracao", icon: Network, label: "Integração", permission: "integracao" },
    { href: "/admin/auditoria", icon: FileText, label: "Logs de auditoria", permission: "logs_auditoria" },
  ]

  const renderNavItem = (item: any) => {
    // Verificar se o usuário tem permissão para este item
    if (item.permission && !hasPermission(item.permission)) {
      return null
    }

    if (item.type === "dropdown") {
      // Para dropdowns, verificar se pelo menos um item filho tem permissão
      const hasAnyChildPermission = item.items.some((subItem: any) => 
        !subItem.permission || hasPermission(subItem.permission)
      )
      
      if (!hasAnyChildPermission) {
        return null
      }

      const isActive = item.items.some((subItem: any) => pathname === subItem.href)
      const Icon = item.icon

      return (
        <DropdownMenu key={item.label}>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#0D1117] border-white/5">
            {item.items.map((subItem: any) => {
              // Verificar permissão para cada item filho
              if (subItem.permission && !hasPermission(subItem.permission)) {
                return null
              }
              
              return (
                <DropdownMenuItem key={subItem.href} asChild>
                  <Link
                    href={subItem.href}
                    className={`w-full px-2 py-1.5 text-sm ${
                      pathname === subItem.href
                        ? "text-primary"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {subItem.label}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    const Icon = item.icon
    const isActive = pathname === item.href

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon className="h-4.5 w-4.5" />
        {item.label}
      </Link>
    )
  }

  return (
    <div className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#131B24] border-r border-white/5 overflow-y-auto">
      <div className="p-6 flex flex-col items-center border-b border-white/5">
        <Link href="/admin/dashboard" className="flex flex-col items-center">
          <Image
            src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//00%20-%20Logo%20RaspePix.png"
            alt="RaspePix Logo"
            width={140}
            height={50}
            className="mb-2"
          />
          <p className="text-sm font-medium text-gray-400 mt-2">Painel Administrativo</p>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-0.5">
          {mainNavItems.map(renderNavItem)}
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="space-y-0.5">
            {communicationNavItems.map(renderNavItem)}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="space-y-0.5">
            {systemNavItems.map(renderNavItem)}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="space-y-0.5">
            {renderNavItem({ href: "/admin/configuracoes", icon: Settings, label: "Configurações", permission: "configuracoes" })}
          </div>
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <Button
          onClick={() => {
            pauseSong()
            onLogout()
          }}
          variant="ghost"
          className="w-full justify-start text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  )
}
