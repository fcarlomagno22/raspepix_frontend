"use client"

import { useState, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Trash2 } from "lucide-react" // Importar o ícone de lixeira

interface DREData {
  id: string
  name: string
  period: string
  receitaBruta: number
  deducoesReceita: number
  receitaLiquida: number
  custoDosServicos: number // Prêmios Pagos
  lucroBruto: number
  despesasOperacionais: {
    capitalizadora: number
    influenciadores: number
    afiliados: number
    doacoes: number
    trafegoPago: number
    taxasPix: number
    outrasDespesas: number
    // despesasManuais: number; // Removido daqui
  }
  totalDespesasOperacionais: number
  resultadoAntesImpostos: number
  impostos: number
  resultadoLiquido: number
}

export default function FinanceiroDRE() {
  const [selectedEdition, setSelectedEdition] = useState("all")
  const [manualExpenses, setManualExpenses] = useState<{ description: string; amount: number }[]>([])
  const [newExpenseDescription, setNewExpenseDescription] = useState("")
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>("R$ 0,00") // Inicializa com o formato
  const [newExpenseNumericAmount, setNewExpenseNumericAmount] = useState<number>(0) // Valor numérico em centavos

  const dreTableRef = useRef<HTMLDivElement>(null) // Ref para a tabela DRE

  // Mock data for DRE
  const mockDREData: DREData[] = [
    {
      id: "e1",
      name: "Edição #1 - Verão Premiado",
      period: "01/01/2024 - 07/01/2024",
      receitaBruta: 500000,
      deducoesReceita: 0,
      receitaLiquida: 500000,
      custoDosServicos: 200000, // Prêmios Pagos
      lucroBruto: 300000,
      despesasOperacionais: {
        capitalizadora: 50000,
        influenciadores: 20000,
        afiliados: 15000,
        doacoes: 5000,
        trafegoPago: 10000,
        taxasPix: 2000,
        outrasDespesas: 8000,
        // despesasManuais: 0, // Removido
      },
      totalDespesasOperacionais: 110000,
      resultadoAntesImpostos: 190000,
      impostos: 50000,
      resultadoLiquido: 140000,
    },
    {
      id: "e2",
      name: "Edição #2 - Carnaval da Sorte",
      period: "08/01/2024 - 14/01/2024",
      receitaBruta: 750000,
      deducoesReceita: 0,
      receitaLiquida: 750000,
      custoDosServicos: 300000,
      lucroBruto: 450000,
      despesasOperacionais: {
        capitalizadora: 75000,
        influenciadores: 30000,
        afiliados: 20000,
        doacoes: 7500,
        trafegoPago: 15000,
        taxasPix: 3000,
        outrasDespesas: 10000,
        // despesasManuais: 0, // Removido
      },
      totalDespesasOperacionais: 160500,
      resultadoAntesImpostos: 289500,
      impostos: 75000,
      resultadoLiquido: 214500,
    },
    {
      id: "e3",
      name: "Edição #3 - Páscoa Dourada",
      period: "15/01/2024 - 21/01/2024",
      receitaBruta: 600000,
      deducoesReceita: 0,
      receitaLiquida: 600000,
      custoDosServicos: 250000,
      lucroBruto: 350000,
      despesasOperacionais: {
        capitalizadora: 60000,
        influenciadores: 25000,
        afiliados: 18000,
        doacoes: 6000,
        trafegoPago: 12000,
        taxasPix: 2500,
        outrasDespesas: 9000,
        // despesasManuais: 0, // Removido
      },
      totalDespesasOperacionais: 132500,
      resultadoAntesImpostos: 217500,
      impostos: 60000,
      resultadoLiquido: 157500,
    },
  ]

  const aggregatedDRE: DREData = useMemo(() => {
    const baseDRE =
      selectedEdition === "all"
        ? mockDREData.reduce(
            (acc, curr) => ({
              ...acc,
              receitaBruta: acc.receitaBruta + curr.receitaBruta,
              deducoesReceita: acc.deducoesReceita + curr.deducoesReceita,
              receitaLiquida: acc.receitaLiquida + curr.receitaLiquida,
              custoDosServicos: acc.custoDosServicos + curr.custoDosServicos,
              lucroBruto: acc.lucroBruto + curr.lucroBruto,
              despesasOperacionais: {
                capitalizadora: acc.despesasOperacionais.capitalizadora + curr.despesasOperacionais.capitalizadora,
                influenciadores: acc.despesasOperacionais.influenciadores + curr.despesasOperacionais.influenciadores,
                afiliados: acc.despesasOperacionais.afiliados + curr.despesasOperacionais.afiliados,
                doacoes: acc.despesasOperacionais.doacoes + curr.despesasOperacionais.doacoes,
                trafegoPago: acc.despesasOperacionais.trafegoPago + curr.despesasOperacionais.trafegoPago,
                taxasPix: acc.despesasOperacionais.taxasPix + curr.despesasOperacionais.taxasPix,
                outrasDespesas: acc.despesasOperacionais.outrasDespesas + curr.despesasOperacionais.outrasDespesas,
                // despesasManuais: acc.despesasOperacionais.despesasManuais + curr.despesasOperacionais.despesasManuais, // Removido
              },
              totalDespesasOperacionais: acc.totalDespesasOperacionais + curr.totalDespesasOperacionais,
              resultadoAntesImpostos: acc.resultadoAntesImpostos + curr.resultadoAntesImpostos,
              impostos: acc.impostos + curr.impostos,
              resultadoLiquido: acc.resultadoLiquido + curr.resultadoLiquido,
            }),
            {
              id: "all",
              name: "Todas as Edições",
              period: "Total",
              receitaBruta: 0,
              deducoesReceita: 0,
              receitaLiquida: 0,
              custoDosServicos: 0,
              lucroBruto: 0,
              despesasOperacionais: {
                capitalizadora: 0,
                influenciadores: 0,
                afiliados: 0,
                doacoes: 0,
                trafegoPago: 0,
                taxasPix: 0,
                outrasDespesas: 0,
                // despesasManuais: 0, // Removido
              },
              totalDespesasOperacionais: 0,
              resultadoAntesImpostos: 0,
              impostos: 0,
              resultadoLiquido: 0,
            },
          )
        : mockDREData.find((d) => d.id === selectedEdition) || mockDREData[0]

    const totalManualExpenses = manualExpenses.reduce((sum, exp) => sum + exp.amount, 0)

    // A despesa manual não é mais adicionada a despesasOperacionais.despesasManuais
    const updatedDespesasOperacionais = {
      ...baseDRE.despesasOperacionais,
      // despesasManuais: baseDRE.despesasOperacionais.despesasManuais + totalManualExpenses, // Removido
    }

    const updatedTotalDespesasOperacionais =
      updatedDespesasOperacionais.capitalizadora +
      updatedDespesasOperacionais.influenciadores +
      updatedDespesasOperacionais.afiliados +
      updatedDespesasOperacionais.doacoes +
      updatedDespesasOperacionais.trafegoPago +
      updatedDespesasOperacionais.taxasPix +
      updatedDespesasOperacionais.outrasDespesas
    // + updatedDespesasOperacionais.despesasManuais // Removido

    const updatedResultadoAntesImpostos = baseDRE.lucroBruto - updatedTotalDespesasOperacionais - totalManualExpenses // Subtrai despesas manuais separadamente
    const updatedResultadoLiquido = updatedResultadoAntesImpostos - baseDRE.impostos

    return {
      ...baseDRE,
      despesasOperacionais: updatedDespesasOperacionais,
      totalDespesasOperacionais: updatedTotalDespesasOperacionais,
      resultadoAntesImpostos: updatedResultadoAntesImpostos,
      resultadoLiquido: updatedResultadoLiquido,
    }
  }, [selectedEdition, mockDREData, manualExpenses])

  const handleAddManualExpense = () => {
    // Usa newExpenseNumericAmount diretamente, convertendo de centavos para float
    const amount = newExpenseNumericAmount / 100
    if (newExpenseDescription && amount > 0) {
      setManualExpenses([...manualExpenses, { description: newExpenseDescription, amount }])
      setNewExpenseDescription("")
      setNewExpenseAmount("R$ 0,00") // Reseta o valor formatado
      setNewExpenseNumericAmount(0) // Reseta o valor numérico também
    }
  }

  const handleDeleteExpense = (indexToDelete: number) => {
    setManualExpenses(manualExpenses.filter((_, index) => index !== indexToDelete))
  }

  const handleExportPdf = () => {
    if (dreTableRef.current) {
      html2canvas(dreTableRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const imgWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        let position = 0

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }

        pdf.save("DRE_Raspepix.pdf")
      })
    }
  }

  const renderRow = (label: string, value: number, isBold = false, isResult = false) => (
    <TableRow className="border-[#366D51]">
      <TableCell className={`text-left ${isBold ? "font-bold text-white" : "text-gray-300"}`}>{label}</TableCell>
      <TableCell
        className={`text-right ${isBold ? "font-bold text-white" : "text-gray-300"} ${
          isResult && value < 0 ? "text-red-500" : isResult && value > 0 ? "text-[#9FFF00]" : ""
        }`}
      >
        {formatCurrency(value)}
      </TableCell>
    </TableRow>
  )

  return (
    <Card className="bg-[#232A34] border-[#366D51] shadow-md mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Demonstrativo de Resultado do Exercício (DRE)</CardTitle>
        <Select value={selectedEdition} onValueChange={setSelectedEdition}>
          <SelectTrigger className="w-full sm:w-[280px] bg-[#232A34] border-[#366D51] text-white">
            <SelectValue placeholder="Selecione a Edição" />
          </SelectTrigger>
          <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
            <SelectItem value="all">Todas as Edições</SelectItem>
            {mockDREData.map((edition) => (
              <SelectItem key={edition.id} value={edition.id}>
                {edition.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border border-[#366D51] rounded-lg bg-[#191F26]">
          <h3 className="text-white text-lg font-semibold mb-3">Adicionar Despesa Manual</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="Descrição da Despesa"
              value={newExpenseDescription}
              onChange={(e) => setNewExpenseDescription(e.target.value)}
              className="bg-[#232A34] border-[#366D51] text-white placeholder:text-gray-400"
            />
            <Input
              placeholder="Valor (ex: 100.00)"
              type="text"
              value={newExpenseAmount}
              onChange={(e) => {
                const raw = e.target.value

                // Remove tudo que não for número
                const numeros = raw.replace(/\D/g, "")

                // Impede que valores vazios travem o campo
                if (numeros.length === 0) {
                  setNewExpenseAmount("R$ 0,00")
                  setNewExpenseNumericAmount(0)
                  return
                }

                // Converte para número em centavos
                const valorCentavos = Number.parseInt(numeros, 10)

                // Atualiza o valor limpo
                setNewExpenseNumericAmount(valorCentavos)

                // Formata para BRL (divide por 100 para reais)
                const formatado = new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(valorCentavos / 100)

                setNewExpenseAmount(formatado)
              }}
              inputMode="numeric" // Adicionado para teclado numérico em mobile
              className="bg-[#232A34] border-[#366D51] text-white placeholder:text-gray-400"
            />
            <Button onClick={handleAddManualExpense} className="bg-[#9FFF00] text-[#232A34] hover:bg-[#88ee00]">
              Adicionar Despesa
            </Button>
          </div>
          {/* Removido o bloco de exibição de despesas manuais aqui */}
        </div>

        <div ref={dreTableRef} className="overflow-x-auto">
          {" "}
          {/* Adicione o ref aqui */}
          <Table>
            <TableHeader className="bg-[#191F26]">
              <TableRow className="border-[#366D51]">
                <TableHead className="text-white text-left">Descrição</TableHead>
                <TableHead className="text-white text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#232A34]">
              {renderRow("Receita Bruta", aggregatedDRE.receitaBruta, true)}
              {renderRow("(-) Deduções da Receita", aggregatedDRE.deducoesReceita)}
              {renderRow("= Receita Líquida", aggregatedDRE.receitaLiquida, true)}
              {renderRow("(-) Custo dos Serviços (Prêmios Pagos)", aggregatedDRE.custoDosServicos)}
              {renderRow("= Lucro Bruto", aggregatedDRE.lucroBruto, true)}
              <TableRow className="border-[#366D51]">
                <TableCell colSpan={2} className="text-white font-bold text-left pt-4">
                  Despesas Operacionais
                </TableCell>
              </TableRow>
              {renderRow("Capitalizadora", aggregatedDRE.despesasOperacionais.capitalizadora)}
              {renderRow("Influenciadores", aggregatedDRE.despesasOperacionais.influenciadores)}
              {renderRow("Afiliados", aggregatedDRE.despesasOperacionais.afiliados)}
              {renderRow("Doações", aggregatedDRE.despesasOperacionais.doacoes)}
              {renderRow("Tráfego Pago", aggregatedDRE.despesasOperacionais.trafegoPago)}
              {renderRow("Taxas PIX", aggregatedDRE.despesasOperacionais.taxasPix)}
              {renderRow("Outras Despesas", aggregatedDRE.despesasOperacionais.outrasDespesas)}
              {/* Removido: {renderRow("Despesas Manuais", aggregatedDRE.despesasOperacionais.despesasManuais)} */}
              {renderRow("Total Despesas Operacionais", aggregatedDRE.totalDespesasOperacionais, true)}

              {/* Nova Seção: Despesas Extras */}
              {manualExpenses.length > 0 && (
                <>
                  <TableRow className="border-[#366D51]">
                    <TableCell colSpan={2} className="text-white font-bold text-left pt-4">
                      Despesas Extras
                    </TableCell>
                  </TableRow>
                  {manualExpenses.map((exp, index) => (
                    <TableRow key={index} className="border-[#366D51]">
                      <TableCell className="text-left text-gray-300 flex items-center justify-between">
                        {exp.description}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right text-gray-300">{formatCurrency(exp.amount)}</TableCell>
                    </TableRow>
                  ))}
                  {renderRow(
                    "Total Despesas Extras",
                    manualExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                    true,
                  )}
                </>
              )}

              {renderRow("= Resultado Antes dos Impostos", aggregatedDRE.resultadoAntesImpostos, true)}
              {renderRow("(-) Impostos", aggregatedDRE.impostos)}
              {renderRow("= Resultado Líquido do Exercício", aggregatedDRE.resultadoLiquido, true, true)}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleExportPdf} className="bg-[#9FFF00] text-[#232A34] hover:bg-[#88ee00]">
            Exportar DRE em PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
