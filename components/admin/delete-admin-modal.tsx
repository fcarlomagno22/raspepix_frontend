"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { AdminUser } from "@/types/admin"

interface DeleteAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (adminId: string) => Promise<void>
  isDeleting: boolean
  admin: AdminUser | null
}

export function DeleteAdminModal({ isOpen, onClose, onConfirm, isDeleting, admin }: DeleteAdminModalProps) {
  const handleDelete = async () => {
    if (admin) {
      await onConfirm(admin.id)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90%] w-[500px] bg-[#1A2430] text-white border-[#9FFF00]/10">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-300">
            Tem certeza que deseja excluir o administrador{" "}
            <span className="font-semibold text-white">{admin?.name}</span>?
          </p>
          <p className="text-red-400 mt-2">Esta ação não poderá ser desfeita.</p>
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
          <Button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                Excluindo...
              </>
            ) : (
              "Excluir Permanentemente"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
