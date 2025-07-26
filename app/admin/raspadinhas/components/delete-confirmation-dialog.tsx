"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  scratchCardName: string
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  scratchCardName,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#1A2430] text-white border-[#9FFF00]/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Excluir Raspadinha</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a raspadinha &quot;{scratchCardName}&quot;? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" className="border-[#366D51] text-white hover:bg-[#232A34] hover:text-white">
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white">
              Continuar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
