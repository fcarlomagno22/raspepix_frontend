import { api } from './api';

export interface Ticket {
  id: string;
  titulo: string;
  status: string;
  criado_em: string;
  atualizado_em: string;
  ultima_mensagem: string;
  total_mensagens: number;
}

export interface TicketMessage {
  id: string;
  mensagem: string;
  remetente_tipo: 'usuario' | 'atendente';
  remetente_id: string;
  criado_em: string;
}

export interface TicketMessagesResponse {
  mensagens: TicketMessage[];
}

export interface TicketsResponse {
  data: Ticket[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ListTicketsParams {
  status?: string;
  page?: number;
  per_page?: number;
}

export interface CreateTicketParams {
  titulo: string;
  mensagem: string; // Alterado de 'descricao' para 'mensagem' para corresponder ao esperado pela API
}

export interface CreateMessageParams {
  mensagem: string;
}

export interface TicketResponse {
  chamado: {
    id: string;
    titulo: string;
    status: string;
    criado_em: string;
    atualizado_em: string;
    // ...outros campos
  };
  mensagem?: {
    id: string;
    mensagem: string;
    criado_em: string;
    // ...outros campos
  };
}

export const suporteService = {
  async listarTickets(params: ListTicketsParams = {}): Promise<TicketsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.status) {
      queryParams.append('status', params.status);
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }

    const url = `http://localhost:3000/api/suporte/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Chamando API de tickets:', url);
    const response = await api.fetch(url);
    const data = await response.json();
    console.log('Resposta da API de tickets:', data);
    
    // Garante que a resposta esteja no formato esperado
    if (Array.isArray(data)) {
      const formattedData = data.map(ticket => ({
        ...ticket,
        ultima_mensagem: Array.isArray(ticket.ultima_mensagem) ? 
          (ticket.ultima_mensagem[ticket.ultima_mensagem.length - 1]?.mensagem || 'Sem mensagens') : 
          (ticket.ultima_mensagem || 'Sem mensagens')
      }));

      return {
        data: formattedData,
        total: data.length,
        page: params.page || 1,
        per_page: params.per_page || 5,
        total_pages: Math.ceil(data.length / (params.per_page || 5))
      };
    }
    
    return {
      ...data,
      data: data.data || [], // Garante que data seja sempre um array
    };
  },

  async criarTicket(params: CreateTicketParams): Promise<TicketResponse> {
    // Validação dos campos
    if (!params.titulo?.trim()) {
      throw new Error("O assunto do chamado é obrigatório");
    }
    if (params.titulo.trim().length < 5) {
      throw new Error("O assunto deve ter no mínimo 5 caracteres");
    }
    if (!params.mensagem?.trim()) {
      throw new Error("A mensagem inicial é obrigatória");
    }
    if (params.mensagem.trim().length < 10) {
      throw new Error("A mensagem deve ter no mínimo 10 caracteres");
    }

    try {
      console.log('Criando ticket:', params);
      const response = await api.fetch('http://localhost:3000/api/suporte/tickets', {
        method: 'POST',
        body: JSON.stringify({
          titulo: params.titulo.trim(),
          mensagem: params.mensagem.trim()
        })
      });
      
      const data = await response.json();
      console.log('Resposta da criação do ticket:', data);
      return data;
    } catch (error: any) {
      console.error('Erro ao criar ticket:', error);
      
      if (error.message === "Não autorizado" || error.message.includes("token")) {
        throw new Error("Faça login para abrir um chamado");
      }
      
      if (error.message.includes("400")) {
        throw new Error("Dados inválidos. Verifique os campos e tente novamente.");
      }
      
      if (error.message.includes("429")) {
        throw new Error("Muitas tentativas. Por favor, aguarde alguns minutos.");
      }
      
      throw new Error("Não foi possível criar o chamado. Tente novamente.");
    }
  },

  async enviarMensagem(ticketId: string, params: CreateMessageParams): Promise<any> {
    if (!ticketId) {
      throw new Error("ID do ticket é obrigatório");
    }
    if (!params.mensagem?.trim()) {
      throw new Error("A mensagem é obrigatória");
    }

    try {
      console.log('Enviando mensagem para ticket:', ticketId, params);
      const response = await api.fetch(`http://localhost:3000/api/suporte/tickets/${ticketId}/mensagens`, {
        method: 'POST',
        body: JSON.stringify({
          mensagem: params.mensagem.trim()
        })
      });
      
      const data = await response.json();
      console.log('Resposta do envio da mensagem:', data);
      return data;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      if (error.message === "Não autorizado" || error.message.includes("token")) {
        throw new Error("Faça login para enviar mensagens");
      }
      
      if (error.message.includes("404")) {
        throw new Error("Ticket não encontrado");
      }
      
      if (error.message.includes("429")) {
        throw new Error("Muitas tentativas. Por favor, aguarde alguns minutos.");
      }
      
      throw new Error("Não foi possível enviar a mensagem. Tente novamente.");
    }
  },

  async listarMensagens(ticketId: string): Promise<TicketMessagesResponse> {
    if (!ticketId) {
      throw new Error("ID do ticket é obrigatório");
    }

    try {
      console.log('Buscando mensagens do ticket:', ticketId);
      const response = await api.fetch(`http://localhost:3000/api/suporte/tickets/${ticketId}/mensagens`);
      const data = await response.json();
      console.log('Mensagens recebidas:', data);
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar mensagens:', error);
      
      if (error.message === "Não autorizado" || error.message.includes("token")) {
        throw new Error("Faça login para visualizar as mensagens");
      }
      
      if (error.message.includes("404")) {
        throw new Error("Ticket não encontrado");
      }

      if (error.message.includes("network") || error.message.includes("conectar")) {
        throw new Error("Erro ao conectar ao servidor. Verifique sua conexão.");
      }
      
      throw new Error("Não foi possível carregar as mensagens");
    }
  }
}; 

export interface AdminTicketUser {
  id: string;
  full_name: string;
  email: string;
}

export interface AdminTicket {
  id: string;
  titulo: string;
  status: 'aberto' | 'em_atendimento' | 'resolvido';
  criado_em: string;
  ultima_mensagem_em: string;
  usuario: AdminTicketUser;
  atendente?: AdminTicketUser;
  usuario_id?: string;
}

export interface UpdateTicketStatusParams {
  status: 'aberto' | 'em_atendimento' | 'resolvido';
}

export interface AdminTicketsResponse {
  tickets: AdminTicket[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ListAdminTicketsParams {
  status?: 'all' | 'aberto' | 'em_atendimento' | 'resolvido';
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface AdminTicketMessage {
  id: string;
  mensagem: string;
  remetente_tipo: 'usuario' | 'atendente';
  remetente_id: string;
  criado_em: string;
}

export interface AdminTicketMessagesResponse {
  mensagens: AdminTicketMessage[];
}

export interface SendAdminMessageParams {
  mensagem: string;
}

export const adminSuporteService = {
  async listarTickets(params: ListAdminTicketsParams = {}): Promise<AdminTicketsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      if (params.searchTerm) {
        queryParams.append('searchTerm', params.searchTerm);
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `http://localhost:3000/api/admin/suporte/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('Buscando tickets admin:', url);
      
      const response = await api.fetch(url);
      const data = await response.json();
      console.log('Resposta tickets admin:', data);
      
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar tickets admin:', error);
      
      if (error.message === "Não autorizado" || error.message.includes("token")) {
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      }
      
      if (error.message.includes("403")) {
        throw new Error("Você não tem permissão para acessar esta área");
      }
      
      if (error.message.includes("network") || error.message.includes("conectar")) {
        throw new Error("Erro ao conectar ao servidor. Verifique sua conexão.");
      }
      
      throw new Error("Não foi possível carregar os tickets");
    }
  },

  async listarMensagens(ticketId: string): Promise<AdminTicketMessagesResponse> {
    if (!ticketId) {
      throw new Error("ID do ticket é obrigatório");
    }

    try {
      const response = await api.fetch(`http://localhost:3000/api/admin/suporte/tickets/${ticketId}/mensagens`);
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar mensagens (admin):', error);
      
      if (error.message === "Não autorizado" || error.message.includes("token")) {
        throw new Error("Sessão de administrador expirada. Por favor, faça login novamente.");
      }
      
      if (error.message.includes("404")) {
        throw new Error("Ticket não encontrado");
      }

      if (error.message.includes("network") || error.message.includes("conectar")) {
        throw new Error("Erro ao conectar ao servidor. Verifique sua conexão.");
      }
      
      throw new Error("Não foi possível carregar as mensagens");
    }
  },

  async enviarMensagem(ticketId: string, params: SendAdminMessageParams): Promise<AdminTicketMessage> {
    if (!ticketId) {
      throw new Error("ID do ticket é obrigatório");
    }

    if (!params.mensagem?.trim()) {
      throw new Error("A mensagem é obrigatória");
    }

    try {
      console.log('Enviando mensagem para ticket (admin):', ticketId, params);
      const response = await api.fetch(`http://localhost:3000/api/admin/suporte/tickets/${ticketId}/mensagens`, {
        method: 'POST',
        body: JSON.stringify(params)
      });
      
      const rawData = await response.json();
      console.log('Dados brutos da resposta:', rawData);

      // Garantir que o tipo está correto na resposta
      const data = {
        ...rawData,
        remetente_tipo: rawData.remetente_tipo === 'usuario' ? 'usuario' : 'atendente'
      };

      console.log('Resposta processada:', data);
      return data;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem (admin):', error);
      
      if (error.message === "Não autorizado" || error.message.includes("token")) {
        throw new Error("Sessão de administrador expirada. Por favor, faça login novamente.");
      }
      
      if (error.message.includes("404")) {
        throw new Error("Ticket não encontrado");
      }
      
      if (error.message.includes("429")) {
        throw new Error("Muitas tentativas. Por favor, aguarde alguns minutos.");
      }
      
      throw new Error("Não foi possível enviar a mensagem");
    }
  },

  async atualizarStatus(ticketId: string, params: UpdateTicketStatusParams): Promise<AdminTicket> {
    if (!ticketId) {
      throw new Error("ID do ticket é obrigatório");
    }

    try {
      const response = await api.fetch(`http://localhost:3000/api/admin/suporte/tickets/${ticketId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: params.status
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      
      if (error.message === "Não autorizado" || error.message.includes("token")) {
        throw new Error("Sem permissão para atualizar status");
      }
      
      if (error.message.includes("404")) {
        throw new Error("Ticket não encontrado");
      }

      if (error.message.includes("network")) {
        throw new Error("Erro de conexão");
      }
      
      throw new Error("Não foi possível atualizar o status");
    }
  }
}; 