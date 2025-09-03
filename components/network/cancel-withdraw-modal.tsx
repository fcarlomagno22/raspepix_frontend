"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface CancelWithdrawModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  amount?: number
}

export function CancelWithdrawModal({ open, onClose, onConfirm, amount }: CancelWithdrawModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#232A34] border-[#366D51] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Confirmar Cancelamento
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-center text-gray-300">
            Você tem certeza que deseja cancelar sua solicitação de saque
            {amount && ` no valor de ${formatCurrency(amount)}`}?
          </p>
          <p className="text-center text-gray-300 mt-2">
            Esta ação não poderá ser desfeita.
          </p>
        </div>
        <DialogFooter className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#366D51] text-white hover:bg-[#366D51]/20"
          >
            Voltar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
