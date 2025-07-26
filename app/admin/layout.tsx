"use client"

import { useAuth } from "@/hooks/use-auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useAuth(true); // Verifica autenticação de admin em todas as páginas administrativas

  return <>{children}</>
} 