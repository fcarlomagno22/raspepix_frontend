"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function FinanceiroCommissions() {
  return (
    <Card className="bg-[#232A34] border-[#366D51] shadow-lg">
      <CardContent className="p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Comissões de Afiliados</h3>
        <p className="text-gray-400">
          Conteúdo da aba "Comissões". Aqui você poderá ver a tabela de comissões de afiliados com busca e paginação.
        </p>
        {/* Placeholder for table */}
        <div className="mt-4 p-4 border border-dashed border-[#366D51] rounded-md text-gray-500 text-center">
          Tabela de Comissões (Afiliado, Usuário Referido, Valor Depositado, Comissão, Data)
        </div>
      </CardContent>
    </Card>
  )
}
