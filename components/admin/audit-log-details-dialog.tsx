"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { type AuditLog, formatAuditDate } from "@/lib/audit-data"
import { Badge } from "@/components/ui/badge"

interface AuditLogDetailsDialogProps {
  log: AuditLog | null
  isOpen: boolean
  onClose: () => void
}

export function AuditLogDetailsDialog({ log, isOpen, onClose }: AuditLogDetailsDialogProps) {
  if (!log) return null

  const renderStatusBadge = (status: AuditLog["status"]) => {
    switch (status) {
      case "Sucesso":
        return <Badge className="bg-[#9FFF00] text-[#191F26] border-[#9FFF00] hover:bg-[#80CC00]">{status}</Badge>
      case "Erro":
        return <Badge className="bg-[#ef4444] text-white border-[#ef4444] hover:bg-[#dc2626]">{status}</Badge>
      case "Atenção":
        return <Badge className="bg-[#facc15] text-[#191F26] border-[#facc15] hover:bg-[#eab308]">{status}</Badge>
      default:
        return null
    }
  }

  const handleExportJson = () => {
    const filename = `audit_log_${log.id}.json`
    const jsonStr = JSON.stringify(log, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-[#232A34] text-white border-[#9FFF00]/20">
        <DialogHeader>
          <DialogTitle className="text-[#9FFF00]">Detalhes do Log</DialogTitle>
          <DialogDescription className="text-gray-400">
            Informações técnicas completas do evento de auditoria.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto rounded-md bg-[#191F26] p-4 font-mono text-sm text-gray-200">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <strong className="text-[#9FFF00]">Data/Hora:</strong> {formatAuditDate(log.timestamp)}
            </div>
            <div>
              <strong className="text-[#9FFF00]">Tipo de Evento:</strong> {log.eventType}
            </div>
            <div>
              <strong className="text-[#9FFF00]">CPF/ID Relacionado:</strong> {log.relatedId || "N/A"}
            </div>
            <div>
              <strong className="text-[#9FFF00]">Origem:</strong> {log.origin}
            </div>
            <div>
              <strong className="text-[#9FFF00]">Status:</strong> {renderStatusBadge(log.status)}
            </div>
            <div>
              <strong className="text-[#9FFF00]">Executado Por:</strong> {log.executedBy}
            </div>
            <div>
              <strong className="text-[#9FFF00]">Endereço IP:</strong> {log.ipAddress}
            </div>
            <div>
              <strong className="text-[#9FFF00]">Hash:</strong> {log.hash}
            </div>
          </div>
          <div className="mb-4">
            <strong className="text-[#9FFF00]">Descrição:</strong> {log.description}
          </div>
          <div className="mb-4">
            <strong className="text-[#9FFF00]">User Agent:</strong> {log.userAgent}
          </div>

          {log.requestPayload && (
            <div className="mb-4">
              <strong className="text-[#9FFF00]">Payload da Requisição:</strong>
              <pre className="whitespace-pre-wrap break-all p-2 bg-[#232A34] rounded-md mt-1">
                {JSON.stringify(log.requestPayload, null, 2)}
              </pre>
            </div>
          )}
          {log.responsePayload && (
            <div className="mb-4">
              <strong className="text-[#9FFF00]">Payload da Resposta:</strong>
              <pre className="whitespace-pre-wrap break-all p-2 bg-[#232A34] rounded-md mt-1">
                {JSON.stringify(log.responsePayload, null, 2)}
              </pre>
            </div>
          )}
          {log.previousState && (
            <div className="mb-4">
              <strong className="text-[#9FFF00]">Estado Anterior:</strong>
              <pre className="whitespace-pre-wrap break-all p-2 bg-[#232A34] rounded-md mt-1">
                {JSON.stringify(log.previousState, null, 2)}
              </pre>
            </div>
          )}
          {log.currentState && (
            <div className="mb-4">
              <strong className="text-[#9FFF00]">Estado Posterior:</strong>
              <pre className="whitespace-pre-wrap break-all p-2 bg-[#232A34] rounded-md mt-1">
                {JSON.stringify(log.currentState, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleExportJson} className="bg-[#9FFF00] text-[#191F26] hover:bg-[#80CC00]">
            <Download className="mr-2 h-4 w-4" /> Exportar JSON
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
