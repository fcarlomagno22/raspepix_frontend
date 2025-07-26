"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket } from "lucide-react"

interface ScratchCardStatsProps {
  activeCount: number
  wonCount: number
  lostCount: number
}

export default function ScratchCardStats({ activeCount, wonCount, lostCount }: ScratchCardStatsProps) {
  const total = activeCount + wonCount + lostCount // Assuming total is sum of these for percentage calculation

  const activePercentage = total > 0 ? ((activeCount / total) * 100).toFixed(1) : "0.0"
  const wonPercentage = total > 0 ? ((wonCount / total) * 100).toFixed(1) : "0.0"
  const lostPercentage = total > 0 ? ((lostCount / total) * 100).toFixed(1) : "0.0"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-[#1A2430] border-[#9FFF00]/10 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Raspadinhas Ativas</CardTitle>
          <Ticket className="h-4 w-4 text-[#9FFF00]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-gray-400 mt-1">{activePercentage}% do total</p>
        </CardContent>
      </Card>
      <Card className="bg-[#1A2430] border-[#FF0000]/10 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Raspadinhas Ganhas</CardTitle>
          <Ticket className="h-4 w-4 text-[#FF0000]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{wonCount}</div>
          <p className="text-xs text-gray-400 mt-1">{wonPercentage}% do total</p>
        </CardContent>
      </Card>
      <Card className="bg-[#1A2430] border-[#0000FF]/10 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Raspadinhas Perdidas</CardTitle>
          <Ticket className="h-4 w-4 text-[#0000FF]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lostCount}</div>
          <p className="text-xs text-gray-400 mt-1">{lostPercentage}% do total</p>
        </CardContent>
      </Card>
    </div>
  )
}
