"use client"

import { useState, useEffect } from "react"
import { fetchWithdrawRequests, WithdrawRequest } from "@/services/saques"

export function useWithdrawRequests() {
  const [pendingWithdraws, setPendingWithdraws] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPendingWithdraws() {
      try {
        setIsLoading(true)
        const response = await fetchWithdrawRequests()
        const pendingAmount = response.data
          .filter(request => request.status === "pendente")
          .reduce((total, request) => total + request.valor, 0)
        
        setPendingWithdraws(pendingAmount)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingWithdraws()
  }, [])

  return {
    pendingWithdraws,
    isLoading,
    error
  }
}
