"use client"

import { useQuery } from "@tanstack/react-query"
import { LevelStats, NetworkMember, MarketingResource } from "@/types/network"

interface NetworkTransaction {
  data: string
  cliente: string
  valor_deposito: number
  valor_comissao: number
  tipo_indicacao: string
}
import { api } from "@/services/api"
import { useInfluencerStatus } from "@/hooks/use-influencer-status"

const fetchNetworkStats = async (): Promise<LevelStats[]> => {
  // Simula uma chamada à API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          level: 1,
          percentage: 5,
          totalMembers: 125,
          activeMembers: 98,
          totalCommissions: 15000.0,
          monthlyCommissions: 3500.0,
          conversionRate: 78,
        },
        {
          level: 2,
          percentage: 3,
          totalMembers: 485,
          activeMembers: 352,
          totalCommissions: 28000.0,
          monthlyCommissions: 6500.0,
          conversionRate: 72,
        },
        {
          level: 3,
          percentage: 1,
          totalMembers: 2100,
          activeMembers: 1523,
          totalCommissions: 12000.0,
          monthlyCommissions: 2800.0,
          conversionRate: 68,
        },
      ])
    }, 1000)
  })
}

const mapApiMemberToNetworkMember = (apiMember: any, level: number = 1): NetworkMember => {
  console.log('Mapeando membro:', apiMember.nome, {
    tipo: apiMember.tipo,
    termos_aceitos: apiMember.termos_aceitos,
    total_vendas: apiMember.total_vendas_geradas
  });
  
  const member: NetworkMember = {
    id: apiMember.id,
    name: apiMember.nome,
    type: apiMember.nivel === "direto" ? "influencer" : "user",
    accepted_terms: true, // Se tem nivel "direto", assumimos que é influencer e aceitou os termos
    level: level,
    joinedAt: apiMember.data_cadastro,
    totalEarnings: apiMember.total_vendas_geradas || 0,
    indicador_direto: apiMember.indicador_direto,
    children: apiMember.indicados?.map((indicado: any) => 
      mapApiMemberToNetworkMember(indicado, level + 1)
    ) || []
  };
  return member;
};

const fetchNetworkTree = async (): Promise<NetworkMember> => {
  try {
    const response = await api.get('/api/influencers/rede/arvore-completa');
    const data = response.data;
    
    console.log('Dados brutos da API:', data);
    console.log('Primeiro membro:', data[0]);
    
    if (!data || !Array.isArray(data)) {
      throw new Error('Dados da rede inválidos');
    }

    // Criar o nó raiz (usuário logado) e adicionar os indicados diretos como filhos
    const rootMember: NetworkMember = {
      id: data[0]?.indicador_direto?.id || 'root',
      name: data[0]?.indicador_direto?.nome_indicador || 'Você',
      type: "influencer",
      accepted_terms: true, // O usuário logado já é influencer
      level: 0,
      joinedAt: new Date().toISOString(),
      totalEarnings: 0,
      children: data.map(member => mapApiMemberToNetworkMember(member))
    };

    return rootMember;
  } catch (error) {
    console.error('Erro ao buscar árvore da rede:', error);
    throw new Error('Falha ao buscar dados da rede');
  }
}

const fetchNetworkTransactions = async (): Promise<NetworkTransaction[]> => {
  try {
    const response = await api.get('/api/influencers/rede/depositos')
    return response.data
  } catch (error) {
    console.error('Erro ao buscar transações da rede:', error)
    throw new Error('Falha ao buscar transações da rede')
  }
}

const fetchMarketingResources = async (): Promise<MarketingResource[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          title: "Kit de Boas-vindas",
          description: "Material completo para novos influencers começarem com tudo!",
          type: "document",
          url: "/marketing/kit-boasvindas.pdf",
          category: "presentation",
          tags: ["iniciante", "onboarding", "tutorial"]
        },
        {
          id: "2",
          title: "Posts para Instagram",
          description: "30 templates prontos para suas redes sociais",
          type: "image",
          url: "/marketing/instagram-pack.zip",
          category: "social",
          tags: ["instagram", "redes sociais", "templates"]
        },
        {
          id: "3",
          title: "Vídeo Explicativo RaspePix",
          description: "Vídeo profissional explicando como funciona a RaspePix",
          type: "video",
          url: "/marketing/raspepix-explainer.mp4",
          category: "presentation",
          tags: ["institucional", "explicativo"]
        },
        {
          id: "4",
          title: "Mensagens para WhatsApp",
          description: "Scripts prontos para enviar no WhatsApp",
          type: "document",
          url: "/marketing/whatsapp-scripts.pdf",
          category: "whatsapp",
          tags: ["mensagens", "scripts", "whatsapp"]
        },
        {
          id: "5",
          title: "E-mail Marketing",
          description: "Templates de e-mail para diferentes ocasiões",
          type: "document",
          url: "/marketing/email-templates.html",
          category: "email",
          tags: ["email", "marketing", "templates"]
        },
        {
          id: "6",
          title: "Apresentação Comercial",
          description: "Slides profissionais para apresentar a oportunidade",
          type: "document",
          url: "/marketing/apresentacao.pptx",
          category: "presentation",
          tags: ["apresentação", "vendas"]
        }
      ])
    }, 1000)
  })
}

export function useNetwork() {
  const { isInfluencer } = useInfluencerStatus()

  const {
    data: networkStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["networkStats"],
    queryFn: fetchNetworkStats,
    enabled: isInfluencer,
  })

  const {
    data: networkTree,
    isLoading: isLoadingTree,
    error: treeError,
  } = useQuery({
    queryKey: ["networkTree"],
    queryFn: fetchNetworkTree,
    enabled: isInfluencer,
  })

  const {
    data: marketingResources,
    isLoading: isLoadingResources,
    error: resourcesError,
  } = useQuery({
    queryKey: ["marketingResources"],
    queryFn: fetchMarketingResources,
    enabled: isInfluencer,
  })

  const {
    data: networkTransactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useQuery({
    queryKey: ["networkTransactions"],
    queryFn: fetchNetworkTransactions,
    enabled: isInfluencer,
  })

  return {
    networkStats,
    networkTree,
    marketingResources,
    networkTransactions,
    isLoading: isLoadingStats || isLoadingTree || isLoadingResources || isLoadingTransactions,
    error: statsError || treeError || resourcesError || transactionsError,
  }
}