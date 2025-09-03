"use client"

import { useAdminPermissions } from "@/hooks/use-admin-permissions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermission: string
  fallback?: React.ReactNode
}

export function PermissionGuard({ 
  children, 
  requiredPermission, 
  fallback 
}: PermissionGuardProps) {
  const { hasPermission, loading } = useAdminPermissions()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !hasPermission(requiredPermission)) {
      // Se não tem permissão, redireciona para dashboard
      router.push('/admin/dashboard')
    }
  }, [hasPermission, requiredPermission, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#9FFF00]"></div>
      </div>
    )
  }

  if (!hasPermission(requiredPermission)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}




