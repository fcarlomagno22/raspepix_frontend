"use client"

import { useState } from "react"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import DeleteConfirmationDialog from "@/app/admin/raspadinhas/components/delete-confirmation-dialog"

interface ScratchCard {
  id: string
  name: string
  maxPrize: number
  cost: number
  imageUrl: string | null
  isActive: boolean
  createdAt: string
}

interface ScratchCardsTableProps {
  scratchCards: ScratchCard[]
  onEdit: (card: ScratchCard) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
}

export default function ScratchCardsTable({ scratchCards, onEdit, onDelete, onToggleStatus }: ScratchCardsTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<ScratchCard | null>(null)

  const handleDeleteClick = (card: ScratchCard) => {
    setCardToDelete(card)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (cardToDelete) {
      onDelete(cardToDelete.id)
      setIsDeleteDialogOpen(false)
      setCardToDelete(null)
    }
  }

  return (
    <div className="rounded-md border border-[#232A34] overflow-hidden">
      <Table className="min-w-full">
        <TableHeader className="bg-[#232A34]">
          <TableRow className="border-b border-[#232A34]">
            <TableHead className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Imagem
            </TableHead>
            <TableHead className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Nome
            </TableHead>
            <TableHead className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Prêmio Máx. (R$)
            </TableHead>
            <TableHead className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Custo em Fichas
            </TableHead>
            <TableHead className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-[#191F26] divide-y divide-[#232A34]">
          {scratchCards.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhuma raspadinha encontrada.
              </TableCell>
            </TableRow>
          ) : (
            scratchCards.map((card) => (
              <TableRow key={card.id} className="hover:bg-[#232A34]">
                <TableCell className="py-4 px-6">
                  <div className="flex justify-center">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl || "/placeholder.svg"}
                        alt={card.name}
                        width={60} // Adjusted width
                        height={80} // Adjusted height for more vertical aspect
                        className="rounded-md object-contain" // Use object-contain to prevent cropping
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#3A4452] rounded-md flex items-center justify-center text-gray-400 text-xs">
                        Sem Imagem
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 text-sm font-medium text-white text-center">{card.name}</TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-300 text-center">
                  {formatCurrency(card.maxPrize)}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-300 text-center">{card.cost}</TableCell>
                <TableCell className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={card.isActive}
                      onCheckedChange={(checked) => onToggleStatus(card.id, checked)}
                      className="data-[state=checked]:bg-[#9FFF00] data-[state=unchecked]:bg-[#3A4452]"
                    />
                    <span className="text-sm text-gray-300">{card.isActive ? "Ativa" : "Inativa"}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(card)}
                      className="text-gray-400 hover:text-[#9FFF00] hover:bg-transparent"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(card)}
                      className="text-gray-400 hover:text-red-500 hover:bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {cardToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          scratchCardName={cardToDelete.name}
        />
      )}
    </div>
  )
}
