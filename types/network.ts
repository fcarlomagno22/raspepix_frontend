export type NetworkLevel = 1 | 2 | 3;

export type MemberType = 'client' | 'influencer';

export type MemberStatus = 'active' | 'inactive';

export interface NetworkMember {
  id: string
  name: string
  photoUrl?: string
  type: "client" | "influencer" | "user"
  accepted_terms?: boolean
  level: number
  joinedAt: string
  totalEarnings: number
  status?: "ativo" | "bloqueado" | "inativo"
  indicador_direto?: {
    id: string
    nome_indicador: string
  }
  children?: NetworkMember[]
}

export interface LevelStats {
  level: 1 | 2 | 3
  percentage: number
  totalMembers: number
  activeMembers: number
  totalCommissions: number
  monthlyCommissions: number
  conversionRate: number
}

export interface NetworkTransaction {
  id: string;
  memberId: string;
  memberName: string;
  level: NetworkLevel;
  type: MemberType;
  amount: number;
  commission: number;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export interface NetworkMetrics {
  totalMembers: number;
  activeMembers: number;
  totalCommissions: number;
  conversionRate: number;
  growthRate: number;
  bestPerformingLevel: NetworkLevel;
  topInfluencers: NetworkMember[];
}

export interface MarketingResource {
  id: string
  title: string
  description: string
  type: "document" | "image" | "video" | "link"
  category: "social" | "whatsapp" | "email" | "presentation"
  url: string
  tags?: string[]
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'network_size' | 'commission_value' | 'conversion_rate' | 'activity';
  progress: number;
  goal: number;
  reward?: {
    type: 'bonus' | 'badge' | 'feature';
    value: string;
  };
  unlockedAt?: string;
}

export interface InviteLink {
  id: string;
  type: MemberType;
  code: string;
  url: string;
  clicks: number;
  conversions: number;
  createdAt: string;
}

// Novos tipos para a área administrativa
export interface NetworkStats {
  level: number
  members: number
  revenue: number
  commissions: number
  commissionRate: number
}

export interface NetworkOverviewData {
  totalMembers: number
  totalRevenue: number
  totalCommissions: number
  averageCommissionRate: number
  levelStats: NetworkStats[]
}

// Removido para evitar conflito com o tipo do PromotionsManager

export interface CommissionLevel {
  level: number
  percentage: number
  description: string
}

// Tipos para a API de afiliados
export interface InfluencerComissao {
  nivel: "direto" | "secundario" | "expandido"
  percentual: number
}

export interface RedeMembro {
  id: string
  nome: string
  data_cadastro: string
  volume_depositos: number
  status: "ativo" | "bloqueado" | "inativo"
  rede: {
    diretos: RedeMembro[]
    secundarios: RedeMembro[]
    expandidos: RedeMembro[]
  }
}

export interface InfluencerRede {
  diretos: RedeMembro[]
  secundarios: RedeMembro[]
  expandidos: RedeMembro[]
}

export interface Influencer {
  id: string
  nome: string
  codigo_influencer: string
  status: "ativo" | "bloqueado"
  comissoes: InfluencerComissao[]
  rede: InfluencerRede
}

export interface ApiResponse {
  data: Influencer[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
} 