"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

// Tipos para os dados (repetidos aqui para clareza, mas idealmente viriam de um arquivo de tipos compartilhado)
type Edition = {
  id: string
  name: string
  period: string
  current?: boolean
}

type Campaign = {
  id: string
  influencerName: string
  cpfCnpj: string
  edition: string
  scratchCard: string
  commissionPercentage: number
  fixedValue: number
  status: "Ativo" | "Inativo"
  observations?: string
}

// Dados mockados (repetidos aqui para clareza, mas idealmente viriam de um arquivo de dados compartilhado)
const mockEditions: Edition[] = [
  { id: "1", name: "Edição #1", period: "01/01/2024 - 07/01/2024" },
  { id: "2", name: "Edição #2", period: "08/01/2024 - 14/01/2024" },
  { id: "3", name: "Edição #3", period: "15/01/2024 - 21/01/2024" },
  { id: "4", name: "Edição #4", period: "22/01/2024 - 28/01/2024" },
  { id: "5", name: "Edição #5", period: "29/01/2024 - 04/02/2024", current: true },
]

interface CampaignDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedCampaign: Campaign | null
  onSave: (campaign: Campaign) => void
}

export function CampaignDrawer({ isOpen, onClose, selectedCampaign, onSave }: CampaignDrawerProps) {
  const [newCampaignData, setNewCampaignData] = useState<Partial<Campaign & { observations: string }>>({
    influencerName: "",
    cpfCnpj: "",
    commissionPercentage: 0,
    fixedValue: 0,
    edition: "",
    scratchCard: "",
    observations: "",
    status: "Ativo",
  })

  useEffect(() => {
    if (selectedCampaign) {
      setNewCampaignData({
        ...selectedCampaign,
        observations: selectedCampaign.observations || "", // Ensure observations is not undefined
      })
    } else {
      // Reset form for new campaign
      setNewCampaignData({
        influencerName: "",
        cpfCnpj: "",
        commissionPercentage: 0,
        fixedValue: 0,
        edition: "",
        scratchCard: "",
        observations: "",
        status: "Ativo",
      })
    }
  }, [selectedCampaign, isOpen]) // Reset when drawer opens or selectedCampaign changes

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target
    setNewCampaignData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }, [])

  const handleSelectChange = useCallback((id: string, value: string) => {
    setNewCampaignData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }, [])

  const handleSwitchChange = useCallback((checked: boolean) => {
    setNewCampaignData((prev) => ({
      ...prev,
      status: checked ? "Ativo" : "Inativo",
    }))
  }, [])

  const handleSave = useCallback(() => {
    if (
      !newCampaignData.influencerName ||
      !newCampaignData.cpfCnpj ||
      !newCampaignData.edition ||
      !newCampaignData.scratchCard
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    const campaignToSave: Campaign = {
      id: selectedCampaign?.id || `c${Date.now()}`, // Generate new ID if creating
      influencerName: newCampaignData.influencerName,
      cpfCnpj: newCampaignData.cpfCnpj,
      edition: newCampaignData.edition,
      scratchCard: newCampaignData.scratchCard,
      commissionPercentage: newCampaignData.commissionPercentage || 0,
      fixedValue: newCampaignData.fixedValue || 0,
      status: newCampaignData.status || "Ativo",
      observations: newCampaignData.observations,
    }
    onSave(campaignToSave)
    onClose()
  }, [newCampaignData, onSave, onClose, selectedCampaign])

  return (
    <SheetContent
      side="right"
      className="w-[420px] max-sm:w-full bg-[#232A34] border-l border-[#366D51] p-6 overflow-y-auto"
    >
      <SheetHeader>
        <SheetTitle className="text-white text-xl font-semibold mb-4">
          {selectedCampaign ? "Editar Campanha" : "Nova Campanha com Influencer"}
        </SheetTitle>
        <SheetDescription className="sr-only">
          {selectedCampaign ? "Edite os detalhes da campanha." : "Crie uma nova campanha de influencer."}
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        {/* Nome do Influencer */}
        <div className="space-y-2">
          <Label htmlFor="influencerName" className="text-gray-300">
            Nome do Influencer
          </Label>
          <Input
            id="influencerName"
            placeholder="Ex: João da Silva"
            className="bg-[#191F26] border-[#366D51] text-white"
            value={newCampaignData.influencerName || ""}
            onChange={handleChange}
          />
        </div>

        {/* CPF ou CNPJ */}
        <div className="space-y-2">
          <Label htmlFor="cpfCnpj" className="text-gray-300">
            CPF ou CNPJ
          </Label>
          <Input
            id="cpfCnpj"
            placeholder="Digite o CPF ou CNPJ"
            className="bg-[#191F26] border-[#366D51] text-white"
            value={newCampaignData.cpfCnpj || ""}
            onChange={handleChange}
          />
        </div>

        {/* % Comissão sobre depósitos */}
        <div className="space-y-2">
          <Label htmlFor="commissionPercentage" className="text-gray-300">
            % Comissão sobre depósitos
          </Label>
          <div className="relative">
            <Input
              id="commissionPercentage"
              type="number"
              placeholder="Ex: 10"
              className="bg-[#191F26] border-[#366D51] text-white pr-8"
              value={newCampaignData.commissionPercentage || 0}
              onChange={handleChange}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </div>

        {/* Valor Fixo combinado */}
        <div className="space-y-2">
          <Label htmlFor="fixedValue" className="text-gray-300">
            Valor Fixo combinado
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
            <Input
              id="fixedValue"
              type="number"
              placeholder="Ex: 1000"
              className="bg-[#191F26] border-[#366D51] text-white pl-10"
              value={newCampaignData.fixedValue || 0}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Edição vinculada */}
        <div className="space-y-2">
          <Label htmlFor="edition" className="text-gray-300">
            Edição vinculada
          </Label>
          <Select value={newCampaignData.edition || ""} onValueChange={(value) => handleSelectChange("edition", value)}>
            <SelectTrigger id="edition" className="bg-[#191F26] border-[#366D51] text-white">
              <SelectValue placeholder="Selecione a Edição" />
            </SelectTrigger>
            <SelectContent className="bg-[#191F26] border-[#366D51] text-white">
              {mockEditions.map((edition) => (
                <SelectItem key={edition.id} value={edition.name}>
                  {edition.name} {edition.current && "(Atual)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scratch Card exclusivo */}
        <div className="space-y-2">
          <Label htmlFor="scratchCard" className="text-gray-300">
            Scratch Card exclusivo
          </Label>
          <Input
            id="scratchCard"
            placeholder="Nome ou ID da raspadinha"
            className="bg-[#191F26] border-[#366D51] text-white"
            value={newCampaignData.scratchCard || ""}
            onChange={handleChange}
          />
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observations" className="text-gray-300">
            Observações
          </Label>
          <Textarea
            id="observations"
            placeholder="Algum detalhe adicional ou condição especial"
            className="bg-[#191F26] border-[#366D51] text-white min-h-[80px]"
            value={newCampaignData.observations || ""}
            onChange={handleChange}
          />
        </div>

        {/* Ativar campanha ao salvar? */}
        <div className="flex items-center justify-between space-x-2 pt-2">
          <Label htmlFor="status" className="text-gray-300">
            Ativar campanha ao salvar?
          </Label>
          <Switch
            id="status"
            checked={newCampaignData.status === "Ativo"}
            onCheckedChange={handleSwitchChange}
            className="data-[state=checked]:bg-[#9FFF00] data-[state=unchecked]:bg-gray-600"
          />
        </div>
      </div>
      <SheetFooter className="flex flex-row justify-end gap-4 mt-6">
        <Button variant="ghost" className="text-gray-400 hover:underline" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="bg-[#9FFF00] text-black hover:bg-lime-400" onClick={handleSave}>
          Salvar
        </Button>
      </SheetFooter>
    </SheetContent>
  )
}
