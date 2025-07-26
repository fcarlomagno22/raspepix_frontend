"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { eventTypes } from "@/lib/audit-data"

interface AuditLogFiltersProps {
  onApplyFilters: (filters: {
    eventType: string
    relatedId: string
    executedBy: string
    startDate: string
    endDate: string
  }) => void
  onClearFilters: () => void
}

export function AuditLogFilters({ onApplyFilters, onClearFilters }: AuditLogFiltersProps) {
  const [eventType, setEventType] = useState("Todos os Tipos")
  const [relatedId, setRelatedId] = useState("")
  const [executedBy, setExecutedBy] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleApply = () => {
    onApplyFilters({ eventType, relatedId, executedBy, startDate, endDate })
  }

  const handleClear = () => {
    setEventType("Todos os Tipos")
    setRelatedId("")
    setExecutedBy("")
    setStartDate("")
    setEndDate("")
    onClearFilters()
  }

  return (
    <div className="bg-[#232A34] rounded-lg p-6 mb-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-white">Filtros Avançados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-300 mb-1">
            Tipo de Evento
          </label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="bg-[#191F26] border-[#9FFF00]/20 text-white">
              <SelectValue placeholder="Selecione um tipo" />
            </SelectTrigger>
            <SelectContent className="bg-[#191F26] text-white border-[#9FFF00]/20">
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="relatedId" className="block text-sm font-medium text-gray-300 mb-1">
            CPF ou ID de Referência
          </label>
          <Input
            id="relatedId"
            type="text"
            placeholder="Buscar por CPF ou ID"
            value={relatedId}
            onChange={(e) => setRelatedId(e.target.value)}
            className="bg-[#191F26] border-[#9FFF00]/20 text-white placeholder:text-gray-500"
          />
        </div>
        <div>
          <label htmlFor="executedBy" className="block text-sm font-medium text-gray-300 mb-1">
            Usuário Executor
          </label>
          <Input
            id="executedBy"
            type="text"
            placeholder="Buscar por usuário executor"
            value={executedBy}
            onChange={(e) => setExecutedBy(e.target.value)}
            className="bg-[#191F26] border-[#9FFF00]/20 text-white placeholder:text-gray-500"
          />
        </div>
        <div>
          <label htmlFor="period" className="block text-sm font-medium text-gray-300 mb-1">
            Período
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#191F26] border-[#9FFF00]/20 text-white placeholder:text-gray-500"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#191F26] border-[#9FFF00]/20 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleClear}
          className="bg-transparent border-[#9FFF00] text-[#9FFF00] hover:bg-[#9FFF00]/20 hover:text-white"
        >
          Limpar Filtros
        </Button>
        <Button onClick={handleApply} className="bg-[#9FFF00] text-[#191F26] hover:bg-[#80CC00]">
          Aplicar Filtros
        </Button>
      </div>
    </div>
  )
}
