"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Clock } from "lucide-react"
import { InfluencerWithdrawModal } from "./influencer-withdraw-modal"
import { useInfluencerDashboard } from "@/hooks/use-influencer-dashboard"
import { useWithdrawRequests } from "@/hooks/use-withdraw-requests"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export function WithdrawBalanceCard() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const { data, isLoading, error } = useInfluencerDashboard()
  const { pendingWithdraws, isLoading: isLoadingWithdraws, error: withdrawError } = useWithdrawRequests()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-[#1E2530] border-gray-700 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-[#9FFF00]/20 p-3 rounded-full mb-4">
            <Wallet className="h-6 w-6 text-[#9FFF00]" />
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">
            Comissões de sua Rede
          </h3>
          
          <p className="text-3xl font-bold text-white mb-2">
            {isLoading ? "..." : error ? "Erro ao carregar" : formatCurrency(data?.saldo_disponivel || 0)}
          </p>

          <div className="w-full max-w-xs mb-4">
            <Separator className="my-4 bg-gray-700" />
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                <span>Saques em Análise:</span>
              </div>
              <span className="text-yellow-500 font-semibold">
                {isLoadingWithdraws ? "..." : withdrawError ? "-" : formatCurrency(pendingWithdraws)}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">Erro ao carregar os dados. Tente novamente mais tarde.</p>
          )}

          <Button 
            onClick={() => setShowWithdrawModal(true)}
            className="w-full max-w-xs py-6 text-lg font-semibold rounded-full bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 hover:from-yellow-600 hover:via-yellow-700 hover:to-yellow-800 text-white shadow-lg"
          >
            Sacar
          </Button>
        </div>
      </Card>

      <InfluencerWithdrawModal 
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />
    </motion.div>
  )
}