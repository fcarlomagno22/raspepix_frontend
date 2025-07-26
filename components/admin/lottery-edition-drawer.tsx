"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Plus, Loader2, CheckCircle2, Download } from "lucide-react" // Added Download icon

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  cn,
  formatNumberWithThousandsSeparator,
  parseNumberFromFormattedString,
  formatNumberWithDecimalSeparator,
  parseNumberFromDecimalFormattedString,
  exportToCsv, // Imported exportToCsv
} from "@/lib/utils"
import type { LotteryEdition } from "@/lib/mock-lottery-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import Cookies from 'js-cookie'
import { api } from '@/services/api'

// --- Helper function to generate instant prizes ---
const generateInstantPrizes = (
  totalInstantPrizesValue: number, // Expected in reais (e.g., 300.00)
  numPrizesToDistribute: number,
  minPrizeValue: number, // Expected in reais (e.g., 0.50)
  maxPrizeValue: number, // Expected in reais (e.g., 1000.00)
): number[] => {
  if (numPrizesToDistribute === 0) return []

  const prizes: number[] = []
  let currentSum = 0
  let remainingPrizesCount = numPrizesToDistribute

  // 1. Allocate two R$ 1000 prizes if possible and within maxPrizeValue
  const numThousandPrizes = 2
  const thousandPrizeValue = 1000.0

  if (
    remainingPrizesCount >= numThousandPrizes &&
    totalInstantPrizesValue - currentSum >= numThousandPrizes * thousandPrizeValue &&
    maxPrizeValue >= thousandPrizeValue
  ) {
    for (let i = 0; i < numThousandPrizes; i++) {
      prizes.push(thousandPrizeValue)
      currentSum = Number.parseFloat((currentSum + thousandPrizeValue).toFixed(2))
    }
    remainingPrizesCount -= numThousandPrizes
  }

  // Define a pool of common prize values
  const commonPrizePool: number[] = []
  // R$ 0,50, R$ 1,00, R$ 1,50 até R$ 25,00 (increments of 0.50)
  for (let i = 0.5; i <= 25.0; i += 0.5) {
    commonPrizePool.push(Number.parseFloat(i.toFixed(2)))
    commonPrizePool.push(Number.parseFloat(i.toFixed(2))) // Add twice for higher probability
  }
  // R$ 50,00, 100, 200, 500
  commonPrizePool.push(50.0, 100.0, 200.0, 500.0)

  // Filter prizePool to respect min/max values
  const validPrizePool = commonPrizePool.filter((p) => p >= minPrizeValue && p <= maxPrizeValue)

  // Fallback if no valid prizes can be generated from the pool (e.g., min/max are too restrictive)
  if (validPrizePool.length === 0 && remainingPrizesCount > 0) {
    if (minPrizeValue <= maxPrizeValue) {
      validPrizePool.push(minPrizeValue) // Use min value as a fallback
    } else {
      console.error("Min prize value is greater than max prize value, cannot generate prizes.")
      return []
    }
  }

  // 2. Distribute remaining prizes
  for (let i = 0; i < remainingPrizesCount; i++) {
    let prizeCandidate: number
    if (validPrizePool.length > 0) {
      prizeCandidate = validPrizePool[Math.floor(Math.random() * validPrizePool.length)]
    } else {
      prizeCandidate = minPrizeValue // Should not happen if validPrizePool is handled above
    }

    // Ensure prizeCandidate doesn't exceed remaining budget or maxPrizeValue
    prizeCandidate = Math.min(prizeCandidate, maxPrizeValue)
    prizeCandidate = Math.max(prizeCandidate, minPrizeValue) // Ensure it's not below min

    prizes.push(Number.parseFloat(prizeCandidate.toFixed(2)))
    currentSum = Number.parseFloat((currentSum + prizeCandidate).toFixed(2))
  }

  // 3. Adjust to meet total sum and stay within bounds
  let difference = Number.parseFloat((totalInstantPrizesValue - currentSum).toFixed(2))
  let adjustmentAttempts = 0
  const maxAdjustmentAttempts = numPrizesToDistribute * 20 // Increased attempts for better convergence

  while (Math.abs(difference) > 0.01 && adjustmentAttempts < maxAdjustmentAttempts) {
    const randomIndex = Math.floor(Math.random() * prizes.length)
    const prize = prizes[randomIndex]

    const maxPossibleIncrease = Number.parseFloat((maxPrizeValue - prize).toFixed(2))
    const maxPossibleDecrease = Number.parseFloat((prize - minPrizeValue).toFixed(2))

    let amountToAdjust = 0

    if (difference > 0) {
      // Need to increase sum
      amountToAdjust = Math.min(
        difference,
        maxPossibleIncrease,
        Number.parseFloat((Math.random() * (maxPrizeValue - minPrizeValue) * 0.1).toFixed(2)), // Small random increment
      )
    } else {
      // Need to decrease sum
      amountToAdjust = Math.min(
        Math.abs(difference),
        maxPossibleDecrease,
        Number.parseFloat((Math.random() * (maxPrizeValue - minPrizeValue) * 0.1).toFixed(2)), // Small random decrement
      )
      amountToAdjust *= -1 // Make it negative for subtraction
    }

    if (Math.abs(amountToAdjust) > 0.01) {
      prizes[randomIndex] = Number.parseFloat((prize + amountToAdjust).toFixed(2))
      difference = Number.parseFloat((difference - amountToAdjust).toFixed(2))
    }
    adjustmentAttempts++
  }

  // Final clamping and rounding to ensure all values are within bounds and correctly formatted
  const finalPrizes = prizes.map((p) =>
    Number.parseFloat(Math.max(minPrizeValue, Math.min(maxPrizeValue, p)).toFixed(2)),
  )

  // One last tiny adjustment if sum is still off due to floating point or clamping
  const finalSumCheck = finalPrizes.reduce((sum, p) => sum + p, 0)
  let finalDifferenceCheck = Number.parseFloat((totalInstantPrizesValue - finalSumCheck).toFixed(2))

  if (Math.abs(finalDifferenceCheck) > 0.01) {
    for (let i = 0; i < finalPrizes.length && Math.abs(finalDifferenceCheck) > 0.01; i++) {
      const prize = finalPrizes[i]
      const maxIncrease = Number.parseFloat((maxPrizeValue - prize).toFixed(2))
      const maxDecrease = Number.parseFloat((prize - minPrizeValue).toFixed(2))

      if (finalDifferenceCheck > 0) {
        const add = Math.min(finalDifferenceCheck, maxIncrease)
        if (add > 0.01) {
          // Only adjust if significant
          finalPrizes[i] = Number.parseFloat((prize + add).toFixed(2))
          finalDifferenceCheck = Number.parseFloat((finalDifferenceCheck - add).toFixed(2))
        }
      } else {
        const subtract = Math.min(Math.abs(finalDifferenceCheck), maxDecrease)
        if (subtract > 0.01) {
          // Only adjust if significant
          finalPrizes[i] = Number.parseFloat((prize - subtract).toFixed(2))
          finalDifferenceCheck = Number.parseFloat((finalDifferenceCheck + subtract).toFixed(2))
        }
      }
    }
  }

  return finalPrizes.sort((a, b) => a - b)
}

// --- Zod Schema for Form Validation ---
const formSchema = z.object({
  name: z.string().min(1, "Nome da edição é obrigatório."),
  lotteryPrize: z.coerce.number().min(0, "Prêmio do sorteio deve ser um valor positivo."),
  instantPrizes: z.coerce.number().min(0, "Prêmios instantâneos devem ser um valor positivo."),
  startDate: z.date({ required_error: "Data de início é obrigatória." }),
  endDate: z.date({ required_error: "Data de encerramento é obrigatória." }),
  status: z.literal("futuro").or(z.literal("ativo")).or(z.literal("encerrado")).default("futuro"),
  totalInstantTicketsToCreate: z.coerce
    .number()
    .min(1, "Total de títulos instantâneos é obrigatório.")
    .max(10000000, "Máximo de 10.000.000 títulos."),
  numInstantPrizesToDistribute: z.coerce.number().min(0, "Número de prêmios a distribuir é obrigatório."),
  minInstantPrizeValue: z.coerce.number().min(0, "Valor mínimo do prêmio é obrigatório."),
  maxInstantPrizeValue: z.coerce.number().min(0, "Valor máximo do prêmio é obrigatório."),
  generatedInstantPrizes: z.array(z.number()).optional(),
  capitalizadoraWinningNumbersInput: z.string().optional(),
  capitalizadoraNumbers: z
    .array(
      z.object({
        number: z.string(),
        isPrize: z.boolean(),
        prizeValue: z.string().optional(),
      }),
    )
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

interface LotteryEditionModalProps {
  isOpen: boolean
  onClose: () => void
  edition?: LotteryEdition | null
  onSave: (data: FormValues) => void
}

export default function LotteryEditionModal({ isOpen, onClose, edition, onSave }: LotteryEditionModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("general-info")
  const [importedCapitalizadoraFileContent, setImportedCapitalizadoraFileContent] = useState<string | null>(null)
  const [generatedPrizeTickets, setGeneratedPrizeTickets] = useState<
    { ticketNumber: string; prizeValue: number }[]
  >([])

  // Estados para paginação
  const [currentInstantPrizePage, setCurrentInstantPrizePage] = useState(1)
  const [currentCapitalizadoraPage, setCurrentCapitalizadoraPage] = useState(1)
  const itemsPerPage = 1000 // Alterado de 100 para 1000

  // Funções para paginação
  const getPaginatedData = (data: any[], page: number) => {
    const start = (page - 1) * itemsPerPage
    const end = start + itemsPerPage
    return data.slice(start, end)
  }

  const getTotalPages = (totalItems: number) => Math.ceil(totalItems / itemsPerPage)

  // Funções de navegação
  const handlePrizePageChange = (page: number) => setCurrentInstantPrizePage(page)
  const handleCapitalizadoraPageChange = (page: number) => setCurrentCapitalizadoraPage(page)

  // Memoized function for generating capitalizadora numbers for display
  const displayedCapitalizadoraNumbers = useMemo(() => {
    if (!importedCapitalizadoraFileContent) return []

    const numbers: { number: string; isPrize: boolean; prizeValue?: string; isUsed: boolean }[] = []
    
    // Separar por linhas e processar cada linha
    const lines = importedCapitalizadoraFileContent
      .split(/[\n,]/) // Separar por nova linha ou vírgula
      .map(line => line.trim())
      .filter(line => line.length > 0)

    lines.forEach(line => {
      // Primeiro tenta separar por ponto e vírgula
      const parts = line.split(';')
      
      if (parts.length >= 1) {
        const number = parts[0].trim().padStart(8, '0') // Garante 8 dígitos
        
        // Verifica se é um número premiado (tem 3 partes) ou não premiado (tem 2 partes)
        if (parts.length === 3 && parts[2].trim() === 'Premiado') {
          numbers.push({
            number,
            isPrize: true,
            prizeValue: `R$ ${parseFloat(parts[1]).toFixed(2)}`,
            isUsed: false // Inicialmente nenhum número está usado
          })
        } else {
          // Se não tem 3 partes ou não é premiado, considera como não premiado
          numbers.push({
            number,
            isPrize: false,
            prizeValue: undefined,
            isUsed: false
          })
        }
      }
    })

    // Ordenar por número
    return numbers.sort((a, b) => a.number.localeCompare(b.number))
  }, [importedCapitalizadoraFileContent])

  // Dados paginados
  const paginatedPrizeTickets = useMemo(
    () => getPaginatedData(generatedPrizeTickets, currentInstantPrizePage),
    [generatedPrizeTickets, currentInstantPrizePage]
  )

  const paginatedCapitalizadoraNumbers = useMemo(
    () => getPaginatedData(displayedCapitalizadoraNumbers, currentCapitalizadoraPage),
    [displayedCapitalizadoraNumbers, currentCapitalizadoraPage]
  )

  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lotteryPrize: 0,
      instantPrizes: 0,
      startDate: new Date(),
      endDate: new Date(),
      status: "futuro",
      totalInstantTicketsToCreate: 1000000, // Default to 1 million
      numInstantPrizesToDistribute: 0,
      minInstantPrizeValue: 0,
      maxInstantPrizeValue: 0,
      generatedInstantPrizes: [],
      capitalizadoraWinningNumbersInput: "",
      capitalizadoraNumbers: [],
    },
  })

  // States for display values (formatted strings)
  const [lotteryPrizeDisplayValue, setLotteryPrizeDisplayValue] = useState("")
  const [instantPrizesDisplayValue, setInstantPrizesDisplayValue] = useState("")
  const [minInstantPrizeValueDisplayValue, setMinInstantPrizeValueDisplayValue] = useState("")
  const [maxInstantPrizeValueDisplayValue, setMaxInstantPrizeValueDisplayValue] = useState("")

  // Effect to populate form and display states when editing an existing edition
  useEffect(() => {
    if (edition) {
      form.reset({
        ...edition,
        startDate: new Date(edition.startDate),
        endDate: new Date(edition.endDate),
        totalInstantTicketsToCreate: edition.totalInstantTicketsToCreate,
        numInstantPrizesToDistribute: edition.numInstantPrizesToDistribute,
        minInstantPrizeValue: edition.minInstantPrizeValue,
        maxInstantPrizeValue: edition.maxInstantPrizeValue,
        generatedInstantPrizes: edition.generatedInstantPrizes,
        capitalizadoraWinningNumbersInput: edition.capitalizadoraWinningNumbersInput,
        capitalizadoraNumbers: edition.capitalizadoraNumbers,
      })
      // Set display values for existing edition
      setLotteryPrizeDisplayValue(formatNumberWithDecimalSeparator(edition.lotteryPrize))
      setInstantPrizesDisplayValue(formatNumberWithDecimalSeparator(edition.instantPrizes))
      setMinInstantPrizeValueDisplayValue(formatNumberWithDecimalSeparator(edition.minInstantPrizeValue))
      setMaxInstantPrizeValueDisplayValue(formatNumberWithDecimalSeparator(edition.maxInstantPrizeValue))

      if (edition.capitalizadoraWinningNumbersInput) {
        setImportedCapitalizadoraFileContent(edition.capitalizadoraWinningNumbersInput)
      }
      // Re-generate prize tickets for display if generatedInstantPrizes exists
      if (edition.generatedInstantPrizes && edition.generatedInstantPrizes.length > 0) {
        const totalTicketsRange = edition.totalInstantTicketsToCreate
        const uniqueTicketNumbers = new Set<string>()
        const actualNumPrizes = Math.min(edition.numInstantPrizesToDistribute, totalTicketsRange)

        while (uniqueTicketNumbers.size < actualNumPrizes) {
          const randomNumber = Math.floor(Math.random() * totalTicketsRange) + 1
          uniqueTicketNumbers.add(String(randomNumber).padStart(8, "0"))
        }

        const newGeneratedPrizeTickets = Array.from(uniqueTicketNumbers)
          .sort()
          .map((ticketNum, index) => ({
            ticketNumber: ticketNum,
            prizeValue: edition.generatedInstantPrizes[index] || 0,
          }))
        setGeneratedPrizeTickets(newGeneratedPrizeTickets)
      } else {
        setGeneratedPrizeTickets([])
      }
    } else {
      form.reset({
        name: "",
        lotteryPrize: 0,
        instantPrizes: 0,
        startDate: new Date(),
        endDate: new Date(),
        status: "futuro",
        totalInstantTicketsToCreate: 1000000,
        numInstantPrizesToDistribute: 0,
        minInstantPrizeValue: 0,
        maxInstantPrizeValue: 0,
        generatedInstantPrizes: [],
        capitalizadoraWinningNumbersInput: "",
        capitalizadoraNumbers: [],
      })
      // Clear display values on new edition
      setLotteryPrizeDisplayValue("")
      setInstantPrizesDisplayValue("")
      setMinInstantPrizeValueDisplayValue("")
      setMaxInstantPrizeValueDisplayValue("")

      setImportedCapitalizadoraFileContent(null)
      setGeneratedPrizeTickets([])
    }
  }, [edition, form])

  // Handle file upload for capitalizadora numbers
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setImportedCapitalizadoraFileContent(content)
          form.setValue("capitalizadoraWinningNumbersInput", content, { shouldValidate: true })
        }
        reader.readAsText(file)
      } else {
        setImportedCapitalizadoraFileContent(null)
        form.setValue("capitalizadoraWinningNumbersInput", "", { shouldValidate: true })
      }
    },
    [form],
  )

  const handleGenerateInstantPrizes = () => {
    // Get values from form (these are already numbers)
    const totalValueReais = form.getValues("instantPrizes") || 0
    const numPrizes = form.getValues("numInstantPrizesToDistribute") || 0
    const minValReais = form.getValues("minInstantPrizeValue") || 0
    const maxValReais = form.getValues("maxInstantPrizeValue") || 0

    // Clear previous errors related to prize generation
    form.clearErrors(["numInstantPrizesToDistribute", "minInstantPrizeValue", "maxInstantPrizeValue"])

    // Validações básicas
    if (totalValueReais <= 0) {
      form.setError("numInstantPrizesToDistribute", {
        type: "manual",
        message: "Por favor, defina o Valor Total dos Prêmios Instantâneos na aba Informações Gerais.",
      })
      form.setValue("generatedInstantPrizes", [])
      setGeneratedPrizeTickets([])
      return
    }

    if (numPrizes <= 0) {
      form.setError("numInstantPrizesToDistribute", {
        type: "manual",
        message: "O número de prêmios deve ser maior que zero.",
      })
      form.setValue("generatedInstantPrizes", [])
      setGeneratedPrizeTickets([])
      return
    }

    if (minValReais <= 0) {
      form.setError("minInstantPrizeValue", {
        type: "manual",
        message: "O valor mínimo do prêmio deve ser maior que zero.",
      })
      form.setValue("generatedInstantPrizes", [])
      setGeneratedPrizeTickets([])
      return
    }

    if (maxValReais <= 0 || maxValReais < minValReais) {
      form.setError("maxInstantPrizeValue", {
        type: "manual",
        message: "O valor máximo do prêmio deve ser maior que o valor mínimo.",
      })
      form.setValue("generatedInstantPrizes", [])
      setGeneratedPrizeTickets([])
      return
    }

    // Validação do valor total
    if (numPrizes * minValReais > totalValueReais) {
      form.setError("numInstantPrizesToDistribute", {
        type: "manual",
        message: `O valor total de prêmios (${formatNumberWithDecimalSeparator(totalValueReais)}) é insuficiente para distribuir ${numPrizes} prêmios com valor mínimo de ${formatNumberWithDecimalSeparator(minValReais)}.`,
      })
      form.setValue("generatedInstantPrizes", [])
      setGeneratedPrizeTickets([])
      return
    }

    // Add validation for intermediate prize values
    if (maxValReais > 500 && maxValReais < 1000) {
      form.setError("maxInstantPrizeValue", {
        type: "manual",
        message: `O valor máximo do prêmio não deve estar entre R$ 500,00 e R$ 1.000,00. Por favor, defina um valor até R$ 500,00 ou a partir de R$ 1.000,00.`,
      })
      form.setValue("generatedInstantPrizes", [])
      setGeneratedPrizeTickets([])
      return
    }

    if (minValReais > 500 && minValReais < 1000) {
      form.setError("minInstantPrizeValue", {
        type: "manual",
        message: `O valor mínimo do prêmio não deve estar entre R$ 500,00 e R$ 1.000,00. Por favor, defina um valor até R$ 500,00 ou a partir de R$ 1.000,00.`,
      })
      form.setValue("generatedInstantPrizes", [])
      setGeneratedPrizeTickets([])
      return
    }

    // Call generateInstantPrizes with values in reais
    const generated = generateInstantPrizes(totalValueReais, numPrizes, minValReais, maxValReais)
    
    // Validar se a geração foi bem sucedida
    if (!generated || generated.length === 0) {
      form.setError("numInstantPrizesToDistribute", {
        type: "manual",
        message: "Não foi possível gerar a grade de prêmios com os valores informados. Por favor, verifique os valores e tente novamente.",
      })
      form.setValue("generatedInstantPrizes", [])
      setGeneratedPrizeTickets([])
      return
    }

    form.setValue("generatedInstantPrizes", generated)

    // Generate unique random ticket numbers for instant prizes
    const totalTicketsRange = form.getValues("totalInstantTicketsToCreate")
    const uniqueTicketNumbers = new Set<string>()
    const actualNumPrizes = Math.min(numPrizes, totalTicketsRange)

    while (uniqueTicketNumbers.size < actualNumPrizes) {
      const randomNumber = Math.floor(Math.random() * totalTicketsRange) + 1
      uniqueTicketNumbers.add(String(randomNumber).padStart(8, "0"))
    }

    const newGeneratedPrizeTickets = Array.from(uniqueTicketNumbers)
      .sort()
      .map((ticketNum, index) => ({
        ticketNumber: ticketNum,
        prizeValue: generated[index] || 0,
      }))

    setGeneratedPrizeTickets(newGeneratedPrizeTickets)
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setIsSubmitting(true)

      // Preparar os dados para a API de forma otimizada
      const requestData = {
        nome: values.name,
        valor_sorteio: values.lotteryPrize,
        valor_premios_instantaneos: values.instantPrizes,
        data_inicio: format(values.startDate, 'yyyy-MM-dd'),
        data_fim: format(values.endDate, 'yyyy-MM-dd'),
        status: values.status === "futuro" ? "futuro" : "ativo", // Envia o status baseado no Switch
        configPremiosInstantaneos: {
          total_titulos: values.totalInstantTicketsToCreate,
          quantidade_premios: values.numInstantPrizesToDistribute,
          valor_minimo: values.minInstantPrizeValue,
          valor_maximo: values.maxInstantPrizeValue
        },
        bilhetesInstantaneos: generatedPrizeTickets
          .filter(ticket => ticket.prizeValue > 0)
          .map(ticket => ({
            numero_titulo: ticket.ticketNumber,
            valor_premio: ticket.prizeValue
          })),
        importacao: {
          nome_arquivo: importedCapitalizadoraFileContent ? "numeros_importados.csv" : "",
          url_arquivo: importedCapitalizadoraFileContent ? "https://storage.supabase.co/sorteios-bucket/uploads/2024/sorteios/numeros_importados.csv" : ""
        },
        numerosImportados: displayedCapitalizadoraNumbers.map(num => ({
          numero: num.number,
          premiado: num.isPrize,
          descricao_premio: num.isPrize ? num.prizeValue : "Não Premiado"
        }))
      }

      // Fazer a chamada à API usando o novo serviço
      const response = await api.fetch('http://localhost:3000/api/sorteio/edicoes', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })

      const data = await response.json()
      
      // Se chegou aqui, deu tudo certo
      toast({
        title: "Sucesso!",
        description: "Sorteio criado com sucesso.",
      })
      onSave(values)
      onClose()
    } catch (error) {
      console.error('Erro ao criar sorteio:', error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: error instanceof Error ? error.message : "Falha ao criar sorteio. Por favor, tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportInstantPrizes = () => {
    const editionName = form.getValues("name") || "nova-edicao"
    const filename = `premios-instantaneos-${editionName.replace(/\s+/g, "-").toLowerCase()}.csv`
    const headers = ["ticketNumber", "prizeValue"]
    exportToCsv(filename, generatedPrizeTickets, headers)
  }

  const isEndDateDisabled = edition?.status === "ativo"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[90vw] max-h-[90vh] flex flex-col bg-[#0D1117] text-white border-[#9FFF00]/10 p-6">
        <DialogHeader>
          <DialogTitle className="text-[#9FFF00]">
            {edition ? "Editar Edição de Sorteio" : "Nova Edição de Sorteio"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {edition
              ? "Faça alterações na edição do sorteio existente."
              : "Crie uma nova edição de sorteio para gerenciar."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="form flex flex-col flex-grow overflow-y-auto">
          <Tabs defaultValue="general-info" className="flex flex-col flex-grow" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-[#1A2430] border-[#9FFF00]/20 text-white">
              <TabsTrigger
                value="general-info"
                className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black data-[state=inactive]:text-white"
              >
                Informações Gerais
              </TabsTrigger>
              <TabsTrigger
                value="instant-prize-config"
                className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black data-[state=inactive]:text-white"
              >
                Prêmios Instantâneos
              </TabsTrigger>
              <TabsTrigger
                value="capitalizadora-numbers"
                className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black data-[state=inactive]:text-white"
              >
                Números Capitalizadora
              </TabsTrigger>
            </TabsList>

            <div className="flex-grow overflow-y-auto p-4 space-y-6">
              {/* Tab: Informações Gerais */}
              <TabsContent value="general-info" className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Nome da Edição
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Edição de Natal 2024"
                    className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lotteryPrize" className="text-gray-300">
                      Valor do Prêmio de Sorteio
                    </Label>
                    <Input
                      id="lotteryPrize"
                      type="text"
                      placeholder="5.000,00"
                      value={lotteryPrizeDisplayValue}
                      onChange={(e) => {
                        const parsed = parseNumberFromDecimalFormattedString(e.target.value)
                        form.setValue("lotteryPrize", parsed, { shouldValidate: true })
                        setLotteryPrizeDisplayValue(e.target.value) // Update display value directly from input
                      }}
                      onBlur={(e) => {
                        // Format on blur to ensure consistent display
                        const parsed = parseNumberFromDecimalFormattedString(e.target.value)
                        setLotteryPrizeDisplayValue(formatNumberWithDecimalSeparator(parsed))
                      }}
                      className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                    />
                    {form.formState.errors.lotteryPrize && (
                      <p className="text-red-500 text-sm">{form.formState.errors.lotteryPrize.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instantPrizes" className="text-gray-300">
                      Valor Total dos Prêmios Instantâneos
                    </Label>
                    <Input
                      id="instantPrizes"
                      type="text"
                      placeholder="1.000,00"
                      value={instantPrizesDisplayValue}
                      onChange={(e) => {
                        const parsed = parseNumberFromDecimalFormattedString(e.target.value)
                        form.setValue("instantPrizes", parsed, { shouldValidate: true })
                        setInstantPrizesDisplayValue(e.target.value)
                      }}
                      onBlur={(e) => {
                        const parsed = parseNumberFromDecimalFormattedString(e.target.value)
                        setInstantPrizesDisplayValue(formatNumberWithDecimalSeparator(parsed))
                      }}
                      className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                    />
                    {form.formState.errors.instantPrizes && (
                      <p className="text-red-500 text-sm">{form.formState.errors.instantPrizes.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate" className="text-gray-300">
                      Data de Início
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-[#1A2430] border-[#9FFF00]/20 text-white",
                            !form.watch("startDate") && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("startDate") ? (
                            format(form.watch("startDate"), "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#1A2430] border-[#9FFF00]/20 text-white">
                        <Calendar
                          mode="single"
                          selected={form.watch("startDate")}
                          onSelect={(date) => form.setValue("startDate", date!)}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.startDate && (
                      <p className="text-red-500 text-sm">{form.formState.errors.startDate.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate" className="text-gray-300">
                      Data de Encerramento
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-[#1A2430] border-[#9FFF00]/20 text-white",
                            !form.watch("endDate") && "text-muted-foreground",
                          )}
                          disabled={isEndDateDisabled} // Disable if edition is active
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("endDate") ? (
                            format(form.watch("endDate"), "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#1A2430] border-[#9FFF00]/20 text-white">
                        <Calendar
                          mode="single"
                          selected={form.watch("endDate")}
                          onSelect={(date) => form.setValue("endDate", date!)}
                          initialFocus
                          locale={ptBR}
                          disabled={isEndDateDisabled} // Disable calendar interaction too
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.endDate && (
                      <p className="text-red-500 text-sm">{form.formState.errors.endDate.message}</p>
                    )}
                    {isEndDateDisabled && (
                      <p className="text-yellow-500 text-sm">
                        A data de encerramento não pode ser alterada para edições ativas.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Configuração de Prêmios Instantâneos */}
              <TabsContent value="instant-prize-config" className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="totalInstantTicketsToCreate" className="text-gray-300">
                    Total de Títulos Instantâneos a Criar (00000001 até 10.000.000)
                  </Label>
                  <Controller
                    control={form.control}
                    name="totalInstantTicketsToCreate"
                    render={({ field }) => (
                      <Input
                        id="totalInstantTicketsToCreate"
                        type="text" // Keeping this as text for thousands separator formatting
                        value={typeof field.value === "number" ? formatNumberWithThousandsSeparator(field.value) : ""}
                        onChange={(e) => {
                          const parsedValue = parseNumberFromFormattedString(e.target.value)
                          field.onChange(parsedValue)
                        }}
                        placeholder="1.000.000"
                        className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                      />
                    )}
                  />
                  {form.formState.errors.totalInstantTicketsToCreate && (
                    <p className="text-red-500 text-sm">{form.formState.errors.totalInstantTicketsToCreate.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {" "}
                  <div className="grid gap-2">
                    <Label htmlFor="numInstantPrizesToDistribute" className="text-gray-300">
                      Número de Prêmios a Distribuir
                    </Label>
                    <Controller
                      control={form.control}
                      name="numInstantPrizesToDistribute"
                      render={({ field }) => (
                        <Input
                          id="numInstantPrizesToDistribute"
                          type="text" // Keeping this as text for thousands separator formatting
                          value={typeof field.value === "number" ? formatNumberWithThousandsSeparator(field.value) : ""}
                          onChange={(e) => {
                            const parsedValue = parseNumberFromFormattedString(e.target.value)
                            field.onChange(parsedValue)
                          }}
                          placeholder="100"
                          className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                        />
                      )}
                    />
                    {form.formState.errors.numInstantPrizesToDistribute && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.numInstantPrizesToDistribute.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minInstantPrizeValue" className="text-gray-300">
                      Valor Mínimo por Prêmio
                    </Label>
                    <Input
                      id="minInstantPrizeValue"
                      type="text"
                      placeholder="5,00"
                      value={minInstantPrizeValueDisplayValue}
                      onChange={(e) => {
                        const parsed = parseNumberFromDecimalFormattedString(e.target.value)
                        form.setValue("minInstantPrizeValue", parsed, { shouldValidate: true })
                        setMinInstantPrizeValueDisplayValue(e.target.value)
                      }}
                      onBlur={(e) => {
                        const parsed = parseNumberFromDecimalFormattedString(e.target.value)
                        setMinInstantPrizeValueDisplayValue(formatNumberWithDecimalSeparator(parsed))
                      }}
                      className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                    />
                    {form.formState.errors.minInstantPrizeValue && (
                      <p className="text-red-500 text-sm">{form.formState.errors.minInstantPrizeValue.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {" "}
                    <Label htmlFor="maxInstantPrizeValue" className="text-gray-300">
                      Valor Máximo por Prêmio
                    </Label>
                    <Input
                      id="maxInstantPrizeValue"
                      type="text"
                      placeholder="500,00"
                      value={maxInstantPrizeValueDisplayValue}
                      onChange={(e) => {
                        const parsed = parseNumberFromDecimalFormattedString(e.target.value)
                        form.setValue("maxInstantPrizeValue", parsed, { shouldValidate: true })
                        setMaxInstantPrizeValueDisplayValue(e.target.value)
                      }}
                      onBlur={(e) => {
                        const parsed = parseNumberFromDecimalFormattedString(e.target.value)
                        setMaxInstantPrizeValueDisplayValue(formatNumberWithDecimalSeparator(parsed))
                      }}
                      className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                    />
                    {form.formState.errors.maxInstantPrizeValue && (
                      <p className="text-red-500 text-sm">{form.formState.errors.maxInstantPrizeValue.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGenerateInstantPrizes}
                  className="bg-[#9FFF00]/20 text-[#9FFF00] hover:bg-[#9FFF00]/30"
                >
                  <Plus className="mr-2 h-4 w-4" /> Gerar Grade de Prêmios
                </Button>

                {form.formState.errors.generatedInstantPrizes && (
                  <p className="text-red-500 text-sm">{form.formState.errors.generatedInstantPrizes.message}</p>
                )}

                {/* Tabela de Prêmios Instantâneos */}
                {generatedPrizeTickets && generatedPrizeTickets.length > 0 && (
                  <div className="space-y-2 mt-6 p-4 border border-[#232A34] rounded-lg bg-[#1A2430]">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-semibold text-[#9FFF00]">Prévia da Grade de Prêmios Gerada</h4>
                      <Button
                        type="button"
                        onClick={handleExportInstantPrizes}
                        className="bg-[#9FFF00]/20 text-[#9FFF00] hover:bg-[#9FFF00]/30"
                      >
                        <Download className="mr-2 h-4 w-4" /> Exportar CSV
                      </Button>
                    </div>
                    <p className="text-gray-400 text-sm">Total de Prêmios: {generatedPrizeTickets.length}</p>
                    <p className="text-gray-400 text-sm">
                      Soma Total:{" "}
                      {formatNumberWithDecimalSeparator(
                        generatedPrizeTickets.reduce((sum, val) => sum + val.prizeValue, 0),
                      )}{" "}
                    </p>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#1A2430] hover:bg-[#1A2430]">
                            <TableHead className="text-gray-300">Número do Título</TableHead>
                            <TableHead className="text-gray-300">Prêmio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedPrizeTickets.map((item, index) => (
                            <TableRow key={index} className="border-[#232A34] hover:bg-[#232A34]">
                              <TableCell className="font-medium text-white">{item.ticketNumber}</TableCell>
                              <TableCell className="text-white">
                                {formatNumberWithDecimalSeparator(item.prizeValue)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <Button
                        type="button"
                        onClick={() => handlePrizePageChange(currentInstantPrizePage - 1)}
                        disabled={currentInstantPrizePage === 1}
                        className="bg-[#9FFF00]/20 text-[#9FFF00] hover:bg-[#9FFF00]/30"
                      >
                        Anterior
                      </Button>
                      <span className="text-white">
                        Página {currentInstantPrizePage} de {getTotalPages(generatedPrizeTickets.length)}
                      </span>
                      <Button
                        type="button"
                        onClick={() => handlePrizePageChange(currentInstantPrizePage + 1)}
                        disabled={currentInstantPrizePage >= getTotalPages(generatedPrizeTickets.length)}
                        className="bg-[#9FFF00]/20 text-[#9FFF00] hover:bg-[#9FFF00]/30"
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab: Números da Capitalizadora */}
              <TabsContent value="capitalizadora-numbers" className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="capitalizadoraFile" className="text-gray-300">
                    Importar Números Premiados da Capitalizadora (.txt, .csv)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="capitalizadoraFile"
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleFileChange}
                      className="bg-[#1A2430] border-[#9FFF00]/20 text-white file:text-[#9FFF00] file:bg-[#1A2430] file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md hover:file:bg-[#232A34]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImportedCapitalizadoraFileContent(null)
                        form.setValue("capitalizadoraWinningNumbersInput", "")
                        const fileInput = document.getElementById("capitalizadoraFile") as HTMLInputElement
                        if (fileInput) fileInput.value = "" // Clear the file input
                      }}
                      className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10"
                      disabled={!importedCapitalizadoraFileContent}
                    >
                      Limpar Arquivo
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Importe um arquivo de texto (.txt) ou CSV (.csv) contendo os números premiados, separados por
                    vírgula ou nova linha.
                  </p>
                  {form.formState.errors.capitalizadoraWinningNumbersInput && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.capitalizadoraWinningNumbersInput.message}
                    </p>
                  )}
                </div>

                {importedCapitalizadoraFileContent && ( // Only show preview if content is imported
                  <div className="space-y-2 mt-6 p-4 border border-[#232A34] rounded-lg bg-[#1A2430]">
                    <h4 className="text-md font-semibold text-[#9FFF00]">
                      Prévia dos Números da Capitalizadora (Amostra)
                    </h4>
                    <p className="text-gray-400 text-sm">Exibindo uma amostra de 1.000 números do total de 10.000.000.</p>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#1A2430] hover:bg-[#1A2430]">
                            <TableHead className="text-gray-300">Número</TableHead>
                            <TableHead className="text-gray-300">É Premiado?</TableHead>
                            <TableHead className="text-gray-300">Prêmio</TableHead>
                            <TableHead className="text-gray-300">Usado?</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedCapitalizadoraNumbers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-gray-400">
                                Nenhum número para exibir.
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedCapitalizadoraNumbers.map((numData, index) => (
                              <TableRow key={index} className="border-[#232A34] hover:bg-[#232A34]">
                                <TableCell className="font-medium text-white">{numData.number}</TableCell>
                                <TableCell>
                                  {numData.isPrize ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-white">{numData.prizeValue || "-"}</TableCell>
                                <TableCell className="text-center">
                                  {numData.isUsed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <Button
                        type="button"
                        onClick={() => handleCapitalizadoraPageChange(currentCapitalizadoraPage - 1)}
                        disabled={currentCapitalizadoraPage === 1}
                        className="bg-[#9FFF00]/20 text-[#9FFF00] hover:bg-[#9FFF00]/30"
                      >
                        Anterior
                      </Button>
                      <span className="text-white">
                        Página {currentCapitalizadoraPage} de {getTotalPages(displayedCapitalizadoraNumbers.length)}
                      </span>
                      <Button
                        type="button"
                        onClick={() => handleCapitalizadoraPageChange(currentCapitalizadoraPage + 1)}
                        disabled={currentCapitalizadoraPage >= getTotalPages(displayedCapitalizadoraNumbers.length)}
                        className="bg-[#9FFF00]/20 text-[#9FFF00] hover:bg-[#9FFF00]/30"
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex items-center justify-between p-4 border-t border-[#232A34] bg-[#0D1117]">
            <Label htmlFor="status-switch" className="text-gray-300">
              Status da Edição (Futuro / Ativo)
            </Label>
            <Switch
              id="status-switch"
              checked={form.watch("status") === "futuro"}
              onCheckedChange={(checked) => form.setValue("status", checked ? "futuro" : "ativo")}
              className="data-[state=checked]:bg-[#9FFF00] data-[state=unchecked]:bg-gray-600"
            />
          </div>
        </form>
        <DialogFooter className="mt-auto p-4 border-t border-[#232A34] bg-[#0D1117]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-[#9FFF00] text-black hover:bg-lime-400 font-semibold"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {edition ? "Salvar Alterações" : "Criar Edição"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
