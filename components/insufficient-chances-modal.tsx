import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import NewTicketModal from "./new-ticket-modal"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface InsufficientChancesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InsufficientChancesModal({
  open,
  onOpenChange,
}: InsufficientChancesModalProps) {
  const router = useRouter()
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false)

  const handleBuyTickets = () => {
    onOpenChange(false)
    setIsNewTicketModalOpen(true)
  }

  const handleModalClose = (value: boolean) => {
    if (!value) {
      router.push("/home")
    }
    onOpenChange(value)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chances Insuficientes</DialogTitle>
            <DialogDescription>
            Você precisa de chances para acessar. Adquira seus títulos e continue aproveitando!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleBuyTickets}>
              Comprar Títulos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSuccess={() => setIsNewTicketModalOpen(false)}
      />
    </>
  )
}
