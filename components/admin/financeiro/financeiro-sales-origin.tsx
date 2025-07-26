"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function FinanceiroSalesOrigin() {
  return (
    <Card className="bg-[#232A34] border-[#366D51] shadow-lg">
      <CardContent className="p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Origem de Vendas</h3>
        <p className="text-gray-400">
          Conteúdo da aba "Origem de Vendas". Aqui você poderá ver a tabela de origem das vendas por edição.
        </p>
        {/* Placeholder for table */}
        <div className="mt-4 p-4 border border-dashed border-[#366D51] rounded-md text-gray-500 text-center">
          Tabela de Origem de Vendas (Origem, Números Vendidos, Receita Gerada, % da Receita Total)
        </div>
      </CardContent>
    </Card>
  )
}
