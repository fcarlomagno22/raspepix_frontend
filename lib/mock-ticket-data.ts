import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export type TicketStatus = "comprado" | "disponivel"
export type PrizeType = "raspadinha" | "sorteio"

export type Ticket = {
  number: string
  status: TicketStatus
  buyerName?: string
  buyerCpf?: string
  prizeType?: PrizeType
  prizeValue?: number | string // Can be a number for cash or string for item (e.g., "iPhone 16")
  paymentStatus?: "pago" | "pendente" // New: Payment status for bought tickets
  isInstantPrizeWinner?: boolean // New: Flag for instant prize winner
  isLotteryPrizeWinner?: boolean // New: Flag for main lottery prize winner
}

export const TOTAL_TICKETS = 1_000_000 // Total de 1 milhão de títulos

// Store all generated tickets in memory for filtering
const allMockTickets: Ticket[] = []

// Mock data for prize values
const PRIZE_VALUES_SCRATCH_CARD = [100, 500, 1000, 5000]
const PRIZE_VALUE_LOTTERY = 20000

// Function to generate all mock tickets once
const generateAllMockTicketsOnce = () => {
  if (allMockTickets.length === TOTAL_TICKETS) {
    return // Already generated
  }

  const names = ["João Silva", "Maria Souza", "Pedro Costa", "Ana Oliveira", "Carlos Santos"]
  const cpfs = ["111.222.333-44", "555.666.777-88", "999.000.111-22", "333.444.555-66", "777.888.999-00"]

  for (let i = 1; i <= TOTAL_TICKETS; i++) {
    const number = String(i).padStart(8, "0")
    const isBought = Math.random() < 0.3 // 30% chance of being bought
    const isPremiated = Math.random() < 0.005 // 0.5% chance of being premiated

    const status: TicketStatus = isBought ? "comprado" : "disponivel"
    let buyerName: string | undefined = undefined
    let buyerCpf: string | undefined = undefined
    let prizeType: PrizeType | undefined = undefined
    let prizeValue: number | string | undefined = undefined
    let paymentStatus: "pago" | "pendente" | undefined = undefined
    let isInstantPrizeWinner = false
    let isLotteryPrizeWinner = false

    if (isBought) {
      const buyerIndex = Math.floor(Math.random() * names.length)
      buyerName = names[buyerIndex]
      buyerCpf = cpfs[buyerIndex]
      // For bought tickets, randomly assign payment status
      paymentStatus = Math.random() < 0.8 ? "pago" : "pendente" // 80% pago, 20% pendente
    }

    if (isPremiated) {
      prizeType = Math.random() < 0.7 ? "raspadinha" : "sorteio" // 70% raspadinha, 30% sorteio
      if (prizeType === "raspadinha") {
        prizeValue = PRIZE_VALUES_SCRATCH_CARD[Math.floor(Math.random() * PRIZE_VALUES_SCRATCH_CARD.length)]
        isInstantPrizeWinner = true
      } else {
        prizeValue = PRIZE_VALUE_LOTTERY
        isLotteryPrizeWinner = true
      }
    }

    allMockTickets.push({
      number,
      status,
      buyerName,
      buyerCpf,
      prizeType,
      prizeValue,
      paymentStatus,
      isInstantPrizeWinner,
      isLotteryPrizeWinner,
    })
  }
}

// Generate all tickets when the module is loaded
generateAllMockTicketsOnce()

export const getFilteredAndPaginatedMockTickets = (
  page: number,
  itemsPerPage: number,
  searchTerm: string,
  statusFilter: TicketStatus | "todos",
  onlyPremiados: boolean,
) => {
  let filteredTickets = allMockTickets

  // Apply search term filter
  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    filteredTickets = filteredTickets.filter(
      (ticket) =>
        ticket.number.includes(lowerCaseSearchTerm) ||
        ticket.buyerName?.toLowerCase().includes(lowerCaseSearchTerm) ||
        ticket.buyerCpf?.includes(lowerCaseSearchTerm),
    )
  }

  // Apply status filter
  if (statusFilter !== "todos") {
    filteredTickets = filteredTickets.filter((ticket) => ticket.status === statusFilter)
  }

  // Apply "only premiados" filter
  if (onlyPremiados) {
    filteredTickets = filteredTickets.filter((ticket) => ticket.prizeType !== undefined)
  }

  const totalCount = filteredTickets.length
  const totalPremiados = filteredTickets.filter((ticket) => ticket.prizeType !== undefined).length
  const totalSold = filteredTickets.filter((ticket) => ticket.status === "comprado").length

  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex)

  return {
    tickets: paginatedTickets,
    totalCount,
    totalPremiados,
    totalSold,
  }
}

// Mock data for lottery editions (kept for context, not directly used by ticket modal)
export type ScratchCardForLottery = {
  id: string
  name: string
  imageUrl: string
  maxPrize: number
  cost: number
}

export type ExpensePlanForLottery = {
  id: string
  name: string
  sellingPrice: number
  numberOfTicketsSold: number
  operationalCosts: {
    capitalizadora: { type: "percentage"; value: number }
    pixReceiving: { type: "fixed" | "percentage"; value: number }
    philanthropicDonation: { type: "fixed" | "percentage"; value: number }
    influencer: { type: "fixed" | "percentage"; value: number }
    affiliates: { type: "fixed" | "percentage"; value: number }
    paidTraffic: { type: "fixed" | "percentage"; value: number }
  }
  extraCosts: { name: string; value: number }[]
}

export type LinkedScratchCard = {
  scratchCardId: string
  expectedSalesVolume: number
  instantPrizesToDistribute: number
}

export type LotteryEditionStatus = "futuro" | "ativo" | "encerrado"

export type LotteryEdition = {
  id: string
  name: string
  lotteryPrize: number
  instantPrizes: number
  startDate: Date
  endDate: Date
  costPlanId: string
  linkedScratchCards: LinkedScratchCard[]
  status: LotteryEditionStatus
}

export const mockScratchCardsForLottery: ScratchCardForLottery[] = [
  {
    id: "sc1",
    name: "Super RaspePix",
    imageUrl: "/images/scratch-cards/super-raspepix.png",
    maxPrize: 5000,
    cost: 1,
  },
  {
    id: "sc2",
    name: "Mega Sorte",
    imageUrl: "/placeholder.svg?height=80&width=60",
    maxPrize: 10000,
    cost: 5,
  },
  {
    id: "sc3",
    name: "Sorte Grande",
    imageUrl: "/placeholder.svg?height=80&width=60",
    maxPrize: 2000,
    cost: 0.5,
  },
]

export const mockExpensePlansForLottery: ExpensePlanForLottery[] = [
  {
    id: "ep1",
    name: "Plano Padrão",
    sellingPrice: 2.0,
    numberOfTicketsSold: 10000,
    operationalCosts: {
      capitalizadora: { type: "percentage", value: 15 },
      pixReceiving: { type: "percentage", value: 1.5 },
      philanthropicDonation: { type: "percentage", value: 5 },
      influencer: { type: "fixed", value: 500 },
      affiliates: { type: "percentage", value: 10 },
      paidTraffic: { type: "fixed", value: 1000 },
    },
    extraCosts: [{ name: "Marketing Digital", value: 200 }],
  },
  {
    id: "ep2",
    name: "Plano Premium",
    sellingPrice: 5.0,
    numberOfTicketsSold: 5000,
    operationalCosts: {
      capitalizadora: { type: "percentage", value: 12 },
      pixReceiving: { type: "percentage", value: 1.0 },
      philanthropicDonation: { type: "percentage", value: 3 },
      influencer: { type: "fixed", value: 1000 },
      affiliates: { type: "percentage", value: 8 },
      paidTraffic: { type: "fixed", value: 2000 },
    },
    extraCosts: [{ name: "Eventos Promocionais", value: 1500 }],
  },
]

export const mockLotteryEditions: LotteryEdition[] = [
  {
    id: "le1",
    name: "Edição #1 - Verão Premiado",
    lotteryPrize: 10000,
    instantPrizes: 2000,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
    costPlanId: "ep1",
    linkedScratchCards: [
      { scratchCardId: "sc1", expectedSalesVolume: 5000, instantPrizesToDistribute: 1000 },
      { scratchCardId: "sc3", expectedSalesVolume: 2000, instantPrizesToDistribute: 500 },
    ],
    status: "encerrado",
  },
  {
    id: "le2",
    name: "Edição #2 - Outono da Sorte",
    lotteryPrize: 15000,
    instantPrizes: 3000,
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-03-31"),
    costPlanId: "ep2",
    linkedScratchCards: [
      { scratchCardId: "sc1", expectedSalesVolume: 7000, instantPrizesToDistribute: 1500 },
      { scratchCardId: "sc2", expectedSalesVolume: 3000, instantPrizesToDistribute: 1000 },
    ],
    status: "ativo",
  },
  {
    id: "le3",
    name: "Edição #3 - Inverno Milionário",
    lotteryPrize: 20000,
    instantPrizes: 5000,
    startDate: new Date("2024-07-01"),
    endDate: new Date("2024-07-31"),
    costPlanId: "ep1",
    linkedScratchCards: [{ scratchCardId: "sc2", expectedSalesVolume: 4000, instantPrizesToDistribute: 2000 }],
    status: "futuro",
  },
]

// Utility functions
export const formatDateDisplay = (date: Date) => {
  return format(date, "dd/MM/yyyy", { locale: ptBR })
}

export const getExpensePlanName = (planId: string) => {
  return mockExpensePlansForLottery.find((p) => p.id === planId)?.name || "N/A"
}

export const getScratchCardDetails = (cardId: string) => {
  return mockScratchCardsForLottery.find((sc) => sc.id === cardId)
}

export const calculateFinancials = (
  lotteryEdition: LotteryEdition,
  expensePlans: ExpensePlanForLottery[],
  scratchCards: ScratchCardForLottery[],
) => {
  const costPlan = expensePlans.find((p) => p.id === lotteryEdition.costPlanId)

  let estimatedGrossRevenue = 0
  let totalInstantPrizesDistributed = 0

  lotteryEdition.linkedScratchCards.forEach((linkedSc) => {
    const scDetails = scratchCards.find((sc) => sc.id === linkedSc.scratchCardId)
    if (scDetails && costPlan) {
      estimatedGrossRevenue += linkedSc.expectedSalesVolume * costPlan.sellingPrice
      totalInstantPrizesDistributed += linkedSc.instantPrizesToDistribute
    }
  })

  const totalPrizes = lotteryEdition.lotteryPrize + totalInstantPrizesDistributed

  let totalOperationalCosts = 0
  let totalExtraCosts = 0
  let totalTaxes = 0

  if (costPlan) {
    // Calculate operational costs
    for (const key in costPlan.operationalCosts) {
      const cost = costPlan.operationalCosts[key as keyof typeof costPlan.operationalCosts]
      if (cost.type === "fixed") {
        totalOperationalCosts += cost.value
      } else {
        totalOperationalCosts += (cost.value / 100) * estimatedGrossRevenue
      }
    }

    // Calculate extra costs
    totalExtraCosts = costPlan.extraCosts.reduce((sum, ec) => sum + ec.value, 0)

    // Calculate taxes (simplified for simulation)
    const presumedProfitBase = estimatedGrossRevenue * 0.32 // 32% presumed profit for IRPJ/CSLL
    const irpj = presumedProfitBase * 0.15
    const additionalIrpj = Math.max(0, (presumedProfitBase - 20000) * 0.1)
    const csll = presumedProfitBase * 0.09
    const pis = estimatedGrossRevenue * 0.0065
    const cofins = estimatedGrossRevenue * 0.03
    const iss = estimatedGrossRevenue * 0.05

    totalTaxes = irpj + additionalIrpj + csll + pis + cofins + iss
  }

  const totalExpenses = totalOperationalCosts + totalExtraCosts + totalTaxes

  const estimatedResult = estimatedGrossRevenue - totalPrizes - totalExpenses

  return {
    estimatedGrossRevenue,
    totalPrizes,
    totalExpenses,
    estimatedResult,
  }
}
