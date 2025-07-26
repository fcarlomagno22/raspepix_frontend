import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string | undefined | null, locale = "pt-BR", currency = "BRL") {
  if (value === undefined || value === null || value === "") {
    return "0,00"
  }
  const numValue = typeof value === "string" ? Number.parseFloat(value as string) : (value as number)

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(numValue)
}

export function formatNumberWithThousandsSeparator(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return ""
  }
  // Formats integers with thousands separator (dot in pt-BR)
  return new Intl.NumberFormat("pt-BR", {
    useGrouping: true,
    maximumFractionDigits: 0, // No decimal places for this specific function
  }).format(value)
}

export function parseNumberFromFormattedString(value: string | undefined | null): number | null {
  if (value === undefined || value === null || value === "") {
    return null
  }
  // Remove all non-digit characters except for the decimal comma, then replace comma with dot
  const cleanedValue = value.replace(/\./g, "").replace(/,/g, ".")
  const parsed = Number.parseInt(cleanedValue, 10)
  return isNaN(parsed) ? null : parsed
}

// Utility functions for decimal numbers with thousands/decimal separators
export function formatNumberWithDecimalSeparator(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return ""
  }
  // Formats numbers with thousands separator (dot) and decimal comma, always two decimal places
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(value)
}

export function parseNumberFromDecimalFormattedString(value: string | undefined | null): number {
  if (value === undefined || value === null || value === "") {
    return 0 // Return 0 for empty/null/undefined input
  }
  // Remove thousands separator ('.') and replace decimal comma (',') with dot ('.')
  const cleanedValue = value.replace(/\./g, "").replace(/,/g, ".")
  const parsed = Number.parseFloat(cleanedValue)
  return isNaN(parsed) ? 0 : parsed // Return 0 for NaN
}

// New function to export data to CSV
export function exportToCsv<T extends Record<string, any>>(filename: string, data: T[], headers?: string[]) {
  if (!data || data.length === 0) {
    console.warn("No data to export.")
    return
  }

  const csvRows = []
  const actualHeaders = headers || Object.keys(data[0])

  // Add header row
  csvRows.push(actualHeaders.join(","))

  // Add data rows
  for (const row of data) {
    const values = actualHeaders.map((header) => {
      const value = row[header]
      // Handle numbers with decimal formatting for CSV
      if (typeof value === "number") {
        return formatNumberWithDecimalSeparator(value).replace(/\./g, "").replace(/,/g, ".") // Ensure dot for CSV decimal
      }
      // Escape values that contain commas or double quotes
      const stringValue = String(value || "")
      return `"${stringValue.replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(","))
  }

  const csvString = csvRows.join("\n")
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Add the missing exports
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export function renderStatusIndicator(status: string) {
  switch (status) {
    case "ativo":
      return <span className="h-2 w-2 rounded-full bg-green-500" />
    case "inativo":
      return <span className="h-2 w-2 rounded-full bg-red-500" />
    case "pendente":
      return <span className="h-2 w-2 rounded-full bg-yellow-500" />
    case "aberto":
      return <span className="h-2 w-2 rounded-full bg-yellow-400" />
    case "em_atendimento":
      return <span className="h-2 w-2 rounded-full bg-blue-400" />
    case "resolvido":
      return <span className="h-2 w-2 rounded-full bg-green-400" />
    default:
      return null
  }
}

export function formatCPF(cpf: string): string {
  // Remove non-numeric characters
  const cleaned = cpf.replace(/\D/g, "")
  // Apply CPF mask (XXX.XXX.XXX-XX)
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}
