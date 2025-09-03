"use client"

import type React from "react"

import { useState, useMemo, useEffect, useRef } from "react" // Adicionado useEffect e useRef
import { useRouter } from "next/navigation" // Adicionado useRouter
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Archive,
  RefreshCw,
  Send,
  Download,
  FileCheck,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Importar componentes do admin
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"

// --- Tipos TypeScript para Dados Mockados ---
interface IntegrationFile {
  id: string
  type: "titulos_vendidos" | "premiacao_instantanea"
  filename: string
  version: string
  status: "pending" | "generated" | "sent" | "error"
  createdAt: string
  sentAt?: string
  size?: string
  downloadUrl?: string
}

interface UploadedReceipt {
  id: string
  filename: string
  uploadedAt: string
  fileId: string
  size: string
  downloadUrl: string
}

interface ApiHistoryEntry {
  id: string
  filename: string
  attempt: number
  timestamp: string
  status: "success" | "error"
  httpCode: number
  response: string
  responseTime: string
}

// --- Dados Mockados ---
const mockFiles: IntegrationFile[] = [
  {
    id: "1",
    type: "titulos_vendidos",
    filename: "titulos_vendidos_20241215_v1.txt",
    version: "v1.0",
    status: "sent",
    createdAt: "2024-12-15T10:30:00Z",
    sentAt: "2024-12-15T11:00:00Z",
    size: "2.5 MB",
    downloadUrl: "#",
  },
  {
    id: "2",
    type: "premiacao_instantanea",
    filename: "premiacao_instantanea_20241215_v1.zip",
    version: "v1.0",
    status: "generated",
    createdAt: "2024-12-15T09:15:00Z",
    size: "1.8 MB",
    downloadUrl: "#",
  },
  {
    id: "3",
    type: "titulos_vendidos",
    filename: "titulos_vendidos_20241214_v2.txt",
    version: "v2.0",
    status: "error",
    createdAt: "2024-12-14T16:45:00Z",
    size: "3.1 MB",
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: (i + 4).toString(),
    type: i % 2 === 0 ? "titulos_vendidos" : ("premiacao_instantanea" as "titulos_vendidos" | "premiacao_instantanea"),
    filename: `${i % 2 === 0 ? "titulos_vendidos" : "premiacao_instantanea"}_2024121${i % 10}_v1.${i % 2 === 0 ? "txt" : "zip"}`,
    version: "v1.0",
    status: ["pending", "generated", "sent", "error"][i % 4] as "pending" | "generated" | "sent" | "error",
    createdAt: new Date(2024, 11, 10 + (i % 5), 10 + i, 30).toISOString(),
    sentAt: i % 3 === 0 ? new Date(2024, 11, 10 + (i % 5), 11 + i, 0).toISOString() : undefined,
    size: `${(1.5 + i * 0.2).toFixed(1)} MB`,
  })),
]

const mockReceipts: UploadedReceipt[] = [
  {
    id: "1",
    filename: "comprovante_remessa_20241215.pdf",
    uploadedAt: "2024-12-15T12:00:00Z",
    fileId: "1",
    size: "245 KB",
    downloadUrl: "#",
  },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: (i + 2).toString(),
    filename: `comprovante_remessa_2024121${i % 10}.pdf`,
    uploadedAt: new Date(2024, 11, 10 + (i % 5), 12 + i, 0).toISOString(),
    fileId: (i + 1).toString(),
    size: `${200 + i * 15} KB`,
    downloadUrl: "#",
  })),
]

const mockApiHistory: ApiHistoryEntry[] = [
  {
    id: "1",
    filename: "titulos_vendidos_20241215_v1.txt",
    attempt: 1,
    timestamp: "2024-12-15T10:35:12Z",
    status: "success",
    httpCode: 200,
    response: "Arquivo recebido e processado com sucesso",
    responseTime: "1.2s",
  },
  {
    id: "2",
    filename: "premiacao_instantanea_20241214_v1.zip",
    attempt: 1,
    timestamp: "2024-12-14T14:25:45Z",
    status: "success",
    httpCode: 200,
    response: "Arquivo recebido e processado com sucesso",
    responseTime: "2.1s",
  },
  {
    id: "3",
    filename: "titulos_vendidos_20241214_v2.txt",
    attempt: 3,
    timestamp: "2024-12-14T16:47:33Z",
    status: "error",
    httpCode: 500,
    response: "Erro interno do servidor - Timeout na validação",
    responseTime: "30.0s",
  },
  {
    id: "4",
    filename: "titulos_vendidos_20241214_v2.txt",
    attempt: 2,
    timestamp: "2024-12-14T16:46:15Z",
    status: "error",
    httpCode: 422,
    response: "Formato de arquivo inválido - Campo obrigatório ausente",
    responseTime: "0.8s",
  },
  {
    id: "5",
    filename: "titulos_vendidos_20241214_v2.txt",
    attempt: 1,
    timestamp: "2024-12-14T16:45:30Z",
    status: "error",
    httpCode: 400,
    response: "Dados inválidos - Verificar estrutura do arquivo",
    responseTime: "0.5s",
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: (i + 6).toString(),
    filename: `${i % 2 === 0 ? "titulos_vendidos" : "premiacao_instantanea"}_2024121${i % 10}_v1.${i % 2 === 0 ? "txt" : "zip"}`,
    attempt: (i % 3) + 1,
    timestamp: new Date(2024, 11, 10 + (i % 5), 10 + i, 30 + (i % 60)).toISOString(),
    status: i % 4 === 0 ? "error" : ("success" as "success" | "error"),
    httpCode: i % 4 === 0 ? [400, 422, 500, 503][i % 4] : 200,
    response:
      i % 4 === 0
        ? ["Dados inválidos", "Formato incorreto", "Erro interno", "Serviço indisponível"][i % 4]
        : "Arquivo processado com sucesso",
    responseTime: `${(0.5 + i * 0.3).toFixed(1)}s`,
  })),
]

const SESSION_TIMEOUT_SECONDS = 3 * 60 // 3 minutes
const WARNING_THRESHOLD_SECONDS = 60 // 1 minute

export default function IntegracaoPage() {
  const { toast } = useToast()
  const router = useRouter()

  // --- Estados para Gerenciamento de Sessão ---
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false) // Estado para controlar o sidebar mobile

  const resetSessionTimer = () => {
    setSessionTimeRemaining(SESSION_TIMEOUT_SECONDS)
    setShowSessionWarning(false)
  }

  const handleLogout = () => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    // Simulate API logout
    console.log("Admin logged out due to inactivity or explicit action.")
    router.push("/admin/login")
  }

  // Session Timer Effect
  useEffect(() => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)

    sessionTimerRef.current = setInterval(() => {
      setSessionTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          handleLogout()
          return 0
        }
        if (prevTime <= WARNING_THRESHOLD_SECONDS) {
          setShowSessionWarning(true)
        }
        return prevTime - 1
      })
    }, 1000)

    // Activity listeners to reset timer
    const activityEvents = ["mousemove", "keydown", "scroll", "touchstart"]
    activityEvents.forEach((event) => window.addEventListener(event, resetSessionTimer))

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
      activityEvents.forEach((event) => window.removeEventListener(event, resetSessionTimer))
    }
  }, [])

  // --- Estados para Geração de Arquivos ---
  const [isGeneratingTitulos, setIsGeneratingTitulos] = useState(false)
  const [isGeneratingPremiacao, setIsGeneratingPremiacao] = useState(false)
  const [files, setFiles] = useState<IntegrationFile[]>(mockFiles)

  // --- Estados para Upload de Comprovantes ---
  const [selectedIndividualFile, setSelectedIndividualFile] = useState<File | null>(null)
  const [selectedBatchFiles, setSelectedBatchFiles] = useState<FileList | null>(null)
  const [isUploadingIndividual, setIsUploadingIndividual] = useState(false)
  const [isUploadingBatch, setIsUploadingBatch] = useState(false)
  const [receipts, setReceipts] = useState<UploadedReceipt[]>(mockReceipts)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null)

  // --- Estados para Histórico de Tentativas ---
  const [apiHistory, setApiHistory] = useState<ApiHistoryEntry[]>(mockApiHistory)

  // --- Estados de Paginação ---
  const itemsPerPage = 10

  const [filesCurrentPage, setFilesCurrentPage] = useState(1)
  const filesTotalPages = Math.ceil(files.length / itemsPerPage)
  const filesPaginatedData = useMemo(() => {
    const startIndex = (filesCurrentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return files.slice(startIndex, endIndex)
  }, [files, filesCurrentPage, itemsPerPage])

  const [receiptsCurrentPage, setReceiptsCurrentPage] = useState(1)
  const receiptsTotalPages = Math.ceil(receipts.length / itemsPerPage)
  const receiptsPaginatedData = useMemo(() => {
    const startIndex = (receiptsCurrentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return receipts.slice(startIndex, endIndex)
  }, [receipts, receiptsCurrentPage, itemsPerPage])

  const [historyCurrentPage, setHistoryCurrentPage] = useState(1)
  const historyTotalPages = Math.ceil(apiHistory.length / itemsPerPage)
  const historyPaginatedData = useMemo(() => {
    const startIndex = (historyCurrentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return apiHistory.slice(startIndex, endIndex)
  }, [apiHistory, historyCurrentPage, itemsPerPage])

  // --- Funções de Paginação ---
  const getPaginationRange = (currentPage: number, totalPages: number) => {
    const rangeSize = 5
    let start = Math.max(1, currentPage - Math.floor(rangeSize / 2))
    const end = Math.min(totalPages, start + rangeSize - 1)

    if (end - start + 1 < rangeSize) {
      start = Math.max(1, end - rangeSize + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  // --- Handlers de Ações ---
  const handleGenerateFile = async (type: "titulos_vendidos" | "premiacao_instantanea") => {
    if (type === "titulos_vendidos") setIsGeneratingTitulos(true)
    else setIsGeneratingPremiacao(true)

    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simula delay

    const newFile: IntegrationFile = {
      id: (files.length + 1).toString(),
      type,
      filename: `${type}_${format(new Date(), "yyyyMMdd_HHmmss")}_v1.${type === "titulos_vendidos" ? "txt" : "zip"}`,
      version: "v1.0",
      status: "generated",
      createdAt: new Date().toISOString(),
      size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      downloadUrl: "#",
    }

    setFiles((prev) => [newFile, ...prev])
    toast({
      title: "Sucesso!",
      description: `Arquivo de ${type === "titulos_vendidos" ? "Títulos Vendidos" : "Premiação Instantânea"} gerado com sucesso.`,
      variant: "default",
    })

    if (type === "titulos_vendidos") setIsGeneratingTitulos(false)
    else setIsGeneratingPremiacao(false)
  }

  const handleSendFile = async (fileId: string) => {
    setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, status: "pending" } : file)))
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simula delay

    const success = Math.random() > 0.2 // 80% de chance de sucesso
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              status: success ? "sent" : "error",
              sentAt: success ? new Date().toISOString() : file.sentAt,
            }
          : file,
      ),
    )

    const updatedFile = files.find((f) => f.id === fileId)
    setApiHistory((prev) => [
      {
        id: (prev.length + 1).toString(),
        filename: updatedFile?.filename || "N/A",
        attempt: (apiHistory.filter((h) => h.filename === updatedFile?.filename).length || 0) + 1,
        timestamp: new Date().toISOString(),
        status: success ? "success" : "error",
        httpCode: success ? 200 : Math.random() > 0.5 ? 400 : 500,
        response: success ? "Arquivo enviado com sucesso" : "Falha no envio do arquivo",
        responseTime: `${(Math.random() * 2 + 0.5).toFixed(1)}s`,
      },
      ...prev,
    ])

    if (success) {
      toast({
        title: "Sucesso!",
        description: "Arquivo enviado para a CAPEMISA.",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro no Envio",
        description: "Falha ao enviar o arquivo para a CAPEMISA. Verifique o histórico.",
        variant: "destructive",
      })
    }
  }

  const handleReprocessFile = async (fileId: string) => {
    setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, status: "pending" } : file)))
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simula delay

    const success = Math.random() > 0.3 // 70% de chance de sucesso
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              status: success ? "generated" : "error",
              version: success ? `v${Number.parseInt(file.version.split("v")[1]) + 1}.0` : file.version,
            }
          : file,
      ),
    )

    if (success) {
      toast({
        title: "Sucesso!",
        description: "Arquivo reprocessado e gerado novamente.",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro no Reprocessamento",
        description: "Falha ao reprocessar o arquivo.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadFile = (url: string) => {
    window.open(url, "_blank")
    toast({
      title: "Download Iniciado",
      description: "Seu download deve começar em breve.",
      variant: "default",
    })
  }

  const handleIndividualFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedIndividualFile(event.target.files[0])
    } else {
      setSelectedIndividualFile(null)
    }
  }

  const handleBatchFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedBatchFiles(event.target.files)
    } else {
      setSelectedBatchFiles(null)
    }
  }

  const handleUploadIndividual = async () => {
    if (!selectedIndividualFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para enviar.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingIndividual(true)
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simula delay

    const newReceipt: UploadedReceipt = {
      id: (receipts.length + 1).toString(),
      filename: selectedIndividualFile.name,
      uploadedAt: new Date().toISOString(),
      fileId: `receipt_${Date.now()}`,
      size: `${(selectedIndividualFile.size / 1024).toFixed(2)} KB`,
      downloadUrl: "#",
    }

    setReceipts((prev) => [newReceipt, ...prev])
    setSelectedIndividualFile(null)
    toast({
      title: "Sucesso!",
      description: "Comprovante enviado com sucesso.",
      variant: "default",
    })
    setIsUploadingIndividual(false)
  }

  const handleUploadBatch = async () => {
    if (!selectedBatchFiles || selectedBatchFiles.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione arquivos para enviar.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingBatch(true)
    await new Promise((resolve) => setTimeout(resolve, 3000)) // Simula delay para múltiplos arquivos

    const newReceipts: UploadedReceipt[] = Array.from(selectedBatchFiles).map((file, index) => ({
      id: (receipts.length + 1 + index).toString(),
      filename: file.name,
      uploadedAt: new Date().toISOString(),
      fileId: `receipt_${Date.now()}_${index}`,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      downloadUrl: "#",
    }))

    setReceipts((prev) => [...newReceipts, ...prev])
    setSelectedBatchFiles(null)
    toast({
      title: "Sucesso!",
      description: `${newReceipts.length} comprovante(s) enviado(s) com sucesso.`,
      variant: "default",
    })
    setIsUploadingBatch(false)
  }

  const handleDeleteReceiptConfirm = (receiptId: string) => {
    setReceiptToDelete(receiptId)
    setIsAlertDialogOpen(true)
  }

  const handleDeleteReceipt = async () => {
    if (receiptToDelete) {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simula delay
      setReceipts((prev) => prev.filter((r) => r.id !== receiptToDelete))
      toast({
        title: "Comprovante Excluído",
        description: "O comprovante foi removido com sucesso.",
        variant: "default",
      })
      setReceiptToDelete(null)
      setIsAlertDialogOpen(false)
    }
  }

  const getStatusBadgeVariant = (status: IntegrationFile["status"] | ApiHistoryEntry["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md"
      case "generated":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
      case "sent":
      case "success":
        return "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black shadow-md" // Green gradient
      case "error":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md"
    }
  }

  const getHttpCodeBadgeVariant = (code: number) => {
    if (code >= 200 && code < 300) return "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black shadow-md" // Green gradient
    if (code >= 400 && code < 500) return "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
    if (code >= 500 && code < 600) return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
    return "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md"
  }

  return (
    <div className="flex min-h-screen text-white">
      {/* Mobile Header */}
      <AdminHeaderMobile onOpenSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* Sidebar (Desktop fixed, Mobile overlay) */}
      <AdminSidebar sessionTimeRemaining={sessionTimeRemaining} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto pt-20 lg:pt-6 lg:ml-64">
        {/* Session Warning */}
        {showSessionWarning && (
          <div className="fixed top-0 left-0 right-0 bg-red-800/80 text-white text-center py-2 z-50 animate-pulse">
            Sua sessão irá expirar em {sessionTimeRemaining} segundos!
          </div>
        )}
        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Integração CAPEMISA</h1>
            <p className="text-gray-400 mt-2">Geração automática e envio de arquivos para a CAPEMISA</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <Button
              onClick={() => handleGenerateFile("titulos_vendidos")}
              className="bg-[#9FFF00] text-black hover:bg-[#8FEF00] transition-colors duration-200 flex items-center gap-2"
              disabled={isGeneratingTitulos}
            >
              {isGeneratingTitulos ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Gerar Títulos Vendidos
            </Button>
            <Button
              onClick={() => handleGenerateFile("premiacao_instantanea")}
              className="bg-[#9FFF00] text-black hover:bg-[#8FEF00] transition-colors duration-200 flex items-center gap-2"
              disabled={isGeneratingPremiacao}
            >
              {isGeneratingPremiacao ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
              Gerar Premiação Instantânea
            </Button>
          </div>
        </div>

        {/* Sistema de Abas */}
        <Tabs defaultValue="files" className="flex-1">
          <TabsList className="grid w-full grid-cols-3 bg-[#1A2430] border border-[#9FFF00]/20 h-12">
            <TabsTrigger
              value="files"
              className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black text-gray-300"
            >
              Arquivos Gerados
            </TabsTrigger>
            <TabsTrigger
              value="receipts"
              className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black text-gray-300"
            >
              Comprovantes
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black text-gray-300"
            >
              Histórico de Tentativas
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: ARQUIVOS GERADOS */}
          <TabsContent value="files" className="mt-6">
            <Card className="bg-[#1A2430] border border-[#9FFF00]/20 text-white">
              <CardHeader>
                <CardTitle className="text-white">Status dos Arquivos</CardTitle>
                <CardDescription className="text-gray-400">
                  Histórico de geração e envio de arquivos para a CAPEMISA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#9FFF00]/20 hover:bg-transparent">
                        <TableHead className="text-gray-300">Tipo</TableHead>
                        <TableHead className="text-gray-300">Arquivo</TableHead>
                        <TableHead className="text-gray-300">Versão</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Criado em</TableHead>
                        <TableHead className="text-gray-300">Enviado em</TableHead>
                        <TableHead className="text-gray-300">Tamanho</TableHead>
                        <TableHead className="text-gray-300 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filesPaginatedData.length === 0 ? (
                        <TableRow className="border-b border-[#9FFF00]/10 hover:bg-[#9FFF00]/5">
                          <TableCell colSpan={8} className="text-center text-gray-400 py-4">
                            Nenhum arquivo gerado ainda.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filesPaginatedData.map((file) => (
                          <TableRow key={file.id} className="border-b border-[#9FFF00]/10 hover:bg-[#9FFF00]/5">
                            <TableCell className="text-white flex items-center gap-2">
                              {file.type === "titulos_vendidos" ? (
                                <FileText className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Archive className="h-4 w-4 text-gray-400" />
                              )}
                              {file.type === "titulos_vendidos" ? "Títulos Vendidos" : "Premiação Instantânea"}
                            </TableCell>
                            <TableCell className="text-white font-mono text-sm">{file.filename}</TableCell>
                            <TableCell className="text-gray-300">{file.version}</TableCell>
                            <TableCell>
                              <Badge className={cn("min-w-[80px] justify-center", getStatusBadgeVariant(file.status))}>
                                {file.status === "pending" && "Pendente"}
                                {file.status === "generated" && "Gerado"}
                                {file.status === "sent" && "Enviado"}
                                {file.status === "error" && "Erro"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {format(new Date(file.createdAt), "dd/MM/yyyy HH:mm:ss", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {file.sentAt
                                ? format(new Date(file.sentAt), "dd/MM/yyyy HH:mm:ss", {
                                    locale: ptBR,
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell className="text-gray-300">{file.size || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {file.status === "generated" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-[#9FFF00] hover:bg-[#9FFF00]/10"
                                    onClick={() => handleSendFile(file.id)}
                                  >
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">Enviar</span>
                                  </Button>
                                )}
                                {(file.status === "generated" || file.status === "sent") && file.downloadUrl && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-400/10"
                                    onClick={() => handleDownloadFile(file.downloadUrl!)}
                                  >
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Download</span>
                                  </Button>
                                )}
                                {file.status === "error" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-yellow-400 hover:bg-yellow-400/10"
                                    onClick={() => handleReprocessFile(file.id)}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                    <span className="sr-only">Reprocessar</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Paginação */}
                {files.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                    <span>
                      Exibindo {Math.min((filesCurrentPage - 1) * itemsPerPage + 1, files.length)} a{" "}
                      {Math.min(filesCurrentPage * itemsPerPage, files.length)} de {files.length} arquivos
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilesCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={filesCurrentPage === 1}
                        className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <div className="flex gap-1">
                        {getPaginationRange(filesCurrentPage, filesTotalPages).map((page) => (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            onClick={() => setFilesCurrentPage(page)}
                            className={cn(
                              "w-8 h-8",
                              page === filesCurrentPage
                                ? "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black hover:from-[#8AE000] hover:to-[#7AC000] shadow-[0_0_15px_rgba(159,255,0,0.4)] border-none"
                                : "border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]",
                            )}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilesCurrentPage((prev) => Math.min(filesTotalPages, prev + 1))}
                        disabled={filesCurrentPage === filesTotalPages}
                        className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]"
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: COMPROVANTES */}
          <TabsContent value="receipts" className="mt-6 space-y-6">
            {/* Seção de Upload */}
            <Card className="bg-[#1A2430] border border-[#9FFF00]/20 text-white">
              <CardHeader>
                <CardTitle className="text-white">Upload de Comprovante</CardTitle>
                <CardDescription className="text-gray-400">
                  Envie comprovantes de remessa manualmente quando necessário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="individual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[#0D1117] border border-[#9FFF00]/20 h-10">
                    <TabsTrigger
                      value="individual"
                      className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black text-gray-300"
                    >
                      Individual
                    </TabsTrigger>
                    <TabsTrigger
                      value="batch"
                      className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black text-gray-300"
                    >
                      Em Lote
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="individual" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="individual-file" className="text-gray-300">
                          Arquivo
                        </Label>
                        <Input
                          id="individual-file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleIndividualFileChange}
                          className="mt-1 bg-[#0D1117] border-[#9FFF00]/20 text-white file:bg-transparent file:text-[#9FFF00] file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:font-medium hover:file:bg-transparent hover:file:text-[#8FEF00]"
                        />
                      </div>
                      <Button
                        onClick={handleUploadIndividual}
                        className="bg-[#9FFF00] text-black hover:bg-[#8FEF00] transition-colors duration-200 flex items-center gap-2 w-full"
                        disabled={isUploadingIndividual || !selectedIndividualFile}
                      >
                        {isUploadingIndividual ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Enviar Comprovante
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="batch" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="batch-files" className="text-gray-300">
                          Arquivos (múltiplos)
                        </Label>
                        <Input
                          id="batch-files"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleBatchFilesChange}
                          className="mt-1 bg-[#0D1117] border-[#9FFF00]/20 text-white file:bg-transparent file:text-[#9FFF00] file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:font-medium hover:file:bg-transparent hover:file:text-[#8FEF00]"
                        />
                        {selectedBatchFiles && selectedBatchFiles.length > 0 && (
                          <p className="text-gray-400 text-sm mt-2">
                            {selectedBatchFiles.length} arquivo(s) selecionado(s)
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleUploadBatch}
                        className="bg-[#9FFF00] text-black hover:bg-[#8FEF00] transition-colors duration-200 flex items-center gap-2 w-full"
                        disabled={isUploadingBatch || !selectedBatchFiles || selectedBatchFiles.length === 0}
                      >
                        {isUploadingBatch ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Enviar {selectedBatchFiles ? selectedBatchFiles.length : ""} Comprovante(s)
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Lista de Comprovantes Enviados */}
            <Card className="bg-[#1A2430] border border-[#9FFF00]/20 text-white">
              <CardHeader>
                <CardTitle className="text-white">Comprovantes Enviados</CardTitle>
                <CardDescription className="text-gray-400">
                  Histórico de comprovantes de remessa enviados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#9FFF00]/20 hover:bg-transparent">
                        <TableHead className="text-gray-300">Arquivo</TableHead>
                        <TableHead className="text-gray-300">Enviado em</TableHead>
                        <TableHead className="text-gray-300">Tamanho</TableHead>
                        <TableHead className="text-gray-300 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receiptsPaginatedData.length === 0 ? (
                        <TableRow className="border-b border-[#9FFF00]/10 hover:bg-[#9FFF00]/5">
                          <TableCell colSpan={4} className="text-center text-gray-400 py-4">
                            Nenhum comprovante enviado ainda.
                          </TableCell>
                        </TableRow>
                      ) : (
                        receiptsPaginatedData.map((receipt) => (
                          <TableRow key={receipt.id} className="border-b border-[#9FFF00]/10 hover:bg-[#9FFF00]/5">
                            <TableCell className="text-white flex items-center gap-2">
                              <FileCheck className="h-4 w-4 text-green-500" />
                              {receipt.filename}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {format(new Date(receipt.uploadedAt), "dd/MM/yyyy HH:mm:ss", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell className="text-gray-300">{receipt.size}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-400/10"
                                  onClick={() => window.open(receipt.downloadUrl, "_blank")}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Visualizar</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-400 hover:bg-red-400/10"
                                  onClick={() => handleDeleteReceiptConfirm(receipt.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Excluir</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Paginação */}
                {receipts.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                    <span>
                      Exibindo {Math.min((receiptsCurrentPage - 1) * itemsPerPage + 1, receipts.length)} a{" "}
                      {Math.min(receiptsCurrentPage * itemsPerPage, receipts.length)} de {receipts.length} comprovantes
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReceiptsCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={receiptsCurrentPage === 1}
                        className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <div className="flex gap-1">
                        {getPaginationRange(receiptsCurrentPage, receiptsTotalPages).map((page) => (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            onClick={() => setReceiptsCurrentPage(page)}
                            className={cn(
                              "w-8 h-8",
                              page === receiptsCurrentPage
                                ? "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black hover:from-[#8AE000] hover:to-[#7AC000] shadow-[0_0_15px_rgba(159,255,0,0.4)] border-none"
                                : "border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]",
                            )}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReceiptsCurrentPage((prev) => Math.min(receiptsTotalPages, prev + 1))}
                        disabled={receiptsCurrentPage === receiptsTotalPages}
                        className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]"
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 3: HISTÓRICO DE TENTATIVAS */}
          <TabsContent value="history" className="mt-6">
            <Card className="bg-[#1A2430] border border-[#9FFF00]/20 text-white">
              <CardHeader>
                <CardTitle className="text-white">Histórico de Tentativas de Envio e Retorno da API</CardTitle>
                <CardDescription className="text-gray-400">
                  Registro completo de todas as tentativas de envio e respostas da API CAPEMISA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#9FFF00]/20 hover:bg-transparent">
                        <TableHead className="text-gray-300">Nome do Arquivo</TableHead>
                        <TableHead className="text-gray-300">Tentativa</TableHead>
                        <TableHead className="text-gray-300">Data/Hora</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Código HTTP</TableHead>
                        <TableHead className="text-gray-300">Resposta da API</TableHead>
                        <TableHead className="text-gray-300">Tempo Resposta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyPaginatedData.length === 0 ? (
                        <TableRow className="border-b border-[#9FFF00]/10 hover:bg-[#9FFF00]/5">
                          <TableCell colSpan={7} className="text-center text-gray-400 py-4">
                            Nenhum histórico de tentativa encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        historyPaginatedData.map((entry) => (
                          <TableRow key={entry.id} className="border-b border-[#9FFF00]/10 hover:bg-[#9FFF00]/5">
                            <TableCell className="text-white font-mono text-sm">{entry.filename}</TableCell>
                            <TableCell>
                              <Badge className="bg-gradient-to-r from-gray-600 to-gray-700 text-white min-w-[60px] justify-center shadow-md">
                                #{entry.attempt}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {format(new Date(entry.timestamp), "dd/MM/yyyy HH:mm:ss", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("min-w-[80px] justify-center", getStatusBadgeVariant(entry.status))}>
                                {entry.status === "success" ? "Sucesso" : "Erro"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn("min-w-[60px] justify-center", getHttpCodeBadgeVariant(entry.httpCode))}
                              >
                                {entry.httpCode}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300 max-w-xs truncate" title={entry.response}>
                              {entry.response}
                            </TableCell>
                            <TableCell className="text-gray-300">{entry.responseTime}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Paginação */}
                {apiHistory.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                    <span>
                      Exibindo {Math.min((historyCurrentPage - 1) * itemsPerPage + 1, apiHistory.length)} a{" "}
                      {Math.min(historyCurrentPage * itemsPerPage, apiHistory.length)} de {apiHistory.length} registros
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={historyCurrentPage === 1}
                        className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <div className="flex gap-1">
                        {getPaginationRange(historyCurrentPage, historyTotalPages).map((page) => (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            onClick={() => setHistoryCurrentPage(page)}
                            className={cn(
                              "w-8 h-8",
                              page === historyCurrentPage
                                ? "bg-gradient-to-r from-[#9FFF00] to-[#8AE000] text-black hover:from-[#8AE000] hover:to-[#7AC000] shadow-[0_0_15px_rgba(159,255,0,0.4)] border-none"
                                : "border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]",
                            )}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryCurrentPage((prev) => Math.min(historyTotalPages, prev + 1))}
                        disabled={historyCurrentPage === historyTotalPages}
                        className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-gradient-to-r from-[#131B24] to-[#1A2430] hover:border-[#9FFF00] hover:text-[#9FFF00] hover:shadow-[0_0_10px_rgba(159,255,0,0.3)]"
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AlertDialog para confirmação de exclusão */}
        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogContent className="bg-[#1A2430] border border-[#9FFF00]/20 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Tem certeza que deseja excluir este comprovante? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-600 text-white hover:bg-gray-700">Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteReceipt}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
