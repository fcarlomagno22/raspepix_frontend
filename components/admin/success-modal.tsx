"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export function SuccessModal({ isOpen, onClose, message }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90%] w-[500px] bg-[#1A2430] text-white border-[#9FFF00]/10">
        <DialogHeader className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-10 w-10 text-green-600 mb-4" />
          <DialogTitle className="text-2xl font-bold text-white">Sucesso!</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center text-gray-300">
          <p>{message}</p>
        </div>
        <DialogFooter className="flex justify-center">
          <Button type="button" onClick={onClose} className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26]">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
