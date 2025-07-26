"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import type { AdminUser, Role } from "@/types/admin"
import { formatCPF } from "@/lib/utils"

interface EditAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedAdmin: AdminUser) => Promise<void>
  isSaving: boolean
  admin: AdminUser | null
}

export function EditAdminModal({ isOpen, onClose, onSave, isSaving, admin }: EditAdminModalProps) {
  const [name, setName] = useState(admin?.name || "")
  const [cpf, setCpf] = useState(admin?.cpf || "")
  const [email, setEmail] = useState(admin?.email || "")
  const [newPassword, setNewPassword] = useState("")
  const [role, setRole] = useState<Role>(admin?.role || "Suporte")

  useEffect(() => {
    if (admin) {
      setName(admin.name)
      setCpf(admin.cpf)
      setEmail(admin.email)
      setRole(admin.role)
      setNewPassword("") // Clear password field on admin change
    }
  }, [admin])

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCpf = formatCPF(e.target.value)
    setCpf(formattedCpf)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin) return

    const updatedAdmin: AdminUser = {
      ...admin,
      name,
      cpf,
      email,
      role,
      // Password update would be handled securely on backend,
      // typically by sending newPassword only if it's not empty.
    }
    await onSave(updatedAdmin)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90%] w-[600px] bg-[#1A2430] text-white border-[#9FFF00]/10">
        <DialogHeader>
          <DialogTitle>Editar Administrador</DialogTitle>
        </DialogHeader>
        {admin && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-white">
                Nome
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cpf" className="text-white">
                CPF
              </Label>
              <Input
                id="edit-cpf"
                value={cpf}
                onChange={handleCpfChange}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
                maxLength={14}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-white">
                E-mail
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-white">
                Nova Senha (opcional)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
                placeholder="Deixe em branco para não alterar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-white">
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
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
