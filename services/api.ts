import axios from 'axios';
import Cookies from 'js-cookie';
import type { Notification } from "@/types/notification"

// Configuração base do axios
export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Método fetch para compatibilidade com código existente
api.fetch = async (url: string, options: RequestInit = {}) => {
  try {
    const method = options.method?.toLowerCase() || 'get';
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    
    const response = await api({
      url: url.replace(api.defaults.baseURL || '', ''),
      method,
      data: body,
      headers: options.headers
    });

    return {
      ok: true,
      status: response.status,
      json: async () => response.data,
      text: async () => JSON.stringify(response.data)
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        status: error.response?.status || 500,
        json: async () => error.response?.data || {},
        text: async () => JSON.stringify(error.response?.data || {})
      };
    }
    throw error;
  }
};

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const isAdminRoute = config.url?.includes('/api/admin/') || 
                      config.url?.includes('/api/notificacao/admin') ||
                      config.url?.includes('/api/sorteio/edicoes');
                      
  const token = isAdminRoute ? Cookies.get('admin_token') : Cookies.get('access_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Não autorizado
      const isAdminRoute = error.config.url?.includes('/api/admin/') || 
                          error.config.url?.includes('/api/notificacao/admin') ||
                          error.config.url?.includes('/api/sorteio/edicoes');
      
      throw new Error(isAdminRoute 
        ? 'Sessão de administrador expirada. Por favor, faça login novamente.'
        : 'Não autorizado. Por favor, faça login novamente.'
      );
    }

    if (error.response?.status === 404) {
      throw new Error('Recurso não encontrado. Verifique a URL da API.');
    }
    
    if (error.response?.status === 500) {
      throw new Error(error.response.data?.error || 'Erro interno do servidor. Tente novamente mais tarde.');
    }
    
    throw error;
      }
);

export interface UserNotificationsResponse {
  notifications: {
    id: string;
    title: string;
    message: string;
    read: boolean;
    important: boolean;
    date: string;
    time: string;
    created_at: string;
    target_type: "all" | "selected" | "single";
    is_active: boolean;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getUserNotifications = async (page: number = 1): Promise<UserNotificationsResponse> => {
  try {
    const response = await api.get('/api/notificacao', {
      params: { 
        page,
        limit: 10
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Não foi possível carregar suas notificações. Por favor, tente novamente.');
      }
    throw error;
  }
}

// Mantendo as outras funções existentes mas adaptando para usar o axios
export const createNotification = async (notification: Omit<Notification, "id" | "created_at" | "date" | "time" | "status">) => {
  try {
    const payload = {
      title: notification.title,
      message: notification.message,
      target_type: notification.target_type,
      is_active: true,
      target_users: notification.target_type === "selected" ? notification.target_users : undefined,
      single_user_id: notification.target_type === "single" ? notification.single_user_id : undefined
    };

    const response = await api.post('/api/notificacao', payload);
    return response.data.notification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw new Error('Não foi possível criar a notificação. Por favor, tente novamente.');
  }
} 

export const updateNotification = async (
  id: string,
  notification: Omit<Notification, "id" | "created_at" | "date" | "time" | "status">
) => {
  try {
    const payload = {
      title: notification.title,
      message: notification.message,
      target_type: notification.target_type || "all",
      is_active: notification.is_active,
      target_users: notification.target_users || [],
      single_user_id: notification.single_user_id || null
    };

    const response = await api.put(`/api/notificacao/${id}`, payload);
    return response.data.notification;
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    throw new Error('Não foi possível salvar as alterações. Por favor, tente novamente mais tarde.');
  }
} 

export const deleteNotification = async (id: string) => {
  try {
    await api.delete(`/api/notificacao/${id}`);
    return true;
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
    throw new Error('Não foi possível excluir a notificação. Por favor, tente novamente.');
  }
} 

export const hideNotification = async (id: string) => {
  try {
    const response = await api.patch(`/api/notificacao/${id}/ocultar`);
    return response.data.notification;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Notificação não encontrada.');
      }
      throw new Error(error.response?.data?.error || 'Erro ao ocultar notificação');
    }
    throw error;
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const response = await api.patch(`/api/notificacao/${id}/visualizar`);
    return response.data.notification;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Notificação não encontrada.');
      }
      throw new Error(error.response?.data?.error || 'Erro ao marcar notificação como lida');
    }
    throw error;
  }
};

export interface ApiUser {
  full_name: string
  cpf: string
  uuid: string
}

export const getUsers = async (): Promise<{ users: ApiUser[] }> => {
  try {
    const response = await api.get('/api/admin/usuarios');
    const { data } = response.data;
    return { users: data };
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error('Não foi possível carregar a lista de usuários');
  }
} 