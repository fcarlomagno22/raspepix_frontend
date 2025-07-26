"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus, Eye, Edit, Trash2, Mail } from "lucide-react"

import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import HQDrawer from "@/components/admin/hq-drawer"

// Mock Data for HQs
const mockHQsData = [
  {
    id: "hq1",
    title: "Aventura na Floresta Encantada",
    cover_image_url: "/placeholder.svg?height=70&width=40",
    pdf_url: "/placeholder.pdf",
    upload_date: "2024-05-10T10:00:00Z",
    is_visible_in_app: true,
    sent_by_email: false,
  },
  {
    id: "hq2",
    title: "O Mistério do Tesouro Perdido",
    cover_image_url: "/placeholder.svg?height=70&width=40",
    pdf_url: "/placeholder.pdf",
    upload_date: "2024-05-12T14:30:00Z",
    is_visible_in_app: true,
    sent_by_email: true,
  },
  {
    id: "hq3",
    title: "A Lenda do Dragão Adormecido",
    cover_image_url: "/placeholder.svg?height=70&width=40",
    pdf_url: "/placeholder.pdf",
    upload_date: "2024-05-15T09:15:00Z",
    is_visible_in_app: false,
    sent_by_email: false,
  },
  {
    id: "hq4",
    title: "Viagem ao Centro da Terra",
    cover_image_url: "/placeholder.svg?height=70&width=40",
    pdf_url: "/placeholder.pdf",
    upload_date: "2024-05-18T11:00:00Z",
    is_visible_in_app: true,
    sent_by_email: false,
  },
  {
    id: "hq5",
    title: "O Ataque dos Robôs Gigantes",
    cover_image_url: "/placeholder.svg?height=70&width=40",
    pdf_url: "/placeholder.pdf",
    upload_date: "2024-05-20T16:45:00Z",
    is_visible_in_app: true,
    sent_by_email: true,
  },
  {
    id: "hq6",
    title: "A Cidade Submersa",
    cover_image_url: "/placeholder.svg?height=70&width=40",
    pdf_url: "/placeholder.pdf",
    upload_date: "2024-05-22T08:00:00Z",
    is_visible_in_app: false,
    sent_by_email: false,
  },
  {
    id: "hq7",
    title: "Os Guardiões do Tempo",
    cover_image_url: "/placeholder.svg?height=70&width=40",
    pdf_url: "/placeholder.pdf",
    upload_date: "2024-05-25T13:00:00Z",
    is_visible_in_app: true,
    sent_by_email: false,
  },
  {
    id: "hq8",
    title: "A Maldição da Pirâmide",
    cover_image_url: "/placeholder.svg?height=70&width=40",
    pdf_url: "/placeholder.pdf",
    upload_date: "2024-05-28T10:00:00Z",
    is_visible_in_app: true,
    sent_by_email: true,
  },
  {
    id: "hq9",
    title: "O Segredo da Ilha Flutuante",
    cover_image_url: "/placeholder.svg?height=70&width=40",
    pdf_url: "/placeholder.pdf",
    upload_date: "2024-05-30T15:00:00Z",
    is_visible_in_app: false,
    sent_by_email: false,
  },
  {
    id: "hq10",
    title: "A Batalha dos Elementos",
    cover_image_url: "/placeholder.svg?height=70&width=40",
    pdf_url: "/placeholder.pdf",
    upload_date: "2024-06-01T12:00:00Z",
    is_visible_in_app: true,
    sent_by_email: false,
  },
]

export default function AdminHqPage() {
  const { toast } = useToast()
  const [hqs, setHqs] = useState(mockHQsData)
  const [isLoading, setIsLoading] = useState(false)

  // State for Drawer/Dialogs (placeholders for now)
  const [isHQDrawerOpen, setIsHQDrawerOpen] = useState(false)
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [selectedHQ, setSelectedHQ] = useState<(typeof mockHQsData)[0] | null>(null)
  const [dialogType, setDialogType] = useState<"delete" | "sendEmail" | null>(null)

  // Simulate data loading
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setHqs(mockHQsData)
      setIsLoading(false)
    }, 500) // Simulate network delay
    return () => clearTimeout(timer)
  }, [])

  const handleNewHQ = () => {
    setSelectedHQ(null)
    setIsHQDrawerOpen(true)
    toast({
      title: "Nova HQ",
      description: "Abrindo formulário para nova HQ.",
    })
  }

  const handleViewPDF = (hq: (typeof mockHQsData)[0]) => {
    setSelectedHQ(hq)
    setIsPDFViewerOpen(true)
    toast({
      title: "Visualizar PDF",
      description: `Visualizando PDF de "${hq.title}".`,
    })
    // In a real app, you'd open a modal with a PDF viewer or redirect
    window.open(hq.pdf_url, "_blank")
  }

  const handleEditHQ = (hq: (typeof mockHQsData)[0]) => {
    setSelectedHQ(hq)
    setIsHQDrawerOpen(true)
    toast({
      title: "Editar HQ",
      description: `Abrindo formulário para editar "${hq.title}".`,
    })
  }

  const handleDeleteHQ = (hq: (typeof mockHQsData)[0]) => {
    setSelectedHQ(hq)
    setDialogType("delete")
    setIsAlertDialogOpen(true)
    toast({
      title: "Excluir HQ",
      description: `Confirmar exclusão de "${hq.title}".`,
    })
  }

  const handleConfirmDelete = () => {
    if (selectedHQ) {
      setHqs(hqs.filter((hq) => hq.id !== selectedHQ.id))
      toast({
        title: "HQ Excluída",
        description: `A HQ "${selectedHQ.title}" foi excluída com sucesso.`,
        variant: "success",
      })
    }
    setIsAlertDialogOpen(false)
    setSelectedHQ(null)
    setDialogType(null)
  }

  const handleSendEmail = (hq: (typeof mockHQsData)[0]) => {
    setSelectedHQ(hq)
    setDialogType("sendEmail")
    setIsAlertDialogOpen(true)
    toast({
      title: "Enviar por E-mail",
      description: `Confirmar envio de "${hq.title}" por e-mail.`,
    })
  }

  const handleConfirmSendEmail = () => {
    if (selectedHQ) {
      setHqs(hqs.map((hq) => (hq.id === selectedHQ.id ? { ...hq, sent_by_email: true } : hq)))
      toast({
        title: "E-mail Enviado",
        description: `A HQ "${selectedHQ.title}" foi enviada por e-mail com sucesso.`,
        variant: "success",
      })
    }
    setIsAlertDialogOpen(false)
    setSelectedHQ(null)
    setDialogType(null)
  }

  const handleSaveHQ = (savedHQ: (typeof mockHQsData)[0]) => {
    if (hqs.some((hq) => hq.id === savedHQ.id)) {
      // Update existing HQ
      setHqs(hqs.map((hq) => (hq.id === savedHQ.id ? savedHQ : hq)))
    } else {
      // Add new HQ
      setHqs([...hqs, savedHQ])
    }
    setIsHQDrawerOpen(false)
    setSelectedHQ(null)
  }

  // Placeholder for session time and logout (from existing admin layout)
  const sessionTimeRemaining = "23:59"
  const handleLogout = () => {
    toast({
      title: "Logout",
      description: "Você foi desconectado.",
    })
  }

  return (
    <div className="flex min-h-screen bg-[#191F26] text-white">
      <AdminSidebar sessionTimeRemaining={sessionTimeRemaining} onLogout={handleLogout} />
      <div className="flex flex-1 flex-col md:ml-64">
        {" "}
        {/* Adicionado md:ml-64 aqui */}
        <AdminHeaderMobile /> {/* Mobile header for responsiveness */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">HQs do Dom Ripo</h1>
            <Button
              onClick={handleNewHQ}
              className="bg-[#9FFF00] text-black hover:bg-[#7ACC00] transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Nova HQ
            </Button>
          </div>

          <div className="rounded-md border border-[#366D51] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#1A2430]">
                <TableRow className="border-b border-[#366D51]">
                  <TableHead className="text-gray-300 text-center">Capa</TableHead>
                  <TableHead className="text-gray-300 text-center">Título da HQ</TableHead>
                  <TableHead className="text-gray-300 text-center">Data de Upload</TableHead>
                  <TableHead className="text-gray-300 text-center">Visível no App?</TableHead>
                  <TableHead className="text-gray-300 text-center">Enviado por E-mail?</TableHead>
                  <TableHead className="text-gray-300 text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-[#232A34] divide-y divide-[#366D51]">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                      Carregando HQs...
                    </TableCell>
                  </TableRow>
                ) : hqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                      Nenhuma HQ encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  hqs.map((hq) => (
                    <TableRow key={hq.id} className="border-b border-[#366D51] hover:bg-[#2A333F]">
                      <TableCell className="py-2">
                        <Image
                          src={hq.cover_image_url || "/placeholder.svg"}
                          alt={`Capa da HQ ${hq.title}`}
                          width={40}
                          height={70}
                          className="object-cover mx-auto rounded-sm"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-white text-center">{hq.title}</TableCell>
                      <TableCell className="text-gray-300 text-center">
                        {format(parseISO(hq.upload_date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            hq.is_visible_in_app ? "bg-[#9FFF00]/20 text-[#9FFF00]" : "bg-gray-600/20 text-gray-400"
                          }
                        >
                          {hq.is_visible_in_app ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={hq.sent_by_email ? "bg-blue-600/20 text-blue-400" : "bg-gray-600/20 text-gray-400"}
                        >
                          {hq.sent_by_email ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center justify-center space-x-2 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewPDF(hq)}
                          className="text-gray-400 hover:text-[#9FFF00] hover:bg-[#9FFF00]/10"
                          aria-label={`Visualizar PDF de ${hq.title}`}
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditHQ(hq)}
                          className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                          aria-label={`Editar HQ ${hq.title}`}
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteHQ(hq)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                          aria-label={`Excluir HQ ${hq.title}`}
                        >
                          <Trash2 size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSendEmail(hq)}
                          disabled={hq.sent_by_email}
                          className="text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Enviar HQ ${hq.title} por e-mail`}
                        >
                          <Mail size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* HQDrawer Component */}
          <HQDrawer
            isOpen={isHQDrawerOpen}
            onClose={() => setIsHQDrawerOpen(false)}
            hq={selectedHQ}
            onSave={handleSaveHQ}
          />

          {/* Placeholder for PDFViewerDialog */}
          {isPDFViewerOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-[#232A34] p-8 rounded-lg shadow-lg text-white">
                <h2 className="text-xl font-bold mb-4">Visualizar PDF</h2>
                <p>Visualizador de PDF (será implementado no Dialog)</p>
                <Button onClick={() => setIsPDFViewerOpen(false)} className="mt-4">
                  Fechar
                </Button>
              </div>
            </div>
          )}

          {/* Placeholder for AlertDialog */}
          {isAlertDialogOpen && selectedHQ && dialogType && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-[#232A34] p-8 rounded-lg shadow-lg text-white">
                <h2 className="text-xl font-bold mb-4">
                  {dialogType === "delete" ? "Confirmar Exclusão" : "Confirmar Envio de E-mail"}
                </h2>
                <p>
                  {dialogType === "delete"
                    ? `Tem certeza que deseja excluir a HQ "${selectedHQ.title}"?`
                    : `Tem certeza que deseja enviar a HQ "${selectedHQ.title}" por e-mail?`}
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsAlertDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={dialogType === "delete" ? handleConfirmDelete : handleConfirmSendEmail}
                    className={
                      dialogType === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                    }
                  >
                    {dialogType === "delete" ? "Excluir" : "Enviar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
