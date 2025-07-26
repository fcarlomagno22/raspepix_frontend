"use client"

import { useState, useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Download, Eye } from "lucide-react"
import { type AuditLog, formatAuditDate } from "@/lib/audit-data"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { AuditLogDetailsDialog } from "./audit-log-details-dialog"

interface AuditLogTableProps {
  logs: AuditLog[]
  loading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function AuditLogTable({ logs, loading, currentPage, totalPages, onPageChange }: AuditLogTableProps) {
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLog | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(logs.map((log) => log.id))
      setSelectedLogIds(newSelected)
    } else {
      setSelectedLogIds(new Set())
    }
  }

  const handleSelectLog = (logId: string, checked: boolean) => {
    setSelectedLogIds((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(logId)
      } else {
        newSet.delete(logId)
      }
      return newSet
    })
  }

  const isAllSelected = useMemo(() => logs.length > 0 && selectedLogIds.size === logs.length, [logs, selectedLogIds])
  const isIndeterminate = useMemo(
    () => selectedLogIds.size > 0 && selectedLogIds.size < logs.length,
    [logs, selectedLogIds],
  )

  const renderStatusBadge = (status: AuditLog["status"]) => {
    switch (status) {
      case "Sucesso":
        return (
          <Badge className="bg-[#9FFF00] text-[#191F26] border-[#9FFF00] hover:bg-[#80CC00] w-24 flex items-center justify-center">
            {status}
          </Badge>
        )
      case "Erro":
        return (
          <Badge className="bg-[#ef4444] text-white border-[#ef4444] hover:bg-[#dc2626] w-24 flex items-center justify-center">
            {status}
          </Badge>
        )
      case "Atenção":
        return (
          <Badge className="bg-[#facc15] text-[#191F26] border-[#facc15] hover:bg-[#eab308] w-24 flex items-center justify-center">
            {status}
          </Badge>
        )
      default:
        return null
    }
  }

  const handleViewDetails = useCallback((log: AuditLog) => {
    setSelectedLogForDetails(log)
    setDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false)
    setSelectedLogForDetails(null)
  }, [])

  const handleExportSelected = () => {
    const selectedLogs = logs.filter((log) => selectedLogIds.has(log.id))
    exportLogsToCsv(selectedLogs, "selected_audit_logs.csv")
  }

  const handleExportAll = () => {
    exportLogsToCsv(logs, "all_audit_logs.csv")
  }

  const exportLogsToCsv = (data: AuditLog[], filename: string) => {
    if (data.length === 0) return

    const headers = [
      "ID",
      "Data/Hora",
      "Tipo de Evento",
      "CPF/ID Relacionado",
      "Origem",
      "Status",
      "Descrição",
      "Hash",
      "Executado Por",
      "Endereço IP",
      "User Agent",
      "Payload Requisição",
      "Payload Resposta",
      "Estado Anterior",
      "Estado Posterior",
    ]

    const rows = data.map((log) => [
      log.id,
      formatAuditDate(log.timestamp),
      log.eventType,
      log.relatedId || "N/A",
      log.origin,
      log.status,
      log.description.replace(/"/g, '""'), // Escape double quotes
      log.hash,
      log.executedBy,
      log.ipAddress,
      log.userAgent.replace(/"/g, '""'),
      log.requestPayload ? JSON.stringify(log.requestPayload).replace(/"/g, '""') : "",
      log.responsePayload ? JSON.stringify(log.responsePayload).replace(/"/g, '""') : "",
      log.previousState ? JSON.stringify(log.previousState).replace(/"/g, '""') : "",
      log.currentState ? JSON.stringify(log.currentState).replace(/"/g, '""') : "",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((field) => `"${field}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-[#232A34] rounded-lg p-6 shadow-lg flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Registros de Auditoria</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleExportSelected}
            disabled={selectedLogIds.size === 0}
            className="bg-[#9FFF00] text-[#191F26] hover:bg-[#80CC00]"
          >
            <Download className="mr-2 h-4 w-4" /> Exportar Selecionados (CSV)
          </Button>
          <Button onClick={handleExportAll} className="bg-[#9FFF00] text-[#191F26] hover:bg-[#80CC00]">
            <Download className="mr-2 h-4 w-4" /> Exportar Tudo (CSV)
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#191F26] hover:bg-[#191F26]">
              <TableHead className="text-center text-gray-300 w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-[#9FFF00] data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-[#191F26]"
                  aria-label="Selecionar todos"
                  {...(isIndeterminate && { indeterminate: true })}
                />
              </TableHead>
              <TableHead className="text-center text-gray-300">Data/Hora</TableHead>
              <TableHead className="text-center text-gray-300">Tipo de Evento</TableHead>
              <TableHead className="text-center text-gray-300">CPF/ID Relacionado</TableHead>
              <TableHead className="text-center text-gray-300">Origem</TableHead>
              <TableHead className="text-center text-gray-300">Status</TableHead>
              <TableHead className="text-center text-gray-300">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  Carregando logs...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  Nenhum log encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-b border-[#9FFF00]/10 hover:bg-[#2A333F]">
                  <TableCell className="text-center text-white">
                    <Checkbox
                      checked={selectedLogIds.has(log.id)}
                      onCheckedChange={(checked) => handleSelectLog(log.id, checked as boolean)}
                      className="border-[#9FFF00] data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-[#191F26]"
                      aria-label={`Selecionar log ${log.id}`}
                    />
                  </TableCell>
                  <TableCell className="text-center text-white">{formatAuditDate(log.timestamp)}</TableCell>
                  <TableCell className="text-center text-white">{log.eventType}</TableCell>
                  <TableCell className="text-center text-white">{log.relatedId || "N/A"}</TableCell>
                  <TableCell className="text-center text-white">{log.origin}</TableCell>
                  <TableCell className="text-center text-white">{renderStatusBadge(log.status)}</TableCell>
                  <TableCell className="text-center text-white">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(log)}
                      className="text-[#9FFF00] hover:bg-[#9FFF00]/20 hover:text-white"
                      aria-label={`Visualizar detalhes do log ${log.id}`}
                    >
                      <Eye size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination className="mt-4 justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => onPageChange(currentPage - 1)}
              className={`text-[#9FFF00] border border-[#9FFF00] hover:bg-[#9FFF00]/20 hover:text-white ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={() => onPageChange(page)}
                isActive={page === currentPage}
                className={`text-[#9FFF00] border border-[#9FFF00] hover:bg-[#9FFF00]/20 hover:text-white ${
                  page === currentPage ? "bg-[#9FFF00]/30" : ""
                }`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => onPageChange(currentPage + 1)}
              className={`text-[#9FFF00] border border-[#9FFF00] hover:bg-[#9FFF00]/20 hover:text-white ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <AuditLogDetailsDialog log={selectedLogForDetails} isOpen={dialogOpen} onClose={handleCloseDialog} />
    </div>
  )
}
