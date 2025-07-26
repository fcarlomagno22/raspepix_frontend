"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Search, User, Shield, Edit, X, Check, Trash } from "lucide-react"
import type { AdminUser, Role } from "@/types/admin"
import { formatCPF } from "@/lib/utils"

interface AdminListProps {
  admins: AdminUser[]
  onNewAdmin: () => void
  onEdit: (admin: AdminUser) => void
  onEditPermissions: (admin: AdminUser) => void
  onToggleStatus: (adminId: string, isActive: boolean) => Promise<void>
  onDelete: (admin: AdminUser) => void
  isLoading: boolean
  searchTerm: string
  onSearchTermChange: (term: string) => void
}

const PROTECTED_ADMIN_ID = "admin-1" // Fernando Carlomagno

export function AdminList({
  admins,
  onNewAdmin,
  onEdit,
  onEditPermissions,
  onToggleStatus,
  onDelete,
  isLoading,
  searchTerm,
  onSearchTermChange,
}: AdminListProps) {
  const getRoleColor = (role: Role) => {
    switch (role) {
      case "Administrador":
        return "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
      case "Gestão":
        return "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
      case "Financeiro":
        return "bg-green-600 text-white border-green-600 hover:bg-green-700"
      case "Suporte":
        return "bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700"
      default:
        return "bg-gray-600 text-white border-gray-600 hover:bg-gray-700"
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
      : "bg-red-500 text-white border-red-500 hover:bg-red-600"
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.cpf.includes(searchTerm),
  )

  return (
    <Card className="bg-[#1A2430] border border-[#9FFF00]/10">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-white">Administradores</CardTitle>
          <CardDescription className="text-gray-400">
            Gerencie os usuários administradores e suas permissões de acesso
          </CardDescription>
        </div>
        <Button onClick={onNewAdmin} className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26]">
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Administrador
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#9FFF00]"></div>
          </div>
        ) : (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar administradores..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-10 bg-[#232D3F] border-[#9FFF00]/10 focus:border-[#9FFF00]/30 text-white"
              />
            </div>

            <div className="grid gap-4">
              {filteredAdmins.length === 0 ? (
                <p className="text-center py-8 text-gray-400">
                  {searchTerm
                    ? "Nenhum administrador encontrado com os filtros aplicados."
                    : "Nenhum administrador cadastrado."}
                </p>
              ) : (
                filteredAdmins.map((admin) => {
                  const isProtected = admin.id === PROTECTED_ADMIN_ID
                  return (
                    <div
                      key={admin.id}
                      className="bg-[#232D3F] border border-[#9FFF00]/10 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-[#1A2430] p-2 rounded-full">
                          <User className="h-6 w-6 text-[#9FFF00]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{admin.name}</h3>
                          <p className="text-sm text-gray-400">{admin.email}</p>
                          <p className="text-xs text-gray-500">CPF: {formatCPF(admin.cpf)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={getRoleColor(admin.role)}>
                          {admin.role}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(admin.isActive)}>
                          {admin.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditPermissions(admin)}
                                disabled={isProtected}
                                className="border-[#9FFF00]/30 hover:border-[#9FFF00]/50 hover:bg-[#9FFF00]/10 bg-transparent"
                              >
                                <Shield className="h-4 w-4 text-[#9FFF00]" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#232D3F] text-white border-[#9FFF00]/10">
                              <p>Permissões</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(admin)}
                                disabled={isProtected}
                                className="border-[#9FFF00]/30 hover:border-[#9FFF00]/50 hover:bg-[#9FFF00]/10 bg-transparent"
                              >
                                <Edit className="h-4 w-4 text-[#9FFF00]" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#232D3F] text-white border-[#9FFF00]/10">
                              <p>Editar</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onToggleStatus(admin.id, !admin.isActive)}
                                disabled={isProtected}
                                className={
                                  admin.isActive
                                    ? "border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 bg-transparent text-red-500"
                                    : "border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10 bg-transparent text-green-500"
                                }
                              >
                                {admin.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#232D3F] text-white border-[#9FFF00]/10">
                              <p>{admin.isActive ? "Desativar" : "Ativar"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(admin)}
                                disabled={isProtected}
                                className="border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 bg-transparent"
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#232D3F] text-white border-[#9FFF00]/10">
                              <p>Excluir</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
