import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export interface AdminPermissions {
  permissoes_pagina: string[]
  funcao: string
}

export function useAdminPermissions() {
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPermissions = () => {
      try {
        const adminData = Cookies.get('admin_data')
        if (adminData) {
          const parsedData = JSON.parse(adminData)
          setPermissions({
            permissoes_pagina: parsedData.permissoes_pagina || [],
            funcao: parsedData.funcao || ''
          })
        }
      } catch (error) {
        console.error('Erro ao carregar permissões:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPermissions()
  }, [])

  const hasPermission = (page: string): boolean => {
    if (!permissions) return false
    
    // Verificar se é um array válido
    if (!Array.isArray(permissions.permissoes_pagina)) {
      return false
    }
    
    // Se tem "*", tem acesso a todas as páginas
    if (permissions.permissoes_pagina.includes("*")) {
      return true
    }
    
    return permissions.permissoes_pagina.includes(page)
  }

  const hasAnyPermission = (pages: string[]): boolean => {
    if (!permissions) return false
    // Se tem "*", tem acesso a todas as páginas
    if (permissions.permissoes_pagina.includes("*")) return true
    return pages.some(page => permissions.permissoes_pagina.includes(page))
  }

  const isAdmin = (): boolean => {
    return permissions?.funcao === 'Administrador'
  }

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    isAdmin
  }
}
