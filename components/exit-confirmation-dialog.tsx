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

interface ExitConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmExit: () => void
}

export function ExitConfirmationDialog({ open, onOpenChange, onConfirmExit }: ExitConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1A2430] text-white border-[#9FFF00]/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Sair da Raspadinha?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Você ainda não raspou a cartela. Se sair agora, perderá a chance de ganhar o prêmio. Deseja realmente sair?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmExit} className="bg-red-600 text-white hover:bg-red-700">
            Sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
