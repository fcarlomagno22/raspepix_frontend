"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function FinanceiroTransactions() {
  return (
    <Card className="bg-[#232A34] border-[#366D51] shadow-lg">
      <CardContent className="p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Transações</h3>
        <p className="text-gray-400">
          Conteúdo da aba "Transações". Aqui você poderá ver a tabela de transações (depósitos/saques) com busca, filtro
          por tipo e paginação.
        </p>
        {/* Placeholder for table */}
        <div className="mt-4 p-4 border border-dashed border-[#366D51] rounded-md text-gray-500 text-center">
          Tabela de Transações (Usuário, CPF, Tipo, Valor, Status, Data)
        </div>
      </CardContent>
    </Card>
  )
}
