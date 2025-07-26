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
import { Trash2 } from "lucide-react"

interface DeleteNotificationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
}

export default function DeleteNotificationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
}: DeleteNotificationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#1A2430] text-white border-[#9FFF00]/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-400" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Tem certeza que deseja excluir a notificação <span className="text-white">"{title}"</span>?
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="border-[#9FFF00] text-[#9FFF00] hover:bg-[#9FFF00]/10 bg-transparent"
            onClick={onClose}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 text-white border-0"
            onClick={onConfirm}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 