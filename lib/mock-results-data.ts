import { formatCPF } from "./utils"

export type WinnerResult = {
  id: string
  name: string
  cpf: string // Full CPF for internal use, will be masked for display
  luckyNumber: string
  prizeValue: number
  prizeType: "Raspadinha" | "Sorteio"
  edition: string
}

export const mockWinnerResults: WinnerResult[] = [
  {
    id: "1",
    name: "João Silva",
    cpf: "12345678901",
    luckyNumber: "A123456",
    prizeValue: 1500.0,
    prizeType: "Raspadinha",
    edition: "Edição de Verão 2024",
  },
  {
    id: "2",
    name: "Maria Oliveira",
    cpf: "98765432109",
    luckyNumber: "B789012",
    prizeValue: 5000.0,
    prizeType: "Sorteio",
    edition: "Edição de Verão 2024",
  },
  {
    id: "3",
    name: "Carlos Santos",
    cpf: "11122233344",
    luckyNumber: "C345678",
    prizeValue: 250.0,
    prizeType: "Raspadinha",
    edition: "Edição de Inverno 2024",
  },
  {
    id: "4",
    name: "Ana Pereira",
    cpf: "55566677788",
    luckyNumber: "D901234",
    prizeValue: 10000.0,
    prizeType: "Sorteio",
    edition: "Edição de Inverno 2024",
  },
  {
    id: "5",
    name: "Pedro Costa",
    cpf: "99988877766",
    luckyNumber: "E567890",
    prizeValue: 50.0,
    prizeType: "Raspadinha",
    edition: "Edição de Primavera 2024",
  },
  {
    id: "6",
    name: "Juliana Almeida",
    cpf: "44433322211",
    luckyNumber: "F123456",
    prizeValue: 2000.0,
    prizeType: "Sorteio",
    edition: "Edição de Primavera 2024",
  },
  {
    id: "7",
    name: "Fernando Rocha",
    cpf: "77788899900",
    luckyNumber: "G789012",
    prizeValue: 750.0,
    prizeType: "Raspadinha",
    edition: "Edição de Verão 2024",
  },
  {
    id: "8",
    name: "Beatriz Lima",
    cpf: "22211100099",
    luckyNumber: "H345678",
    prizeValue: 15000.0,
    prizeType: "Sorteio",
    edition: "Edição de Outono 2024",
  },
  {
    id: "9",
    name: "Gabriel Souza",
    cpf: "33344455566",
    luckyNumber: "I901234",
    prizeValue: 100.0,
    prizeType: "Raspadinha",
    edition: "Edição de Outono 2024",
  },
  {
    id: "10",
    name: "Larissa Martins",
    cpf: "66655544433",
    luckyNumber: "J567890",
    prizeValue: 2500.0,
    prizeType: "Sorteio",
    edition: "Edição de Outono 2024",
  },
]

// Helper to format name as "Firstname L."
export const formatWinnerName = (fullName: string): string => {
  const parts = fullName.split(" ")
  if (parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
  }
  return fullName
}

// Helper to mask CPF for display
export const maskCpfForDisplay = (cpf: string): string => {
  const formatted = formatCPF(cpf) // Use the existing formatCPF to get the full mask
  if (formatted.length === 14) {
    // Assuming formatCPF returns "XXX.XXX.XXX-XX"
    return `${formatted.substring(0, 4)}***.***-${formatted.substring(12, 14)}`
  }
  return formatted // Fallback if formatCPF doesn't return expected length
}
