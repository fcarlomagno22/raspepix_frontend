export type InstitutionalSettings = {
  companyName: string
  supportEmail: string
  instagramUrl: string
  tiktokUrl: string
  facebookUrl: string
}

export type Role = "Administrador" | "Gestão" | "Financeiro" | "Suporte"

export type PagePermission =
  | "dashboard"
  | "clientes"
  | "auditoria"
  | "portaldosorteado"
  | "integracao"
  | "influencers"
  | "afiliados"
  | "hq"
  | "configuracoes"

export type AdminUser = {
  id: string
  name: string
  cpf: string
  email: string
  role: Role
  isActive: boolean
  permissions: PagePermission[]
}

export type AffiliateDB = {
  user_id: string
  commission_rate: number
  is_active: boolean
}

export type UserDB = {
  id: string
  name: string
  email: string
  phone: string | null
  document: string | null
  affiliate_code: string | null
  is_influencer: boolean
  status: string
}

export type TransactionDB = {
  id: string
  user_id: string // ID do usuário que fez a transação (pode ser o indicado)
  type: string
  amount: number
  status: string
  description: string | null
  reference_id: string | null
  created_at: string
}

export type LotteryEditionDB = {
  id: string
  name: string
  start_date: string
  end_date: string
  current?: boolean // Adicionado para compatibilidade com o mock, mas não vem do DB diretamente
}
