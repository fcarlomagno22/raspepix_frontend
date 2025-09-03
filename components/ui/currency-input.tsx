import React, { useState } from "react"
import { Input } from "./input"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number
  onChange: (value: number) => void
}

export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    return value ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value

    // Remove todos os caracteres não numéricos
    value = value.replace(/[^\d]/g, "")

    // Converte para número e divide por 100 para considerar os centavos
    const numericValue = Number(value) / 100

    // Formata o valor para exibição
    const formattedValue = numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })

    setDisplayValue(formattedValue)
    onChange(numericValue)
  }

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
    />
  )
}