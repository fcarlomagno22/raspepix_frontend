export type NotificationTargetType = "all" | "selected" | "single"

export interface User {
  id: string
  name: string
  cpf: string
  email: string
}

export interface Notification {
  id: string
  title: string
  message: string
  target_type: NotificationTargetType
  single_user_id?: string
  target_users?: string[]
  is_active: boolean
  created_at: string
  date: string
  time: string
  status: string
}

// Novas interfaces para sorteios
export interface ConfigPremiosInstantaneos {
  total_titulos: number
  quantidade_premios: number
  valor_minimo: number
  valor_maximo: number
}

export interface BilheteInstantaneo {
  numero_titulo: string
  valor_premio: number | null
  premiado: boolean
  utilizado: boolean
  usado_em: string | null
  edicao_sorteio_id?: string
  created_at?: string
}

export interface EdicaoSorteio {
  nome: string
  valor_sorteio: number
  valor_premios_instantaneos: number
  data_inicio: string
  data_fim: string
  configPremiosInstantaneos: ConfigPremiosInstantaneos
  bilhetesInstantaneos: BilheteInstantaneo[]
}

export interface RespostaSorteio {
  numero_titulo: string
  valor_premio: number | null
  premiado: boolean
  utilizado: boolean
  usado_em: string | null
}

export interface NumeroCapitalizadora {
  numero: string;
  utilizado: boolean;
  comprador_nome?: string;
  comprador_cpf?: string;
  status_pagamento?: string;
  uuid: string;
}
