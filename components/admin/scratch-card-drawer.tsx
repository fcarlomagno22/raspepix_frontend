"use client"

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react"
import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, UploadCloud, X } from "lucide-react"
import { NumericFormat } from "react-number-format"

interface ScratchCard {
  id: string
  name: string
  maxPrize: number
  cost: number
  imageUrl: string | null
  isActive: boolean
  createdAt: string
}

interface ScratchCardDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (card: Omit<ScratchCard, "id" | "createdAt">, isNew: boolean) => void
  editingCard?: ScratchCard | null
}

const COIN_IMAGE_URL = "/public/images/coin-icon.png" // Placeholder for the fixed coin image

export default function ScratchCardDrawer({ isOpen, onClose, onSave, editingCard }: ScratchCardDrawerProps) {
  const [name, setName] = useState("")
  const [maxPrize, setMaxPrize] = useState<number | null>(null)
  const [cost, setCost] = useState<number | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingCard) {
      setName(editingCard.name)
      setMaxPrize(editingCard.maxPrize)
      setCost(editingCard.cost)
      setImagePreviewUrl(editingCard.imageUrl)
      setIsActive(editingCard.isActive)
      setImageFile(null) // Clear file input when editing existing card
    } else {
      // Reset form for new scratch card
      setName("")
      setMaxPrize(null)
      setCost(null)
      setImageFile(null)
      setImagePreviewUrl(null)
      setIsActive(true)
    }
  }, [editingCard, isOpen])

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("A imagem deve ter no máximo 5MB.")
        return
      }
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        alert("A imagem deve ser PNG, JPG ou WEBP.")
        return
      }
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreviewUrl(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || maxPrize === null || cost === null || cost <= 0) {
      alert("Por favor, preencha todos os campos obrigatórios e garanta que o custo seja maior que 0.")
      return
    }

    setIsSubmitting(true)

    // In a real application, you would upload the image here
    // For now, we'll just use the existing URL or a placeholder
    const finalImageUrl = imagePreviewUrl

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSave(
      {
        name,
        maxPrize,
        cost,
        imageUrl: finalImageUrl,
        isActive,
      },
      !editingCard,
    )
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-[#191F26] text-white border-l border-[#232A34]">
        <SheetHeader>
          <SheetTitle className="text-white">{editingCard ? "Editar Raspadinha" : "Nova Raspadinha"}</SheetTitle>
          <SheetDescription>
            {editingCard ? "Faça alterações na raspadinha existente." : "Crie uma nova raspadinha para o seu sistema."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="form flex flex-col flex-grow space-y-6 py-6 overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da raspadinha</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-[#0D1117] border-[#3A4452] text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maxPrize">Valor Máximo do Prêmio (R$)</Label>
            <NumericFormat
              id="maxPrize"
              value={maxPrize}
              onValueChange={(values) => setMaxPrize(values.floatValue || null)}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              customInput={Input}
              required
              className="bg-[#0D1117] border-[#3A4452] text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cost">Custo em Fichas</Label>
            <Input
              id="cost"
              type="number"
              value={cost === null ? "" : cost}
              onChange={(e) => setCost(e.target.value === "" ? null : Number.parseInt(e.target.value))}
              min={1}
              required
              className="bg-[#0D1117] border-[#3A4452] text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Imagem da raspadinha</Label>
            <div className="relative">
              <input
                id="image"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#3A4452] rounded-lg cursor-pointer bg-[#232A34] hover:bg-[#2A3340]"
              >
                {imagePreviewUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imagePreviewUrl || "/placeholder.svg"}
                      alt="Image preview"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault()
                        handleRemoveImage()
                      }}
                      className="absolute top-1 right-1 text-white hover:bg-red-500/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG ou WEBP (MAX. 5MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Imagem da moeda (fixa)</Label>
            <div className="flex items-center justify-center w-full h-24 bg-[#232A34] border border-[#3A4452] rounded-lg">
              <Image
                src={COIN_IMAGE_URL || "/placeholder.svg"}
                alt="Coin icon"
                width={64}
                height={64}
                objectFit="contain"
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Raspadinha Ativa</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-[#9FFF00] data-[state=unchecked]:bg-[#3A4452]"
            />
          </div>
        </form>
        <SheetFooter className="flex flex-col sm:flex-row gap-2 mt-auto p-6 border-t border-[#232A34]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-[#366D51] text-white hover:bg-[#232A34] hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black hover:from-[#8AE000] hover:to-[#7AC000]"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingCard ? "Salvar Alterações" : "Criar Raspadinha"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
