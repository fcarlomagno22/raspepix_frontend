import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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
  susepProcess?: string
  editionNumber?: number
  lotteryPrize: number
  instantPrizes: number
  startDate: Date
  endDate: Date
  status: LotteryEditionStatus
  // Novos campos para configuração de prêmios instantâneos
  totalInstantTicketsToCreate: number
  numInstantPrizesToDistribute: number
  minInstantPrizeValue: number
  maxInstantPrizeValue: number
  generatedInstantPrizes: number[] // Array dos valores dos prêmios gerados
  // Novos campos para números da Capitalizadora
  capitalizadoraWinningNumbersInput: string // Conteúdo bruto do arquivo importado
  capitalizadoraNumbers: { number: string; isPrize: boolean; prizeValue?: string }[] // Lista processada de números da capitalizadora
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
    susepProcess: "15414.000001/2024-01",
    editionNumber: 1,
    lotteryPrize: 10000,
    instantPrizes: 2000,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-31"),
    status: "encerrado",
    totalInstantTicketsToCreate: 1000000,
    numInstantPrizesToDistribute: 100,
    minInstantPrizeValue: 5,
    maxInstantPrizeValue: 500,
    generatedInstantPrizes: [5, 10, 15, 20, 50, 100, 200, 500], // Exemplo
    capitalizadoraWinningNumbersInput: "00000001,00000100,00001000", // Exemplo
    capitalizadoraNumbers: [
      // Exemplo
      { number: "00000001", isPrize: true, prizeValue: "iPhone 16" },
      { number: "00000100", isPrize: true, prizeValue: "iPhone 16" },
      { number: "00001000", isPrize: true, prizeValue: "iPhone 16" },
    ],
  },
  {
    id: "le2",
    name: "Edição #2 - Outono da Sorte",
    susepProcess: "15414.000002/2024-02",
    editionNumber: 2,
    lotteryPrize: 15000,
    instantPrizes: 3000,
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-03-31"),
    status: "ativo",
    totalInstantTicketsToCreate: 1000000,
    numInstantPrizesToDistribute: 150,
    minInstantPrizeValue: 10,
    maxInstantPrizeValue: 1000,
    generatedInstantPrizes: [10, 20, 50, 100, 250, 500, 1000], // Exemplo
    capitalizadoraWinningNumbersInput: "",
    capitalizadoraNumbers: [],
  },
  {
    id: "le3",
    name: "Edição #3 - Inverno Milionário",
    susepProcess: "15414.000003/2024-03",
    editionNumber: 3,
    lotteryPrize: 20000,
    instantPrizes: 5000,
    startDate: new Date("2024-07-01"),
    endDate: new Date("2024-07-31"),
    status: "futuro",
    totalInstantTicketsToCreate: 1000000,
    numInstantPrizesToDistribute: 200,
    minInstantPrizeValue: 20,
    maxInstantPrizeValue: 2000,
    generatedInstantPrizes: [], // Ainda não gerado
    capitalizadoraWinningNumbersInput: "",
    capitalizadoraNumbers: [],
  },
]

// Utility functions
export const formatDateDisplay = (date: Date) => {
  return format(date, "dd/MM/yyyy", { locale: ptBR })
}

// These functions might become obsolete if costPlanId and linkedScratchCards are removed from LotteryEdition
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
  // This function might need significant refactoring or removal if the data model changes
  // For now, it's kept as is, assuming costPlanId and linkedScratchCards might still be used elsewhere or adapted.
  const costPlan = expensePlans.find(
    (p) => (lotteryEdition as any).costPlanId && p.id === (lotteryEdition as any).costPlanId,
  )

  let estimatedGrossRevenue = 0
  let totalInstantPrizesDistributed = 0

  if ((lotteryEdition as any).linkedScratchCards) {
    ;(lotteryEdition as any).linkedScratchCards.forEach((linkedSc: LinkedScratchCard) => {
      const scDetails = scratchCards.find((sc) => sc.id === linkedSc.scratchCardId)
      if (scDetails && costPlan) {
        estimatedGrossRevenue += linkedSc.expectedSalesVolume * costPlan.sellingPrice
        totalInstantPrizesDistributed += linkedSc.instantPrizesToDistribute
      }
    })
  }

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
