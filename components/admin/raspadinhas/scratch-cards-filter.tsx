"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useState } from "react"

interface ScratchCardsFilterProps {
  onSearch: (query: string) => void
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void
}

export default function ScratchCardsFilter({ onSearch, onSortChange }: ScratchCardsFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const handleSearch = () => {
    onSearch(searchQuery)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    onSortChange(value, sortOrder)
  }

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc"
    setSortOrder(newOrder)
    onSortChange(sortBy, newOrder)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar raspadinhas..."
          className="pl-10 bg-[#0D1117] border-[#9FFF00]/20 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSearch()
          }}
        />
      </div>
      <Button onClick={handleSearch} className="bg-[#9FFF00] text-black hover:bg-[#8AE000]">
        Buscar
      </Button>
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px] bg-[#0D1117] border-[#9FFF00]/20 text-white">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent className="bg-[#1A2430] border-[#9FFF00]/20 text-white">
          <SelectItem value="name">Nome</SelectItem>
          <SelectItem value="maxPrize">Prêmio Máx.</SelectItem>
          <SelectItem value="cost">Custo em Fichas</SelectItem>
          {/* Add other sortable fields as needed */}
          <SelectItem value="createdAt">Data de Criação</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={toggleSortOrder} className="bg-[#9FFF00] text-black hover:bg-[#8AE000]">
        {sortOrder === "asc" ? "Asc" : "Desc"}
      </Button>
    </div>
  )
}
