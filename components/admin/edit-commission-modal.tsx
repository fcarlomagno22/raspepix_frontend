"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface EditCommissionModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "single" | "bulk" | "global"
  affiliateName?: string // For single mode
  selectedAffiliateCount?: number // For bulk mode
  initialCommissionRate?: number // For single mode
  onSave: (newRate: number) => Promise<void> // Still async, but will resolve locally
}

export function EditCommissionModal({
  isOpen,
  onClose,
  mode,
  affiliateName,
  selectedAffiliateCount,
  initialCommissionRate,
  onSave,
}: EditCommissionModalProps) {
  const [newRate, setNewRate] = useState<string>(initialCommissionRate?.toString() || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setNewRate(initialCommissionRate?.toString() || "")
      setIsLoading(false)
    }
  }, [isOpen, initialCommissionRate])

  const handleSave = async () => {
    const rate = Number.parseFloat(newRate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, insira um percentual de comissão válido entre 0 e 100.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await onSave(rate) // This will now trigger the local state update in the parent
      toast({
        title: "Sucesso!",
        description: "Percentual de comissão atualizado com sucesso.",
        duration: 3000,
      })
      onClose()
    } catch (error) {
      console.error("Failed to save commission:", error)
      toast({
        title: "Erro ao Atualizar",
        description: "Ocorreu um erro ao tentar atualizar o percentual de comissão.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "single":
        return `Alterar Comissão de ${affiliateName}`
      case "bulk":
        return `Alterar Comissão para ${selectedAffiliateCount} Afiliado(s)`
      case "global":
        return "Alterar Comissão Global"
      default:
        return "Alterar Comissão"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "single":
        return `Defina o novo percentual de comissão para ${affiliateName}.`
      case "bulk":
        return `Defina o novo percentual de comissão para os ${selectedAffiliateCount} afiliados selecionados.`
      case "global":
        return "Defina o novo percentual de comissão para TODOS os afiliados ativos."
      default:
        return "Defina o novo percentual de comissão."
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#232D3F] text-white border-[#9FFF00]/10">
        <DialogHeader>
          <DialogTitle className="text-white">{getTitle()}</DialogTitle>
          <DialogDescription className="text-gray-400">{getDescription()}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="commission-rate" className="text-right text-white">
              Novo Percentual (%)
            </Label>
            <Input
              id="commission-rate"
              type="number"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              min="0"
              max="100"
              step="0.01"
              className="col-span-3 bg-[#1A2430] border-[#9FFF00]/10 focus:border-[#9FFF00]/30 text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bg-transparent text-gray-400 border-gray-600 hover:bg-gray-700/20 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
