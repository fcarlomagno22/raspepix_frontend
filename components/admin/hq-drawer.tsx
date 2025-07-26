"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ImageIcon, FileText, UploadCloud, X } from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

// Define a type for HQ data
interface HQ {
  id: string
  title: string
  description?: string
  cover_image_url: string
  pdf_url: string
  upload_date: string
  is_visible_in_app: boolean
  sent_by_email: boolean
}

interface HQDrawerProps {
  isOpen: boolean
  onClose: () => void
  hq?: HQ | null // Optional: for editing an existing HQ
  onSave: (hq: HQ) => void
}

export default function HQDrawer({ isOpen, onClose, hq, onSave }: HQDrawerProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string | null>(null)
  const [isVisibleInApp, setIsVisibleInApp] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (hq) {
      setTitle(hq.title)
      setDescription(hq.description || "")
      setCoverImageUrl(hq.cover_image_url)
      // For existing HQs, we don't have the original File object, so we just show the URL
      setCoverImageFile(null)
      setPdfFileName(hq.pdf_url.split("/").pop() || null) // Extract filename from URL
      setPdfFile(null) // Same for PDF
      setIsVisibleInApp(hq.is_visible_in_app)
    } else {
      // Reset form for new HQ
      setTitle("")
      setDescription("")
      setCoverImageFile(null)
      setCoverImageUrl(null)
      setPdfFile(null)
      setPdfFileName(null)
      setIsVisibleInApp(true)
    }
  }, [hq, isOpen]) // Reset when drawer opens or hq changes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "pdf") => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === "cover") {
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Erro de Upload",
            description: "Por favor, selecione um arquivo de imagem para a capa.",
            variant: "destructive",
          })
          return
        }
        setCoverImageFile(file)
        setCoverImageUrl(URL.createObjectURL(file))
      } else {
        if (file.type !== "application/pdf") {
          toast({
            title: "Erro de Upload",
            description: "Por favor, selecione um arquivo PDF.",
            variant: "destructive",
          })
          return
        }
        setPdfFile(file)
        setPdfFileName(file.name)
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: "cover" | "pdf") => {
    e.preventDefault()
    e.currentTarget.classList.remove("border-[#9FFF00]") // Remove hover effect
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (type === "cover") {
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Erro de Upload",
            description: "Por favor, selecione um arquivo de imagem para a capa.",
            variant: "destructive",
          })
          return
        }
        setCoverImageFile(file)
        setCoverImageUrl(URL.createObjectURL(file))
      } else {
        if (file.type !== "application/pdf") {
          toast({
            title: "Erro de Upload",
            description: "Por favor, selecione um arquivo PDF.",
            variant: "destructive",
          })
          return
        }
        setPdfFile(file)
        setPdfFileName(file.name)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add("border-[#9FFF00]") // Add hover effect
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("border-[#9FFF00]") // Remove hover effect
  }

  const removeFile = (type: "cover" | "pdf") => {
    if (type === "cover") {
      setCoverImageFile(null)
      setCoverImageUrl(null)
      if (coverInputRef.current) coverInputRef.current.value = ""
    } else {
      setPdfFile(null)
      setPdfFileName(null)
      if (pdfInputRef.current) pdfInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!title || (!coverImageFile && !coverImageUrl) || (!pdfFile && !pdfFileName)) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios (Título, Capa, PDF).",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newOrUpdatedHQ: HQ = {
      id: hq?.id || `hq-${Date.now()}`, // Generate new ID if not editing
      title,
      description: description || undefined,
      cover_image_url: coverImageUrl || "/placeholder.svg", // Use current URL or placeholder
      pdf_url: pdfFileName ? `/pdfs/${pdfFileName}` : "/placeholder.pdf", // Use current filename or placeholder
      upload_date: hq?.upload_date || new Date().toISOString(), // Keep original date or set new
      is_visible_in_app: isVisibleInApp,
      sent_by_email: hq?.sent_by_email || false, // Keep original status or set false for new
    }

    onSave(newOrUpdatedHQ)
    toast({
      title: hq ? "HQ Atualizada" : "HQ Criada",
      description: `A HQ "${title}" foi ${hq ? "atualizada" : "criada"} com sucesso.`,
      variant: "success",
    })
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full md:w-[40vw] bg-[#191F26] border-l border-[#9FFF00]/10 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-[#9FFF00]">{hq ? "Editar HQ" : "Nova HQ"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-white">
              Título da HQ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ex: A Grande Aventura do Mascote"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#232A34] border border-[#9FFF00]/20 text-white placeholder:text-gray-500"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-white">
              Descrição (Opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Uma breve descrição sobre a história em quadrinhos."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#232A34] border border-[#9FFF00]/20 text-white placeholder:text-gray-500 min-h-[120px]"
            />
          </div>

          {/* Contêiner para Capa e PDF lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="cover-image" className="text-white">
                Capa da HQ <span className="text-red-500">*</span>
              </Label>
              <div
                className="relative w-full h-48 border-2 border-dashed border-[#9FFF00]/30 rounded-lg bg-[#232A34] flex items-center justify-center overflow-hidden cursor-pointer transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "cover")}
                onClick={() => coverInputRef.current?.click()}
              >
                <Input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  ref={coverInputRef}
                  onChange={(e) => handleFileChange(e, "cover")}
                  className="hidden"
                />
                {coverImageUrl ? (
                  <>
                    <Image
                      src={coverImageUrl || "/placeholder.svg"}
                      alt="Preview da Capa"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile("cover")
                      }}
                      className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full"
                      aria-label="Remover capa"
                    >
                      <X size={16} />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    <ImageIcon size={48} />
                    <span className="text-center">Clique ou arraste para adicionar a capa</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pdf-upload" className="text-white">
                Upload do PDF <span className="text-red-500">*</span>
              </Label>
              <div
                className="relative w-full h-48 border-2 border-dashed border-[#9FFF00]/30 rounded-lg bg-[#232A34] flex items-center justify-center overflow-hidden cursor-pointer transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "pdf")}
                onClick={() => pdfInputRef.current?.click()}
              >
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  ref={pdfInputRef}
                  onChange={(e) => handleFileChange(e, "pdf")}
                  className="hidden"
                />
                {pdfFileName ? (
                  <>
                    <div className="flex flex-col items-center text-white">
                      <FileText size={48} />
                      <span className="mt-2 text-center">{pdfFileName}</span>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile("pdf")
                      }}
                      className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full"
                      aria-label="Remover PDF"
                    >
                      <X size={16} />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    <UploadCloud size={48} />
                    <span className="text-center">Clique ou arraste para adicionar o PDF</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Fim do contêiner de Capa e PDF */}

          <div className="flex items-center space-x-2">
            <Switch
              id="visible-in-app"
              checked={isVisibleInApp}
              onCheckedChange={setIsVisibleInApp}
              className="data-[state=checked]:bg-[#9FFF00] data-[state=unchecked]:bg-gray-600"
            />
            <Label htmlFor="visible-in-app" className="text-white">
              Visível no App?
            </Label>
          </div>

          <SheetFooter className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full bg-[#9FFF00] text-black hover:bg-[#7ACC00]">
              {isSubmitting ? "Salvando..." : "Salvar HQ"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
