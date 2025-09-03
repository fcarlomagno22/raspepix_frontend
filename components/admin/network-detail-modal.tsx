"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { NetworkMember } from "@/types/network"
import { NetworkTreeView } from "@/components/network/network-tree-view"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Users, TrendingUp, DollarSign } from "lucide-react"

interface NetworkDetailModalProps {
  isOpen: boolean
  onClose: () => void
  influencer: NetworkMember
}

export function NetworkDetailModal({ isOpen, onClose, influencer }: NetworkDetailModalProps) {
  // Calcular métricas da rede
  const calculateNetworkMetrics = (member: NetworkMember) => {
    let totalMembers = 0
    let totalEarnings = member.totalEarnings || 0

    const countMembers = (node: NetworkMember) => {
      if (node.children) {
        totalMembers += node.children.length
        node.children.forEach((child) => {
          totalEarnings += child.totalEarnings || 0
          countMembers(child)
        })
      }
    }

    countMembers(member)

    return {
      totalMembers,
      totalEarnings,
      averageEarnings: totalMembers > 0 ? totalEarnings / totalMembers : 0,
    }
  }

  const metrics = calculateNetworkMetrics(influencer)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A2430] border-[#366D51] text-white max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Detalhes da Rede do Influencer</DialogTitle>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="h-6 w-6 text-[#9FFF00]" />
                Rede de {influencer.name}
              </h2>
              <p className="text-gray-400">Visualização detalhada da rede do influencer</p>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#232A34] border-[#366D51] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Membros</p>
                  <h3 className="text-2xl font-bold text-white">{metrics.totalMembers}</h3>
                </div>
                <Users className="h-8 w-8 text-[#9FFF00]" />
              </div>
            </Card>

            <Card className="bg-[#232A34] border-[#366D51] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Faturamento Total</p>
                  <h3 className="text-2xl font-bold text-white">{formatCurrency(metrics.totalEarnings)}</h3>
                </div>
                <DollarSign className="h-8 w-8 text-[#9FFF00]" />
              </div>
            </Card>

            <Card className="bg-[#232A34] border-[#366D51] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Média por Membro</p>
                  <h3 className="text-2xl font-bold text-white">{formatCurrency(metrics.averageEarnings)}</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-[#9FFF00]" />
              </div>
            </Card>
          </div>

          {/* Árvore da Rede */}
          <div className="bg-[#232A34] border border-[#366D51] rounded-lg p-4">
            <NetworkTreeView member={influencer} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 