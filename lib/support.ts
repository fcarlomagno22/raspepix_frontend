import type { SupportTicket } from "./utils" // Assuming SupportTicket is defined in utils.ts

// Mock data for support tickets
const mockTickets: SupportTicket[] = [
  {
    id: "ticket-1",
    titulo: "Problema com Saque Pix",
    mensagem: "Tentei sacar R$ 500,00 mas o valor não caiu na minha conta.",
    status: "aberto",
    data_criacao: "2024-05-10T10:00:00Z",
    ultima_atualizacao: "2024-05-10T10:00:00Z",
    messages: [
      {
        sender: "user",
        text: "Tentei sacar R$ 500,00 mas o valor não caiu na minha conta.",
        timestamp: "2024-05-10T10:00:00Z",
      },
    ],
  },
  {
    id: "ticket-2",
    titulo: "Dúvida sobre Bônus de Indicação",
    mensagem: "Como funciona o bônus para indicar novos usuários?",
    status: "em_atendimento",
    data_criacao: "2024-05-09T14:30:00Z",
    ultima_atualizacao: "2024-05-10T11:15:00Z",
    messages: [
      { sender: "user", text: "Como funciona o bônus para indicar novos usuários?", timestamp: "2024-05-09T14:30:00Z" },
      {
        sender: "agent",
        text: "Olá! O bônus de indicação funciona da seguinte forma...",
        timestamp: "2024-05-10T11:15:00Z",
      },
    ],
  },
  {
    id: "ticket-3",
    titulo: "Erro ao Carregar Raspadinha",
    mensagem: "A raspadinha 'Super RaspePix' não está carregando.",
    status: "resolvido",
    data_criacao: "2024-05-08T09:00:00Z",
    ultima_atualizacao: "2024-05-08T16:45:00Z",
    messages: [
      { sender: "user", text: "A raspadinha 'Super RaspePix' não está carregando.", timestamp: "2024-05-08T09:00:00Z" },
      {
        sender: "agent",
        text: "Verificamos e corrigimos o problema. Por favor, tente novamente.",
        timestamp: "2024-05-08T16:00:00Z",
      },
      { sender: "user", text: "Funcionou! Obrigado!", timestamp: "2024-05-08T16:45:00Z" },
    ],
  },
  {
    id: "ticket-4",
    titulo: "Sugestão de Nova Raspadinha",
    mensagem: "Gostaria de sugerir uma raspadinha com tema de futebol.",
    status: "aberto",
    data_criacao: "2024-05-07T11:00:00Z",
    ultima_atualizacao: "2024-05-07T11:00:00Z",
    messages: [
      {
        sender: "user",
        text: "Gostaria de sugerir uma raspadinha com tema de futebol.",
        timestamp: "2024-05-07T11:00:00Z",
      },
    ],
  },
  {
    id: "ticket-5",
    titulo: "Problema de Login",
    mensagem: "Não consigo acessar minha conta, a senha não funciona.",
    status: "aberto",
    data_criacao: "2024-05-06T17:00:00Z",
    ultima_atualizacao: "2024-05-06T17:00:00Z",
    messages: [
      {
        sender: "user",
        text: "Não consigo acessar minha conta, a senha não funciona.",
        timestamp: "2024-05-06T17:00:00Z",
      },
    ],
  },
  {
    id: "ticket-6",
    titulo: "Dúvida sobre Termos de Uso",
    mensagem: "Onde posso encontrar os termos de uso completos da plataforma?",
    status: "resolvido",
    data_criacao: "2024-05-05T09:30:00Z",
    ultima_atualizacao: "2024-05-05T10:00:00Z",
    messages: [
      {
        sender: "user",
        text: "Onde posso encontrar os termos de uso completos da plataforma?",
        timestamp: "2024-05-05T09:30:00Z",
      },
      {
        sender: "agent",
        text: "Você pode encontrar nossos termos de uso em [link].",
        timestamp: "2024-05-05T10:00:00Z",
      },
    ],
  },
  {
    id: "ticket-7",
    titulo: "Depósito não Creditado",
    mensagem: "Fiz um depósito via Pix há 30 minutos e ainda não apareceu no meu saldo.",
    status: "em_atendimento",
    data_criacao: "2024-05-04T13:00:00Z",
    ultima_atualizacao: "2024-05-04T13:45:00Z",
    messages: [
      {
        sender: "user",
        text: "Fiz um depósito via Pix há 30 minutos e ainda não apareceu no meu saldo.",
        timestamp: "2024-05-04T13:00:00Z",
      },
      {
        sender: "agent",
        text: "Por favor, nos informe o comprovante para verificarmos.",
        timestamp: "2024-05-04T13:45:00Z",
      },
    ],
  },
  {
    id: "ticket-8",
    titulo: "Problema com Notificações",
    mensagem: "Não estou recebendo notificações de novos sorteios.",
    status: "aberto",
    data_criacao: "2024-05-03T10:00:00Z",
    ultima_atualizacao: "2024-05-03T10:00:00Z",
    messages: [
      {
        sender: "user",
        text: "Não estou recebendo notificações de novos sorteios.",
        timestamp: "2024-05-03T10:00:00Z",
      },
    ],
  },
  {
    id: "ticket-9",
    titulo: "Conta Bloqueada",
    mensagem: "Minha conta foi bloqueada sem aviso prévio.",
    status: "aberto",
    data_criacao: "2024-05-02T16:00:00Z",
    ultima_atualizacao: "2024-05-02T16:00:00Z",
    messages: [
      { sender: "user", text: "Minha conta foi bloqueada sem aviso prévio.", timestamp: "2024-05-02T16:00:00Z" },
    ],
  },
  {
    id: "ticket-10",
    titulo: "Dúvida sobre Prêmios",
    mensagem: "Como faço para resgatar um prêmio que ganhei?",
    status: "resolvido",
    data_criacao: "2024-05-01T11:00:00Z",
    ultima_atualizacao: "2024-05-01T11:30:00Z",
    messages: [
      { sender: "user", text: "Como faço para resgatar um prêmio que ganhei?", timestamp: "2024-05-01T11:00:00Z" },
      {
        sender: "agent",
        text: "Para resgatar seu prêmio, siga os passos em [link].",
        timestamp: "2024-05-01T11:30:00Z",
      },
    ],
  },
]

// Simulate unread messages for some tickets
const unreadMessages: { [key: string]: boolean } = {
  "ticket-1": true,
  "ticket-4": true,
  "ticket-5": true,
  "ticket-8": true,
  "ticket-9": true,
}

export const getAllSupportTickets = async (): Promise<SupportTicket[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockTickets.sort((a, b) => new Date(b.ultima_atualizacao).getTime() - new Date(a.ultima_atualizacao).getTime())
}

export const getTicketMessages = async (ticketId: string): Promise<SupportTicket["messages"]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 200))
  const ticket = mockTickets.find((t) => t.id === ticketId)
  return ticket ? ticket.messages : []
}

export const addSupportMessage = async (
  ticketId: string,
  sender: "user" | "agent",
  text: string,
): Promise<SupportTicket["messages"]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  const ticketIndex = mockTickets.findIndex((t) => t.id === ticketId)
  if (ticketIndex > -1) {
    const newMessage = { sender, text, timestamp: new Date().toISOString() }
    mockTickets[ticketIndex].messages.push(newMessage)
    mockTickets[ticketIndex].ultima_atualizacao = newMessage.timestamp
    // If agent sends first message to an 'aberto' ticket, change status to 'em_atendimento'
    if (sender === "agent" && mockTickets[ticketIndex].status === "aberto") {
      mockTickets[ticketIndex].status = "em_atendimento"
    }
    return mockTickets[ticketIndex].messages
  }
  return []
}

export const updateTicketStatus = async (ticketId: string, newStatus: SupportTicket["status"]): Promise<boolean> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 200))
  const ticketIndex = mockTickets.findIndex((t) => t.id === ticketId)
  if (ticketIndex > -1) {
    mockTickets[ticketIndex].status = newStatus
    mockTickets[ticketIndex].ultima_atualizacao = new Date().toISOString()
    return true
  }
  return false
}

export const countUnreadMessages = (ticketId: string): boolean => {
  return unreadMessages[ticketId] || false
}

export const markMessageAsRead = (ticketId: string) => {
  if (unreadMessages[ticketId]) {
    unreadMessages[ticketId] = false
  }
}

// Mock function for getting client name (assuming a client ID is associated with the ticket)
export const getClientName = (ticketId: string): string => {
  // In a real app, you'd fetch this from a user service based on ticket.userId
  const clientNames: { [key: string]: string } = {
    "ticket-1": "João Silva",
    "ticket-2": "Maria Oliveira",
    "ticket-3": "Carlos Souza",
    "ticket-4": "Ana Costa",
    "ticket-5": "Pedro Santos",
    "ticket-6": "Juliana Lima",
    "ticket-7": "Fernando Rocha",
    "ticket-8": "Beatriz Alves",
    "ticket-9": "Rafael Pereira",
    "ticket-10": "Camila Mendes",
  }
  return clientNames[ticketId] || "Cliente Desconhecido"
}
