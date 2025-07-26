"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: number // Value in cents
  onChange?: (value: number) => void // Callback receives value in cents
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("R$ 0,00")

    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value / 100)
        setDisplayValue(formatted)
      } else {
        setDisplayValue("R$ 0,00")
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      const numeros = raw.replace(/\D/g, "")

      if (numeros.length === 0) {
        setDisplayValue("R$ 0,00")
        onChange?.(0)
        return
      }

      const valorCentavos = Number.parseInt(numeros, 10)
      onChange?.(valorCentavos)
    }

    return (
      <Input
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        inputMode="numeric"
        placeholder="R$ 0,00"
        className={cn("bg-[#1A2430] border-[#9FFF00]/20 text-white", className)}
        {...props}
      />
    )
  },
)
CurrencyInput.displayName = "CurrencyInput"
