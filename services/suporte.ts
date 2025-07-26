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

    try {
      const response = await api.get(`/api/suporte/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar tickets:', error);
      throw new Error('Não foi possível carregar os tickets');
    }
  },

  async criarTicket(params: CreateTicketParams): Promise<TicketResponse> {
    try {
      const response = await api.post('/api/suporte/tickets', {
        titulo: params.titulo.trim(),
        mensagem: params.mensagem.trim()
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar ticket:', error);
      throw new Error(error.response?.data?.message || 'Não foi possível criar o ticket');
    }
  },

  async enviarMensagem(ticketId: string, params: CreateMessageParams): Promise<any> {
    try {
      const response = await api.post(`/api/suporte/tickets/${ticketId}/mensagens`, {
        mensagem: params.mensagem.trim()
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      throw new Error(error.response?.data?.message || 'Não foi possível enviar a mensagem');
    }
  },

  async listarMensagens(ticketId: string): Promise<TicketMessagesResponse> {
    try {
      const response = await api.get(`/api/suporte/tickets/${ticketId}/mensagens`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar mensagens:', error);
      throw new Error(error.response?.data?.message || 'Não foi possível carregar as mensagens');
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

      const response = await api.get(`/api/admin/suporte/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar tickets admin:', error);
      throw new Error(error.response?.data?.message || 'Não foi possível carregar os tickets');
    }
  },

  async listarMensagens(ticketId: string): Promise<AdminTicketMessagesResponse> {
    try {
      const response = await api.get(`/api/admin/suporte/tickets/${ticketId}/mensagens`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar mensagens admin:', error);
      throw new Error(error.response?.data?.message || 'Não foi possível carregar as mensagens');
    }
  },

  async enviarMensagem(ticketId: string, params: SendAdminMessageParams): Promise<AdminTicketMessage> {
    try {
      const response = await api.post(`/api/admin/suporte/tickets/${ticketId}/mensagens`, params);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem admin:', error);
      throw new Error(error.response?.data?.message || 'Não foi possível enviar a mensagem');
    }
  },

  async atualizarStatus(ticketId: string, params: UpdateTicketStatusParams): Promise<AdminTicket> {
    try {
      const response = await api.patch(`/api/admin/suporte/tickets/${ticketId}/status`, {
        status: params.status
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      throw new Error(error.response?.data?.message || 'Não foi possível atualizar o status');
    }
  }
}; 