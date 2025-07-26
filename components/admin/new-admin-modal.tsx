"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import type { AdminUser, PagePermission, Role } from "@/types/admin"
import { formatCPF } from "@/lib/utils"
import { availablePages } from "@/lib/admin-data"

interface NewAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newAdmin: Omit<AdminUser, "id" | "isActive">) => Promise<void>
  isSaving: boolean
}

export function NewAdminModal({ isOpen, onClose, onSave, isSaving }: NewAdminModalProps) {
  const [name, setName] = useState("")
  const [cpf, setCpf] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("Suporte")
  const [permissions, setPermissions] = useState<PagePermission[]>([])

  const resetForm = () => {
    setName("")
    setCpf("")
    setEmail("")
    setPassword("")
    setRole("Suporte")
    setPermissions([])
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCpf = formatCPF(e.target.value)
    setCpf(formattedCpf)
  }

  const handlePermissionChange = (page: PagePermission, checked: boolean) => {
    setPermissions((prev) => (checked ? [...prev, page] : prev.filter((p) => p !== page)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({ name, cpf, email, role, permissions }) // Password would be handled securely on backend
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90%] w-[600px] bg-[#1A2430] text-white border-[#9FFF00]/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Cadastrar Novo Administrador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-white">
              CPF
            </Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={handleCpfChange}
              className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
              maxLength={14}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">
              Função
            </Label>
            <Select value={role} onValueChange={(value: Role) => setRole(value)}>
              <SelectTrigger className="bg-[#232D3F] border-[#9FFF00]/10 text-white">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent className="bg-[#232D3F] border-[#9FFF00]/10 text-white">
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Gestão">Gestão</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
                <SelectItem value="Suporte">Suporte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-white">Permissões de Acesso</Label>
            <div className="bg-[#232D3F] border border-[#9FFF00]/10 rounded-md p-4 grid grid-cols-2 gap-3 overflow-y-auto">
              {availablePages.map((page) => (
                <div key={page.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`perm-${page.value}`}
                    checked={permissions.includes(page.value)}
                    onCheckedChange={(checked) => handlePermissionChange(page.value, checked as boolean)}
                    className="border-[#9FFF00] data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-[#191F26]"
                  />
                  <label
                    htmlFor={`perm-${page.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    {page.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#9FFF00]/30 text-[#9FFF00] hover:bg-[#9FFF00]/10 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26]" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#191F26] mr-2"></div>
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
