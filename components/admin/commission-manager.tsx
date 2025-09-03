"use client"

import { useState } from "react"
import { atualizarComissoesGlobais, atualizarComissoesInfluencer } from "@/services/comissoes"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Percent, ChevronDown, User, Users } from "lucide-react"
import { InfluencerSelectionModal } from "./influencer-selection-modal"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface CommissionLevel {
  level: number
  percentage: number
  description: string
}

interface Influencer {
  id: string
  nome: string
  codigo_influencer: string
  status: string
}

interface CommissionManagerProps {
  influencers: Influencer[]
  initialCommissions?: CommissionLevel[]
  onSave: (commissions: CommissionLevel[], influencerId?: string) => void
}

export function CommissionManager({ influencers, initialCommissions, onSave }: CommissionManagerProps) {
  const { toast } = useToast()
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [commissions, setCommissions] = useState<CommissionLevel[]>(
    initialCommissions || [
      { level: 1, percentage: 15, description: "Indicações Diretas" },
      { level: 2, percentage: 5, description: "Rede Secundária" },
      { level: 3, percentage: 1, description: "Rede Expandida" },
    ]
  )

  const handlePercentageChange = (level: number, value: string) => {
    const percentage = parseFloat(value)
    if (isNaN(percentage) || percentage < 0) return

    setCommissions((prev) =>
      prev.map((comm) => (comm.level === level ? { ...comm, percentage } : comm))
    )
  }

  const handleSave = async () => {
    try {
      // Validar que cada nível não pode ser maior que 15%
      const invalidCommission = commissions.find(comm => comm.percentage > 15)
      if (invalidCommission) {
        toast({
          title: "Erro na Configuração",
          description: `A comissão do nível ${invalidCommission.level} não pode ser maior que 15%`,
          variant: "destructive",
        })
        return
      }

      const comissoesPayload: { nivel: "direto" | "secundario" | "expandido", percentual: number }[] = [
        { nivel: "direto", percentual: commissions[0].percentage },
        { nivel: "secundario", percentual: commissions[1].percentage },
        { nivel: "expandido", percentual: commissions[2].percentage },
      ]

      if (!selectedInfluencer) {
        // Atualiza comissões globais
        await atualizarComissoesGlobais(comissoesPayload)
        toast({
          title: "Configurações Globais Salvas",
          description: "As configurações de comissão foram atualizadas com sucesso para todos os influencers.",
        })
      } else {
        // Atualiza comissão individual
        await atualizarComissoesInfluencer(selectedInfluencer.id, comissoesPayload)
        toast({
          title: "Configurações Individuais Salvas",
          description: `As configurações de comissão foram atualizadas com sucesso para ${selectedInfluencer.nome}.`,
        })
      }
    } catch (error) {
      console.error("Erro ao atualizar comissões:", error)
      toast({
        title: "Erro ao Salvar",
        description: "Ocorreu um erro ao atualizar as comissões. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-[#232A34] border-[#366D51] p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Configuração de Comissões</h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Selecione o Influencer
          </label>
          <div className="space-y-4">
            <Select
              value={selectedInfluencer ? "specific" : "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedInfluencer(null)
                } else if (value === "specific") {
                  setIsModalOpen(true)
                }
              }}
            >
              <SelectTrigger className="w-full bg-[#1A2430] border-[#366D51] text-white hover:bg-[#2A3440] hover:border-[#9FFF00]">
                <SelectValue placeholder="Selecione o tipo de configuração" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2430] border-[#366D51]">
                <SelectGroup>
                  <SelectLabel className="text-[#9FFF00]">Tipo de Configuração</SelectLabel>
                  <SelectItem value="all" className="text-white hover:bg-[#2A3440] hover:text-[#9FFF00] focus:bg-[#2A3440] focus:text-[#9FFF00]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Todos os Influencers</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="specific" className="text-white hover:bg-[#2A3440] hover:text-[#9FFF00] focus:bg-[#2A3440] focus:text-[#9FFF00]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Selecionar Influencer</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {selectedInfluencer && (
              <div className="flex items-center gap-2 p-3 bg-[#1A2430] border border-[#9FFF00] rounded-md">
                <div className="h-8 w-8 rounded-full bg-[#366D51] flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedInfluencer.nome}</p>
                  <p className="text-sm text-gray-400">
                    Configurando comissões específicas de {selectedInfluencer.nome}
                  </p>
                  <p className="text-xs text-gray-500">Código: {selectedInfluencer.codigo_influencer}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#9FFF00] hover:text-[#8AE000] hover:bg-[#2A3440]"
                  onClick={() => setSelectedInfluencer(null)}
                >
                  Remover
                </Button>
              </div>
            )}
          </div>

          <InfluencerSelectionModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={setSelectedInfluencer}

          />
        </div>

        {commissions.map((commission) => (
          <div key={commission.level} className="space-y-2">
            <label className="text-sm text-gray-400">
              Nível {commission.level} - {commission.description}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={commission.percentage}
                onChange={(e) => handlePercentageChange(commission.level, e.target.value)}
                className="bg-[#1A2430] border-[#366D51] text-white"
                min="0"
                max="100"
                step="0.1"
              />
              <Percent className="h-4 w-4 text-[#9FFF00]" />
            </div>
            <p className="text-xs text-gray-500">
              {commission.level === 1
                ? "Comissão para indicações diretas do influencer"
                : commission.level === 2
                ? "Comissão sobre vendas da rede secundária"
                : "Comissão sobre vendas da rede expandida"}
            </p>
          </div>
        ))}

        <Button onClick={handleSave} className="w-full bg-[#9FFF00] text-[#191F26] hover:bg-[#8AE000]">
          Salvar Configurações
        </Button>
      </div>
    </Card>
  )
}