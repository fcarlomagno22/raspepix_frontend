import { useQuery } from "@tanstack/react-query"
import { LevelStats, NetworkMember, MarketingResource } from "@/types/network"

// TODO: Substituir por chamadas reais à API
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

// Função auxiliar para gerar membros aleatórios
const generateRandomMembers = (count: number, level: number): NetworkMember[] => {
  const names = [
    "João", "Maria", "Pedro", "Ana", "Lucas", "Julia", "Carlos", "Sofia", "Miguel", 
    "Isabella", "Arthur", "Laura", "Davi", "Valentina", "Bernardo", "Helena", "Gabriel",
    "Alice", "Heitor", "Luiza", "Theo", "Isis", "Lorenzo", "Manuela", "Rafael", "Lívia",
    "Nicolas", "Heloísa", "Daniel", "Sarah"
  ]
  const surnames = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Lima",
    "Pereira", "Costa", "Carvalho", "Gomes", "Martins", "Araújo", "Melo", "Barbosa",
    "Cardoso", "Ribeiro", "Mendes", "Pinto", "Reis", "Monteiro", "Sales", "Campos",
    "Cunha", "Moura", "Rocha", "Dias", "Nunes", "Castro"
  ]

  return Array.from({ length: count }, (_, i) => {
    const firstName = names[Math.floor(Math.random() * names.length)]
    const lastName = surnames[Math.floor(Math.random() * surnames.length)]
    const fullName = `${firstName} ${lastName}`
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`
    const isInfluencer = Math.random() > 0.7
    const isActive = Math.random() > 0.2
    const totalGenerated = Math.floor(Math.random() * 10000) + 1000

    const member: NetworkMember = {
      id: `user-l${level}-${i + 1}`,
      name: fullName,
      username,
      type: isInfluencer ? "influencer" : "client",
      status: isActive ? "active" : "inactive",
      level,
      totalGenerated,
      registeredAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      children: level < 3 ? generateRandomMembers(Math.floor(Math.random() * 5) + 4, level + 1) : undefined
    }

    return member
  })
}

const fetchNetworkTree = async (): Promise<NetworkMember> => {
  // Simula uma chamada à API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "user-root",
        name: "Seu Nome",
        username: "seunome",
        type: "influencer",
        status: "active",
        level: 1,
        totalGenerated: 55000.0,
        registeredAt: "2024-01-01T00:00:00Z",
        children: generateRandomMembers(20, 2) // 20 indicados diretos
      })
    }, 1000)
  })
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
  const {
    data: networkStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["networkStats"],
    queryFn: fetchNetworkStats,
  })

  const {
    data: networkTree,
    isLoading: isLoadingTree,
    error: treeError,
  } = useQuery({
    queryKey: ["networkTree"],
    queryFn: fetchNetworkTree,
  })

  const {
    data: marketingResources,
    isLoading: isLoadingResources,
    error: resourcesError,
  } = useQuery({
    queryKey: ["marketingResources"],
    queryFn: fetchMarketingResources,
  })

  return {
    networkStats,
    networkTree,
    marketingResources,
    isLoading: isLoadingStats || isLoadingTree || isLoadingResources,
    error: statsError || treeError || resourcesError,
  }
} 