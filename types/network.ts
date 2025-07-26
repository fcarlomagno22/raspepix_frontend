export type NetworkLevel = 1 | 2 | 3;

export type MemberType = 'client' | 'influencer';

export type MemberStatus = 'active' | 'inactive';

export interface NetworkMember {
  id: string;
  name: string;
  username: string;
  type: MemberType;
  status: MemberStatus;
  level: NetworkLevel;
  totalGenerated: number;
  registeredAt: string;
  photoUrl?: string;
  children?: NetworkMember[];
}

export interface LevelStats {
  level: NetworkLevel;
  percentage: number;
  totalMembers: number;
  activeMembers: number;
  totalCommissions: number;
  monthlyCommissions: number;
  conversionRate: number;
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
  id: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'document' | 'link';
  url: string;
  category: 'social' | 'whatsapp' | 'email' | 'presentation';
  tags: string[];
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