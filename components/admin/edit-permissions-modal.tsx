"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import type { AdminUser, PagePermission } from "@/types/admin"
import { availablePages } from "@/lib/admin-data"

interface EditPermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (adminId: string, permissions: PagePermission[]) => Promise<void>
  isSaving: boolean
  admin: AdminUser | null
}

export function EditPermissionsModal({ isOpen, onClose, onSave, isSaving, admin }: EditPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<PagePermission[]>([])

  useEffect(() => {
    if (admin) {
      setSelectedPermissions(admin.permissions)
    }
  }, [admin])

  const handlePermissionChange = (page: PagePermission, checked: boolean) => {
    setSelectedPermissions((prev) => (checked ? [...prev, page] : prev.filter((p) => p !== page)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin) return
    await onSave(admin.id, selectedPermissions)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90%] w-[600px] bg-[#1A2430] text-white border-[#9FFF00]/10">
        <DialogHeader>
          <DialogTitle>Editar Permissões</DialogTitle>
        </DialogHeader>
        {admin && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <p className="text-gray-400">Selecione as páginas que {admin.name} terá acesso:</p>
            <div className="bg-[#232D3F] border border-[#9FFF00]/10 rounded-md p-4 grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {availablePages.map((page) => (
                <div key={page.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`perm-${admin.id}-${page.value}`}
                    checked={selectedPermissions.includes(page.value)}
                    onCheckedChange={(checked) => handlePermissionChange(page.value, checked as boolean)}
                    className="border-[#9FFF00] data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-[#191F26]"
                  />
                  <label
                    htmlFor={`perm-${admin.id}-${page.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    {page.label}
                  </label>
                </div>
              ))}
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
                    Salvando Permissões...
                  </>
                ) : (
                  "Salvar Permissões"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
