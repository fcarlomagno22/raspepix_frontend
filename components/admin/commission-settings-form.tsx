"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Percent } from "lucide-react"

interface CommissionLevel {
  level: number
  percentage: number
  description: string
}

interface CommissionSettingsFormProps {
  initialCommissions?: CommissionLevel[]
  onSave: (commissions: CommissionLevel[]) => void
}

export function CommissionSettingsForm({ initialCommissions, onSave }: CommissionSettingsFormProps) {
  const { toast } = useToast()
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

  const handleSave = () => {
    // Validar se as porcentagens são válidas
    const totalPercentage = commissions.reduce((sum, comm) => sum + comm.percentage, 0)
    if (totalPercentage > 100) {
      toast({
        title: "Erro na Configuração",
        description: "A soma total das comissões não pode ultrapassar 100%",
        variant: "destructive",
      })
      return
    }

    onSave(commissions)
    toast({
      title: "Configurações Salvas",
      description: "As configurações de comissão foram atualizadas com sucesso.",
    })
  }

  return (
    <Card className="bg-[#232A34] border-[#366D51] p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Configuração de Comissões por Nível</h3>
      
      <div className="space-y-6">
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