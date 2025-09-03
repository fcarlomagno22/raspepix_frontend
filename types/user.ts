export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  document: string | null
  affiliate_code: string | null
  is_influencer: boolean
  status: string
  saldo_sacavel: number
  chances_instantaneas: number
  created_at: string
  last_login: string
  profile_picture?: string
  bank_account?: {
    bank_name: string
    account_number: string
    agency_number: string
    account_type: string
    pix_key: string
    pix_key_type: string
  }
}
