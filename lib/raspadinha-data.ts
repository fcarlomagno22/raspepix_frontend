import type { UserProfile } from "@/types/admin" // Assuming UserProfile type exists in types/admin.ts

export interface Raspadinha {
  id: string
  price: number
  max_prize: number
  image_url: string
  mask_image_url: string // Added for the scratchable mask
}

// Mock data for a single scratch card
const mockRaspadinha: Raspadinha = {
  id: "super-raspepix-1",
  price: 10.0,
  max_prize: 500.0,
  image_url: "/images/scratch-cards/super-raspepix.png",
  mask_image_url: "/images/login-scratch.png", // Using an existing blob for the mask texture
}

// Mock user profile data
let mockUserProfile: UserProfile = {
  id: "user-123",
  name: "João Silva",
  email: "joao@example.com",
  saldo_sacavel: 100.0,
  is_influencer: true,
  // Add other properties from UserProfile if necessary
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
  status: "active",
  phone: "11999999999",
  document: "12345678900",
  address: "Rua Exemplo, 123",
  city: "São Paulo",
  state: "SP",
  zip_code: "01000000",
  birth_date: "2000-01-01",
  gender: "male",
  profile_picture: "/placeholder.svg?height=100&width=100",
  affiliate_code: "AFF123",
  total_deposits: 500,
  total_withdrawals: 200,
  total_prizes: 150,
  total_commissions: 50,
  last_deposit_at: new Date().toISOString(),
  last_withdrawal_at: new Date().toISOString(),
  last_prize_at: new Date().toISOString(),
  last_commission_at: new Date().toISOString(),
  bank_account: {
    bank_name: "Banco Exemplo",
    account_number: "12345-6",
    agency_number: "0001",
    account_type: "checking",
    pix_key: "joao@pix.com",
    pix_key_type: "email",
  },
}

// Simulate fetching raspadinha data
export async function fetchRaspadinhaData(): Promise<Raspadinha> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRaspadinha)
    }, 500) // Simulate network delay
  })
}

// Simulate fetching user profile
export async function fetchUserProfile(): Promise<UserProfile> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUserProfile)
    }, 300) // Simulate network delay
  })
}

// Simulate updating scratch card purchase (e.g., marking as scratched, recording prize)
export async function updateScratchCardPurchase(cardId: string, prizeWon: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Simulating update for card ${cardId}: prize won = ${prizeWon}`)
      // In a real app, you'd update a database record here
      resolve(true)
    }, 200)
  })
}

// Simulate updating user balance
export async function updateUserProfileBalance(userId: string, newBalance: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockUserProfile = { ...mockUserProfile, saldo_sacavel: newBalance }
      console.log(`Simulating update for user ${userId}: new balance = ${newBalance}`)
      resolve(true)
    }, 200)
  })
}

// Add a new function to generate an 8-digit lucky number
export function generateLuckyNumber(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}

// Update the calculatePrize function
// Simulate prize calculation (random for demonstration)
export function calculatePrize(): number {
  const winChance = 0.5 // 50% chance to win something
  if (Math.random() < winChance) {
    // Simulate winning a random amount between 1.00 and 5000.00
    const prize = Number.parseFloat((Math.random() * 4999 + 1).toFixed(2)) // Min 1.00, Max 5000.00
    return prize
  } else {
    return 0 // No prize
  }
}
