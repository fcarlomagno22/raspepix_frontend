"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { type AuditLog, mockAuditLogs } from "@/lib/audit-data"
import { AuditLogFilters } from "@/components/admin/audit-log-filters"
import { AuditLogTable } from "@/components/admin/audit-log-table"
import AdminSidebar from "@/components/admin/admin-sidebar" // Assuming this exists
import AdminHeaderMobile from "@/components/admin/admin-header-mobile" // Assuming this exists

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    eventType: "Todos os Tipos",
    relatedId: "",
    executedBy: "",
    startDate: "",
    endDate: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 10

  // Simulate fetching data
  useEffect(() => {
    setLoading(true)
    // In a real application, you would fetch data from an API here
    setTimeout(() => {
      setLogs(mockAuditLogs)
      setLoading(false)
    }, 500)
  }, [])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesEventType = filters.eventType === "Todos os Tipos" || log.eventType === filters.eventType

      const matchesRelatedId =
        !filters.relatedId ||
        log.relatedId?.toLowerCase().includes(filters.relatedId.toLowerCase()) ||
        log.id.toLowerCase().includes(filters.relatedId.toLowerCase())

      const matchesExecutedBy =
        !filters.executedBy || log.executedBy.toLowerCase().includes(filters.executedBy.toLowerCase())

      const logDate = new Date(log.timestamp)
      const matchesStartDate = !filters.startDate || logDate >= new Date(filters.startDate)
      const matchesEndDate = !filters.endDate || logDate <= new Date(filters.endDate)

      return matchesEventType && matchesRelatedId && matchesExecutedBy && matchesStartDate && matchesEndDate
    })
  }, [logs, filters])

  const totalPages = useMemo(() => Math.ceil(filteredLogs.length / logsPerPage), [filteredLogs.length, logsPerPage])

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage
    const endIndex = startIndex + logsPerPage
    return filteredLogs.slice(startIndex, endIndex)
  }, [filteredLogs, currentPage, logsPerPage])

  const handleApplyFilters = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page on filter change
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({
      eventType: "Todos os Tipos",
      relatedId: "",
      executedBy: "",
      startDate: "",
      endDate: "",
    })
    setCurrentPage(1) // Reset to first page on filter clear
  }, [])

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page)
      }
    },
    [totalPages],
  )

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <AdminHeaderMobile
          onOpenSidebar={() => {
            /* TODO: implementar abertura do sidebar mobile */
          }}
        />
        <main className="flex-1 p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-[#9FFF00]">Logs de Auditoria</h1>
          <AuditLogFilters onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} />
          <AuditLogTable
            logs={paginatedLogs}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </div>
  )
}
