"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Plus, Loader2, CheckCircle2, Download, Info } from "lucide-react" // Added Download and Info icons

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  formatCurrency,
  exportToCsv, // Imported exportToCsv
} from "@/lib/utils"
import type { LotteryEdition } from "@/lib/mock-lottery-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import Cookies from 'js-cookie'
import { api } from '@/services/api'



// --- Zod Schema for Form Validation ---
const formSchema = z.object({
  name: z.string().min(1, "Nome da edição é obrigatório."),
  susepProcess: z.string().min(1, "Processo Susep é obrigatório."),
  editionNumber: z.coerce.number().min(1, "Número da edição é obrigatório."),
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
  const [importedInstantPrizesFileContent, setImportedInstantPrizesFileContent] = useState<string | null>(null)

  const [generatedCapitalizadoraNumbers, setGeneratedCapitalizadoraNumbers] = useState<string[]>([])
  const [capitalizadoraQuantity, setCapitalizadoraQuantity] = useState<number>(10000000)
  const [showActiveConfirmationModal, setShowActiveConfirmationModal] = useState(false)
  const [showActiveEditionModal, setShowActiveEditionModal] = useState(false)
  const [nextEditionNumber, setNextEditionNumber] = useState<number>(1)

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

  // Memoized function for generating instant prizes numbers for display
  const displayedInstantPrizesNumbers = useMemo(() => {
    if (!importedInstantPrizesFileContent) return []

    const numbers: { number: string; isPrize: boolean; prizeValue?: string; isUsed: boolean }[] = []
    
    // Separar por linhas e processar cada linha
    const lines = importedInstantPrizesFileContent
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
  }, [importedInstantPrizesFileContent])



  const paginatedInstantPrizesNumbers = useMemo(
    () => getPaginatedData(displayedInstantPrizesNumbers, currentInstantPrizePage),
    [displayedInstantPrizesNumbers, currentInstantPrizePage]
  )

  const paginatedCapitalizadoraNumbers = useMemo(
    () => getPaginatedData(generatedCapitalizadoraNumbers, currentCapitalizadoraPage),
    [generatedCapitalizadoraNumbers, currentCapitalizadoraPage]
  )

  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      susepProcess: "",
      editionNumber: 1,
      lotteryPrize: 0,
      instantPrizes: 0,
      startDate: new Date(),
      endDate: new Date(),
      status: "futuro",
      totalInstantTicketsToCreate: 1000000,
      numInstantPrizesToDistribute: 0,
      minInstantPrizeValue: 0,
      maxInstantPrizeValue: 0,
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
        susepProcess: edition.susepProcess || "",
        editionNumber: edition.editionNumber || 1,
        startDate: new Date(edition.startDate),
        endDate: new Date(edition.endDate),
        totalInstantTicketsToCreate: edition.totalInstantTicketsToCreate,
        numInstantPrizesToDistribute: edition.numInstantPrizesToDistribute,
        minInstantPrizeValue: edition.minInstantPrizeValue,
        maxInstantPrizeValue: edition.maxInstantPrizeValue,
        capitalizadoraWinningNumbersInput: edition.capitalizadoraWinningNumbersInput,
        capitalizadoraNumbers: edition.capitalizadoraNumbers,
      })
      // Set display values for existing edition
      setLotteryPrizeDisplayValue(formatCurrency(edition.lotteryPrize))
      setInstantPrizesDisplayValue(formatNumberWithDecimalSeparator(edition.instantPrizes))
      setMinInstantPrizeValueDisplayValue(formatNumberWithDecimalSeparator(edition.minInstantPrizeValue))
      setMaxInstantPrizeValueDisplayValue(formatNumberWithDecimalSeparator(edition.maxInstantPrizeValue))

      if (edition.capitalizadoraWinningNumbersInput) {
        setImportedInstantPrizesFileContent(edition.capitalizadoraWinningNumbersInput)
      }

    } else {
      form.reset({
        name: "",
        susepProcess: "",
        editionNumber: nextEditionNumber,
        lotteryPrize: 0,
        instantPrizes: 0,
        startDate: new Date(),
        endDate: new Date(),
        status: "futuro",
        totalInstantTicketsToCreate: 1000000,
        numInstantPrizesToDistribute: 0,
        minInstantPrizeValue: 0,
        maxInstantPrizeValue: 0,
        capitalizadoraWinningNumbersInput: "",
        capitalizadoraNumbers: [],
      })
      // Clear display values on new edition
      setLotteryPrizeDisplayValue("")
      setInstantPrizesDisplayValue("")
      setMinInstantPrizeValueDisplayValue("")
      setMaxInstantPrizeValueDisplayValue("")

      setImportedInstantPrizesFileContent(null)
      setGeneratedCapitalizadoraNumbers([])
      setCapitalizadoraQuantity(10000000)
    }
  }, [edition, form])

  // Effect para carregar o próximo número da edição quando o modal abrir
  useEffect(() => {
    if (isOpen && !edition) {
      getNextEditionNumber().then((nextNumber) => {
        setNextEditionNumber(nextNumber)
        form.setValue("editionNumber", nextNumber)
      })
    }
  }, [isOpen, edition, form])

  // Handle file upload for instant prizes numbers
  const handleInstantPrizesFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setImportedInstantPrizesFileContent(content)
          form.setValue("capitalizadoraWinningNumbersInput", content, { shouldValidate: true })
          
          // Extrair dados automaticamente do arquivo
          extractDataFromFile(content)
        }
        reader.readAsText(file)
      } else {
        setImportedInstantPrizesFileContent(null)
        form.setValue("capitalizadoraWinningNumbersInput", "", { shouldValidate: true })
        // Limpar dados extraídos
        clearExtractedData()
      }
    },
    [form],
  )

  // Função para extrair dados automaticamente do arquivo
  const extractDataFromFile = (content: string) => {
    const lines = content
      .split(/[\n,]/)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    let totalPrizesValue = 0
    let totalTickets = 0
    let totalPrizes = 0
    let minPrizeValue = Infinity
    let maxPrizeValue = 0

    lines.forEach(line => {
      const parts = line.split(';')
      
      if (parts.length >= 1) {
        totalTickets++
        
        // Verifica se é um número premiado (tem 3 partes) ou não premiado (tem 2 partes)
        if (parts.length === 3 && parts[2].trim() === 'Premiado') {
          const prizeValue = parseFloat(parts[1])
          if (!isNaN(prizeValue)) {
            totalPrizesValue += prizeValue
            totalPrizes++
            minPrizeValue = Math.min(minPrizeValue, prizeValue)
            maxPrizeValue = Math.max(maxPrizeValue, prizeValue)
          }
        }
      }
    })

    // Preencher automaticamente os campos do formulário
    if (totalTickets > 0) {
      form.setValue("totalInstantTicketsToCreate", totalTickets, { shouldValidate: true })
    }
    
    if (totalPrizes > 0) {
      form.setValue("numInstantPrizesToDistribute", totalPrizes, { shouldValidate: true })
    }
    
    if (minPrizeValue !== Infinity) {
      form.setValue("minInstantPrizeValue", minPrizeValue, { shouldValidate: true })
      setMinInstantPrizeValueDisplayValue(formatNumberWithDecimalSeparator(minPrizeValue))
    }
    
    if (maxPrizeValue > 0) {
      form.setValue("maxInstantPrizeValue", maxPrizeValue, { shouldValidate: true })
      setMaxInstantPrizeValueDisplayValue(formatNumberWithDecimalSeparator(maxPrizeValue))
    }

    // Atualizar o valor total dos prêmios instantâneos (Modalidade Incentivo)
    if (totalPrizesValue > 0) {
      form.setValue("instantPrizes", totalPrizesValue, { shouldValidate: true })
      setInstantPrizesDisplayValue(formatNumberWithDecimalSeparator(totalPrizesValue))
    }

    // Mostrar toast com informações extraídas
    toast({
      title: "Arquivo Processado!",
      description: `Extraídos: ${totalTickets} títulos, ${totalPrizes} prêmios, total: R$ ${formatNumberWithDecimalSeparator(totalPrizesValue)}. O valor total foi preenchido automaticamente na aba Informações Gerais.`,
    })
  }

  // Função para formatar valor em tempo real com máscara BRL
  const formatValueWithBRL = (value: string) => {
    // Remove tudo que não é número
    const numbersOnly = value.replace(/\D/g, '')
    
    if (numbersOnly === '') return ''
    
    // Converte para número e divide por 100 para ter centavos
    const number = parseInt(numbersOnly) / 100
    
    // Formata com máscara BRL
    return formatCurrency(number)
  }

  // Função para limpar dados extraídos
  const clearExtractedData = () => {
    form.setValue("totalInstantTicketsToCreate", 1000000, { shouldValidate: true })
    form.setValue("numInstantPrizesToDistribute", 0, { shouldValidate: true })
    form.setValue("minInstantPrizeValue", 0, { shouldValidate: true })
    form.setValue("maxInstantPrizeValue", 0, { shouldValidate: true })
    form.setValue("instantPrizes", 0, { shouldValidate: true })
    
    setMinInstantPrizeValueDisplayValue("")
    setMaxInstantPrizeValueDisplayValue("")
    setInstantPrizesDisplayValue("")
  }



  const handleGenerateCapitalizadoraNumbers = () => {
    const totalNumbers = capitalizadoraQuantity
    const numbers: string[] = []
    
    // Gerar números de 00000001 até a quantidade definida
    for (let i = 1; i <= totalNumbers; i++) {
      numbers.push(String(i).padStart(8, '0'))
    }
    
    setGeneratedCapitalizadoraNumbers(numbers)
  }

  // Função para determinar o status automaticamente baseado nas datas
  const determineStatus = (startDate: Date, endDate: Date): "futuro" | "ativo" | "encerrado" => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

    if (today < start) {
      return "futuro"
    } else if (today >= start && today <= end) {
      return "ativo"
    } else {
      return "encerrado"
    }
  }

  // Função para verificar se já existe uma edição ativa
  const checkForActiveEdition = async (): Promise<boolean> => {
    try {
      const response = await api.get('/api/sorteio/admin/edicoes/active')
      return response.data.hasActive
    } catch (error) {
      console.error('Erro ao verificar edição ativa:', error)
      return false
    }
  }

  // Função para obter o próximo número da edição
  const getNextEditionNumber = async (): Promise<number> => {
    try {
      const response = await api.get('/api/sorteio/admin/edicoes/next-number')
      return response.data.nextNumber
    } catch (error) {
      console.error('Erro ao obter próximo número da edição:', error)
      return 1
    }
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setIsSubmitting(true)

      // Determinar status automaticamente baseado nas datas
      const autoStatus = determineStatus(values.startDate, values.endDate)
      
      // Se for uma nova edição (não está editando) e o status seria ativo
      if (!edition && autoStatus === "ativo") {
        // Verificar se já existe uma edição ativa
        const hasActiveEdition = await checkForActiveEdition()
        
        if (hasActiveEdition) {
          setShowActiveEditionModal(true)
          setIsSubmitting(false)
          return
        } else {
          // Mostrar modal de confirmação para ativar a edição
          setShowActiveConfirmationModal(true)
          setIsSubmitting(false)
          return
        }
      }

      // Preparar os dados para a API de forma otimizada
      const requestData = {
        nome: values.name,
        valor_sorteio: values.lotteryPrize,
        valor_premios_instantaneos: values.instantPrizes,
        data_inicio: format(values.startDate, 'yyyy-MM-dd'),
        data_fim: format(values.endDate, 'yyyy-MM-dd'),
        susep_process: values.susepProcess,
        configPremiosInstantaneos: {
          total_titulos: values.totalInstantTicketsToCreate,
          quantidade_premios: values.numInstantPrizesToDistribute,
          valor_minimo: values.minInstantPrizeValue,
          valor_maximo: values.maxInstantPrizeValue
        },
        bilhetesInstantaneos: displayedInstantPrizesNumbers.map(num => ({
          numero_titulo: num.number,
          valor_premio: num.isPrize ? parseFloat(num.prizeValue?.replace('R$ ', '').replace(',', '.') || '0') : null,
          premiado: num.isPrize
          })),
        importacao: {
          nome_arquivo: importedInstantPrizesFileContent ? "numeros_incentivo.csv" : "",
          url_arquivo: importedInstantPrizesFileContent ? "https://exemplo.com/arquivo_incentivo.csv" : ""
        },
        numerosImportados: displayedInstantPrizesNumbers.map(num => ({
          numero: num.number,
          premiado: num.isPrize,
          descricao_premio: num.isPrize ? num.prizeValue || "Prêmio" : "Sem prêmio"
        })),
        numerosFilantropia: generatedCapitalizadoraNumbers.map(num => ({
          numero_titulo: num,
          status: "disponivel",
          descricao_premio: "À sortear Loteria Federal"
        }))
      }

      // Fazer a chamada à API usando o novo serviço
      const response = await api.post('/api/sorteio/admin/edicoes', requestData);

      const data = response.data;
      
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



  // Função para confirmar criação de edição ativa
  const handleConfirmActiveEdition = async () => {
    setShowActiveConfirmationModal(false)
    const values = form.getValues()
    
    try {
      setIsSubmitting(true)
      
      const requestData = {
        nome: values.name,
        valor_sorteio: values.lotteryPrize,
        valor_premios_instantaneos: values.instantPrizes,
        data_inicio: format(values.startDate, 'yyyy-MM-dd'),
        data_fim: format(values.endDate, 'yyyy-MM-dd'),
        susep_process: values.susepProcess,
        configPremiosInstantaneos: {
          total_titulos: values.totalInstantTicketsToCreate,
          quantidade_premios: values.numInstantPrizesToDistribute,
          valor_minimo: values.minInstantPrizeValue,
          valor_maximo: values.maxInstantPrizeValue
        },
        bilhetesInstantaneos: displayedInstantPrizesNumbers.map(num => ({
          numero_titulo: num.number,
          valor_premio: num.isPrize ? parseFloat(num.prizeValue?.replace('R$ ', '').replace(',', '.') || '0') : null,
          premiado: num.isPrize
        })),
        importacao: {
          nome_arquivo: importedInstantPrizesFileContent ? "numeros_incentivo.csv" : "",
          url_arquivo: importedInstantPrizesFileContent ? "https://exemplo.com/arquivo_incentivo.csv" : ""
        },
        numerosImportados: displayedInstantPrizesNumbers.map(num => ({
          numero: num.number,
          premiado: num.isPrize,
          descricao_premio: num.isPrize ? num.prizeValue || "Prêmio" : "Sem prêmio"
        })),
        numerosFilantropia: generatedCapitalizadoraNumbers.map(num => ({
          numero_titulo: num,
          status: "disponivel",
          descricao_premio: "À sortear Loteria Federal"
        }))
      }

      const response = await api.post('/api/sorteio/admin/edicoes', requestData)
      
      toast({
        title: "Sucesso!",
        description: "Sorteio criado e ativado com sucesso.",
      })
      onSave(values)
      onClose()
    } catch (error) {
      console.error('Erro ao criar sorteio ativo:', error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: error instanceof Error ? error.message : "Falha ao criar sorteio ativo. Por favor, tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para criar edição futura quando já existe uma ativa
  const handleCreateFutureEdition = () => {
    setShowActiveEditionModal(false)
    // Não fazer nada, apenas fechar o modal e permitir que o usuário ajuste as datas
  }

  const isEndDateDisabled = edition?.status === "ativo"

  // Validação para habilitar o botão "Criar Edição"
  const isFormValid = useMemo(() => {
    const values = form.getValues()
    
    // Verificar se todos os campos obrigatórios estão preenchidos
    const hasRequiredFields = values.name && 
                             values.susepProcess && 
                             values.editionNumber && 
                             values.lotteryPrize > 0 && 
                             values.startDate && 
                             values.endDate &&
                             values.totalInstantTicketsToCreate > 0 &&
                             values.numInstantPrizesToDistribute > 0 &&
                             values.minInstantPrizeValue > 0 &&
                             values.maxInstantPrizeValue > 0

    // Verificar se o arquivo foi carregado na Modalidade Incentivo
    const hasInstantPrizesFile = !!importedInstantPrizesFileContent

    // Verificar se a grade de números da filantropia foi gerada
    const hasCapitalizadoraNumbers = generatedCapitalizadoraNumbers.length > 0

    return hasRequiredFields && hasInstantPrizesFile && hasCapitalizadoraNumbers
  }, [form.watch(), importedInstantPrizesFileContent, generatedCapitalizadoraNumbers])

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
                Modalidade Incentivo
              </TabsTrigger>
              <TabsTrigger
                value="capitalizadora-numbers"
                className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-black data-[state=inactive]:text-white"
              >
                Modalidade Filantropia Premiável
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
                    <Label htmlFor="susepProcess" className="text-gray-300">
                      Processo Susep
                    </Label>
                    <Input
                      id="susepProcess"
                      placeholder="Ex: 15414.000001/2024-01"
                      className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                      {...form.register("susepProcess")}
                    />
                    {form.formState.errors.susepProcess && (
                      <p className="text-red-500 text-sm">{form.formState.errors.susepProcess.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="editionNumber" className="text-gray-300">
                        Número da Edição
                      </Label>
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 hover:text-[#9FFF00] cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Número automático e crescente. O sistema gera automaticamente o próximo número sequencial.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="editionNumber"
                      type="number"
                      placeholder="1"
                      className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                      {...form.register("editionNumber")}
                      disabled={!edition} // Só permite editar se estiver editando uma edição existente
                    />
                    {form.formState.errors.editionNumber && (
                      <p className="text-red-500 text-sm">{form.formState.errors.editionNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lotteryPrize" className="text-gray-300">
                      Valor Prêmio Único da Filantropia Premiável
                    </Label>
                    <Input
                      id="lotteryPrize"
                      type="text"
                      placeholder="R$ 5.000,00"
                      value={lotteryPrizeDisplayValue}
                      onChange={(e) => {
                        const formattedValue = formatValueWithBRL(e.target.value)
                        setLotteryPrizeDisplayValue(formattedValue)
                        
                        // Extrai o valor numérico para o formulário
                        const numbersOnly = e.target.value.replace(/\D/g, '')
                        const numericValue = numbersOnly === '' ? 0 : parseInt(numbersOnly) / 100
                        form.setValue("lotteryPrize", numericValue, { shouldValidate: true })
                      }}
                      className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                    />
                    {form.formState.errors.lotteryPrize && (
                      <p className="text-red-500 text-sm">{form.formState.errors.lotteryPrize.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                    <Label htmlFor="instantPrizes" className="text-gray-300">
                        Valor Total de Prêmios Modalidade Incentivo
                    </Label>
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 hover:text-[#9FFF00] cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Este valor é preenchido automaticamente quando você faz upload do arquivo na aba "Modalidade Incentivo"</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="instantPrizes"
                      type="text"
                      placeholder="R$ 1.000,00"
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
                      readOnly
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

              {/* Tab: Modalidade Incentivo */}
              <TabsContent value="instant-prize-config" className="space-y-6">
                <div className="space-y-6">
                  {/* Upload do Arquivo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#9FFF00]">Upload do Arquivo de Prêmios</h3>
                    
                  <div className="grid gap-2">
                      <Label htmlFor="instantPrizesFile" className="text-gray-300">
                        Upload do Arquivo de Prêmios da Modalidade Incentivo
                    </Label>
                      <p className="text-sm text-gray-400">
                        Faça o upload de um arquivo .txt ou .csv contendo as informações dos prêmios.
                        <br />
                        <strong>Formato esperado:</strong> Número;Valor;Status (ex: 00000001;50.00;Premiado)
                        <br />
                        <strong>Os dados serão extraídos automaticamente:</strong> total de títulos, quantidade de prêmios, valores min/max e valor total.
                      </p>
                </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      id="instantPrizesFile"
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleInstantPrizesFileChange}
                      className="bg-[#1A2430] border-[#9FFF00]/20 text-white file:text-[#9FFF00] file:bg-[#1A2430] file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md hover:file:bg-[#232A34]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImportedInstantPrizesFileContent(null)
                        form.setValue("capitalizadoraWinningNumbersInput", "")
                        const fileInput = document.getElementById("instantPrizesFile") as HTMLInputElement
                        if (fileInput) fileInput.value = ""
                          clearExtractedData()
                      }}
                      className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10"
                      disabled={!importedInstantPrizesFileContent}
                    >
                      Limpar Arquivo
                    </Button>
                  </div>
                </div>

                  {/* Dados Extraídos Automaticamente */}
                  {importedInstantPrizesFileContent && (
                    <div className="space-y-4 p-4 border border-[#232A34] rounded-lg bg-[#1A2430]">
                      <h3 className="text-lg font-semibold text-[#9FFF00]">Dados Extraídos Automaticamente</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Total de Títulos</Label>
                          <div className="p-2 bg-[#0D1117] rounded border border-[#9FFF00]/20">
                            <span className="text-white font-mono">
                              {typeof form.watch("totalInstantTicketsToCreate") === "number" 
                                ? formatNumberWithThousandsSeparator(form.watch("totalInstantTicketsToCreate"))
                                : "0"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Quantidade de Prêmios</Label>
                          <div className="p-2 bg-[#0D1117] rounded border border-[#9FFF00]/20">
                            <span className="text-white font-mono">
                              {typeof form.watch("numInstantPrizesToDistribute") === "number" 
                                ? formatNumberWithThousandsSeparator(form.watch("numInstantPrizesToDistribute"))
                                : "0"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Valor Mínimo</Label>
                          <div className="p-2 bg-[#0D1117] rounded border border-[#9FFF00]/20">
                            <span className="text-white font-mono">
                              {minInstantPrizeValueDisplayValue || "R$ 0,00"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Valor Máximo</Label>
                          <div className="p-2 bg-[#0D1117] rounded border border-[#9FFF00]/20">
                            <span className="text-white font-mono">
                              {maxInstantPrizeValueDisplayValue || "R$ 0,00"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-300 text-sm">Valor Total dos Prêmios (será usado no campo "Valor Total de Prêmios Modalidade Incentivo" na aba Informações Gerais)</Label>
                        <div className="p-3 bg-[#0D1117] rounded border border-[#9FFF00]/20">
                          <span className="text-[#9FFF00] font-bold text-lg">
                            {instantPrizesDisplayValue || "R$ 0,00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabela de Números Importados */}
                {importedInstantPrizesFileContent && (
                  <div className="space-y-2 mt-6 p-4 border border-[#232A34] rounded-lg bg-[#1A2430]">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-semibold text-[#9FFF00]">Números Importados da Modalidade Incentivo</h4>
                    </div>
                    <p className="text-gray-400 text-sm">Total de Números: {displayedInstantPrizesNumbers.length}</p>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
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
                          {paginatedInstantPrizesNumbers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-gray-400">
                                Nenhum número para exibir.
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedInstantPrizesNumbers.map((numData, index) => (
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
                        onClick={() => handlePrizePageChange(currentInstantPrizePage - 1)}
                        disabled={currentInstantPrizePage === 1}
                        className="bg-[#9FFF00]/20 text-[#9FFF00] hover:bg-[#9FFF00]/30"
                      >
                        Anterior
                      </Button>
                      <span className="text-white">
                        Página {currentInstantPrizePage} de {getTotalPages(displayedInstantPrizesNumbers.length)}
                      </span>
                      <Button
                        type="button"
                        onClick={() => handlePrizePageChange(currentInstantPrizePage + 1)}
                        disabled={currentInstantPrizePage >= getTotalPages(displayedInstantPrizesNumbers.length)}
                        className="bg-[#9FFF00]/20 text-[#9FFF00] hover:bg-[#9FFF00]/30"
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}


              </TabsContent>

              {/* Tab: Modalidade Filantropia Premiável */}
              <TabsContent value="capitalizadora-numbers" className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="capitalizadoraQuantity" className="text-gray-300">
                    Quantidade de Números da Capitalizadora
                  </Label>
                  <Input
                    id="capitalizadoraQuantity"
                    type="text"
                    placeholder="10.000.000"
                    value={typeof capitalizadoraQuantity === "number" ? formatNumberWithThousandsSeparator(capitalizadoraQuantity) : ""}
                    onChange={(e) => {
                      const parsedValue = parseNumberFromFormattedString(e.target.value)
                      setCapitalizadoraQuantity(parsedValue)
                    }}
                    className="bg-[#1A2430] border-[#9FFF00]/20 text-white"
                  />
                  <p className="text-sm text-gray-400">
                    Defina a quantidade de números que a capitalizadora deve gerar (de 00000001 até a quantidade definida). Os prêmios são definidos pela Loteria Federal, não pela capitalizadora.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleGenerateCapitalizadoraNumbers}
                  className="bg-[#9FFF00]/20 text-[#9FFF00] hover:bg-[#9FFF00]/30"
                  disabled={capitalizadoraQuantity <= 0}
                >
                  <Plus className="mr-2 h-4 w-4" /> Gerar Grade de Números da Modalidade Filantropia
                </Button>

                {generatedCapitalizadoraNumbers.length > 0 && (
                  <div className="space-y-2 mt-6 p-4 border border-[#232A34] rounded-lg bg-[#1A2430]">
                    <h4 className="text-md font-semibold text-[#9FFF00]">
                      Grade de Números da Modalidade Filantropia Premiável (Amostra)
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Exibindo uma amostra de 1.000 números do total de {generatedCapitalizadoraNumbers.length.toLocaleString()} (00000001 até {String(capitalizadoraQuantity).padStart(8, '0')}).
                    </p>
                    <p className="text-gray-400 text-sm">
                      <strong>Nota:</strong> Os prêmios são definidos pela Loteria Federal, não pela capitalizadora.
                    </p>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#1A2430] hover:bg-[#1A2430]">
                            <TableHead className="text-gray-300">Número</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300">Prêmio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedCapitalizadoraNumbers.map((number, index) => (
                            <TableRow key={index} className="border-[#232A34] hover:bg-[#232A34]">
                              <TableCell className="font-medium text-white">{number}</TableCell>
                              <TableCell className="text-white">Disponível</TableCell>
                              <TableCell className="text-white">Via Loteria Federal</TableCell>
                            </TableRow>
                          ))}
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
                        Página {currentCapitalizadoraPage} de {getTotalPages(generatedCapitalizadoraNumbers.length)}
                      </span>
                      <Button
                        type="button"
                        onClick={() => handleCapitalizadoraPageChange(currentCapitalizadoraPage + 1)}
                        disabled={currentCapitalizadoraPage >= getTotalPages(generatedCapitalizadoraNumbers.length)}
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


        </form>
        <DialogFooter className="mt-auto p-4 border-t border-[#232A34] bg-[#0D1117]">
          {!isFormValid && !edition && (
            <div className="flex-1 text-sm text-gray-400 mb-2">
              <p className="font-medium text-[#9FFF00] mb-1">Para criar a edição, complete:</p>
              <ul className="list-disc list-inside space-y-1">
                {!form.getValues().name && <li>Nome da edição</li>}
                {!form.getValues().susepProcess && <li>Processo Susep</li>}
                {form.getValues().lotteryPrize <= 0 && <li>Valor do prêmio da filantropia</li>}
                {!form.getValues().startDate && <li>Data de início</li>}
                {!form.getValues().endDate && <li>Data de encerramento</li>}
                {form.getValues().totalInstantTicketsToCreate <= 0 && <li>Total de títulos instantâneos</li>}
                {form.getValues().numInstantPrizesToDistribute <= 0 && <li>Quantidade de prêmios a distribuir</li>}
                {form.getValues().minInstantPrizeValue <= 0 && <li>Valor mínimo do prêmio</li>}
                {form.getValues().maxInstantPrizeValue <= 0 && <li>Valor máximo do prêmio</li>}
                {!importedInstantPrizesFileContent && <li>Upload do arquivo na Modalidade Incentivo</li>}
                {generatedCapitalizadoraNumbers.length === 0 && <li>Geração da grade de números da filantropia</li>}
              </ul>
            </div>
          )}
          <div className="flex gap-2">
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
              disabled={isSubmitting || !isFormValid}
              className="bg-[#9FFF00] text-black hover:bg-lime-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {edition ? "Salvar Alterações" : "Criar Edição"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Modal de Confirmação para Edição Ativa */}
      <Dialog open={showActiveConfirmationModal} onOpenChange={setShowActiveConfirmationModal}>
        <DialogContent className="bg-[#0D1117] text-white border-[#9FFF00]/10">
          <DialogHeader>
            <DialogTitle className="text-[#9FFF00]">Confirmar Ativação da Edição</DialogTitle>
            <DialogDescription className="text-gray-400">
              A data de início selecionada é hoje. Esta edição será criada como ATIVA.
              Tem certeza que deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActiveConfirmationModal(false)}
              className="border-[#9FFF00]/30 text-[#9FFF00] bg-transparent hover:bg-[#9FFF00]/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmActiveEdition}
              className="bg-[#9FFF00] text-black hover:bg-lime-400 font-semibold"
            >
              Sim, Ativar Edição
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      {/* Modal para Edição Ativa Existente */}
      <Dialog open={showActiveEditionModal} onOpenChange={setShowActiveEditionModal}>
        <DialogContent className="bg-[#0D1117] text-white border-[#9FFF00]/10">
          <DialogHeader>
            <DialogTitle className="text-[#9FFF00]">Edição Ativa Já Existe</DialogTitle>
            <DialogDescription className="text-gray-400">
              Já existe uma edição ativa no sistema. Não é possível criar uma nova edição ativa.
              <br /><br />
              Para criar uma nova edição, você deve:
              <br />• Ajustar a data de início para uma data futura, ou
              <br />• Aguardar o encerramento da edição ativa atual
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleCreateFutureEdition}
              className="bg-[#9FFF00] text-black hover:bg-lime-400 font-semibold"
            >
              Entendi, Ajustar Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
