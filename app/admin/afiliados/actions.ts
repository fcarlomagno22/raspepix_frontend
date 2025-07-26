"use server"

import { createClient } from "@/lib/supabase"
import { parseISO, isWithinInterval } from "date-fns"
import type { TransactionDB, LotteryEditionDB } from "@/types/admin"

const supabase = createClient()

type AffiliateProcessed = {
  id: string
  nome_completo: string
  is_active: boolean
  commission_rate: number
  direct_referrals: number
  total_deposited: number
  commission_received: number
}

export async function getLotteryEditions(): Promise<LotteryEditionDB[]> {
  const { data, error } = await supabase
    .from("lottery_editions")
    .select("id, name, start_date, end_date")
    .order("start_date", { ascending: false })

  if (error) {
    console.error("Error fetching lottery editions:", error)
    throw new Error("Failed to fetch lottery editions.")
  }

  // Add 'current' flag based on current date, or assume the first one is current for mock compatibility
  const editions = data.map((edition) => ({
    ...edition,
    current: isWithinInterval(new Date(), { start: parseISO(edition.start_date), end: parseISO(edition.end_date) }),
  }))

  return editions
}

export async function getAffiliatesData(
  editionId: string,
  searchTerm?: string,
): Promise<{
  affiliates: AffiliateProcessed[]
  kpis: { totalActiveAffiliates: number; totalReferrals: number; totalDeposited: number; totalCommissions: number }
}> {
  try {
    // 1. Get edition dates
    const { data: editionData, error: editionError } = await supabase
      .from("lottery_editions")
      .select("start_date, end_date")
      .eq("id", editionId)
      .single()

    if (editionError || !editionData) {
      console.error("Error fetching edition dates:", editionError)
      throw new Error("Failed to fetch edition dates.")
    }

    const editionStartDate = parseISO(editionData.start_date)
    const editionEndDate = parseISO(editionData.end_date)

    // 2. Get all affiliates with user details
    let query = supabase.from("affiliates").select(`
        user_id,
        commission_rate,
        is_active,
        users (
          name,
          email,
          affiliate_code
        )
      `)

    if (searchTerm) {
      query = query.ilike("users.name", `%${searchTerm}%`)
    }

    const { data: affiliatesData, error: affiliatesError } = await query

    if (affiliatesError) {
      console.error("Error fetching affiliates:", affiliatesError)
      throw new Error("Failed to fetch affiliates.")
    }

    // 3. Get all relevant transactions for the edition period
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("user_id, type, amount, created_at, description") // description might contain referred_id or similar
      .gte("created_at", editionStartDate.toISOString())
      .lte("created_at", editionEndDate.toISOString())
      .eq("type", "deposit") // Only consider deposits for referrals/commissions

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError)
      throw new Error("Failed to fetch transactions.")
    }

    // Process data to calculate KPIs and affiliate metrics
    const processedAffiliatesMap = new Map<string, AffiliateProcessed>()

    affiliatesData.forEach((aff: any) => {
      // Use 'any' for now due to nested select type complexity
      if (aff.users) {
        processedAffiliatesMap.set(aff.user_id, {
          id: aff.user_id,
          nome_completo: aff.users.name,
          is_active: aff.is_active,
          commission_rate: aff.commission_rate,
          direct_referrals: 0,
          total_deposited: 0,
          commission_received: 0,
        })
      }
    })

    transactionsData.forEach((tx: TransactionDB) => {
      // Assuming 'description' or a similar field in 'transactions' contains the affiliate_code of the referrer
      // This part needs to be adapted based on how you link deposits to affiliates.
      // For now, I'll simulate by checking if the user_id of the transaction is an affiliate's referred user.
      // In a real scenario, you'd likely have a 'referrer_id' column in 'transactions' or 'users' table.
      // For this example, I'll assume `tx.description` contains the `affiliate_code` of the referrer.
      // This is a simplification. A more robust solution would involve a `referrer_user_id` in the `transactions` table.

      // Let's find the affiliate who referred this user (tx.user_id)
      const referredUserAffiliateCode = affiliatesData.find((aff) => aff.users?.affiliate_code === tx.description)
        ?.users?.affiliate_code

      if (referredUserAffiliateCode) {
        const referringAffiliate = affiliatesData.find((aff) => aff.users?.affiliate_code === referredUserAffiliateCode)
        if (referringAffiliate && processedAffiliatesMap.has(referringAffiliate.user_id)) {
          const affiliateEntry = processedAffiliatesMap.get(referringAffiliate.user_id)!
          affiliateEntry.direct_referrals += 1 // Count as a referral
          affiliateEntry.total_deposited += tx.amount
          affiliateEntry.commission_received += tx.amount * (affiliateEntry.commission_rate / 100)
          processedAffiliatesMap.set(referringAffiliate.user_id, affiliateEntry)
        }
      }
    })

    const processedAffiliates = Array.from(processedAffiliatesMap.values()).filter(
      (aff) => aff.direct_referrals > 0 || aff.commission_received > 0,
    ) // Only show active affiliates for this edition

    // Calculate KPIs
    const totalActiveAffiliates = processedAffiliates.filter((aff) => aff.is_active).length
    const totalReferrals = processedAffiliates.reduce((sum, aff) => sum + aff.direct_referrals, 0)
    const totalDeposited = processedAffiliates.reduce((sum, aff) => sum + aff.total_deposited, 0)
    const totalCommissions = processedAffiliates.reduce((sum, aff) => sum + aff.commission_received, 0)

    return {
      affiliates: processedAffiliates,
      kpis: {
        totalActiveAffiliates,
        totalReferrals,
        totalDeposited,
        totalCommissions,
      },
    }
  } catch (error) {
    console.error("Error in getAffiliatesData:", error)
    throw new Error("Failed to fetch affiliates data.")
  }
}

export async function updateAffiliateCommission(affiliateId: string, newCommissionRate: number): Promise<void> {
  const { error } = await supabase
    .from("affiliates")
    .update({ commission_rate: newCommissionRate })
    .eq("user_id", affiliateId)

  if (error) {
    console.error("Error updating affiliate commission:", error)
    throw new Error("Failed to update affiliate commission.")
  }
}

export async function updateMultipleAffiliateCommissions(
  affiliateIds: string[],
  newCommissionRate: number,
): Promise<void> {
  const updates = affiliateIds.map((id) => ({
    user_id: id,
    commission_rate: newCommissionRate,
  }))

  const { error } = await supabase.from("affiliates").upsert(updates, { onConflict: "user_id" }) // Use upsert to update existing rows

  if (error) {
    console.error("Error updating multiple affiliate commissions:", error)
    throw new Error("Failed to update multiple affiliate commissions.")
  }
}

export async function updateAllActiveAffiliateCommissions(newCommissionRate: number): Promise<void> {
  const { error } = await supabase
    .from("affiliates")
    .update({ commission_rate: newCommissionRate })
    .eq("is_active", true) // Only update active affiliates

  if (error) {
    console.error("Error updating all active affiliate commissions:", error)
    throw new Error("Failed to update all active affiliate commissions.")
  }
}
