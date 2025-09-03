import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN'),
  }
});

// Interceptor para adicionar o token de autorização
api.interceptors.request.use(
  config => {
    const isAdminRoute = config.url?.includes('/api/admin') || config.url?.includes('/api/sorteio/admin') || config.url?.includes('/api/transacoes/admin');
    
    // Atualiza o XSRF token em cada requisição
    const xsrfToken = Cookies.get('XSRF-TOKEN');
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    if (isAdminRoute) {
      const adminToken = Cookies.get('admin_token');
      const supabaseToken = Cookies.get('sb-kvwnpmdhyhrmfpgnojbh-auth-token');
      
      if (adminToken) {
        config.headers['Authorization'] = `Bearer ${adminToken}`;
        console.log('[API Interceptor] Using admin token');
      } else if (supabaseToken) {
        try {
          const parsedToken = JSON.parse(supabaseToken);
          config.headers['Authorization'] = `Bearer ${parsedToken.access_token}`;
          console.log('[API Interceptor] Using Supabase token');
        } catch (err) {
          console.warn('[API Interceptor] Failed to parse Supabase token:', err);
        }
      } else {
        console.warn('[API Interceptor] No valid token found for admin route');
      }
    } else {
      const token = Cookies.get('access_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Log para debug
    console.log('[API Request]', {
      url: config.url,
      method: config.method,
      isAdminRoute,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : undefined
      }
    });
    
    return config;
  },
  error => {
    console.error('[API Interceptor] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  response => response,
  error => {
    // Log detalhado do erro
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers,
      error: error.message
    });

    // Tratamento para usuário bloqueado
    if (error.response?.status === 403) {
      return Promise.reject(new Error(error.response.data.message || 'Sua conta está bloqueada. Entre em contato conosco.'));
    }

    // Tratamento para erros de autenticação (401)
    if (error.response?.status === 401) {
      const isAdminRoute = error.config?.url?.includes('/api/admin');
      const isLoginRoute = error.config?.url?.includes('/api/auth/login');
      
      // Se for rota de login, é erro de credenciais
      if (isLoginRoute) {
        return Promise.reject(new Error('Email ou senha incorretos'));
      }
      
      // Se for rota admin, mantém comportamento atual
      if (isAdminRoute) {
        return Promise.reject(new Error('Sessão expirada. Por favor, faça login novamente.'));
      }
      
      // Para outras rotas, é sessão expirada
      Cookies.remove('access_token');
      window.location.href = '/login';
      return Promise.reject(new Error('Sessão expirada'));
    }

    // Se houver uma mensagem de erro específica da API
    if (error.response?.data?.error) {
      return Promise.reject(new Error(error.response.data.error));
    }

    // Se for um erro de rede
    if (error.request) {
      return Promise.reject(new Error('Erro de conexão com o servidor'));
    }

    return Promise.reject(new Error('Ocorreu um erro inesperado'));
  }
);

// Tipos e interfaces
export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  message: string;
}

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

export interface AdminUsersResponse {
  message: string;
  data: {
    id: string;
    full_name: string;
    cpf: string;
    email: string;
    gender: string;
    birth_date: string;
    phone: string;
    state_uf: string | null;
    city: string | null;
    idade: number;
    is_active: boolean;
    created_at: string;
  }[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Helper para extrair mensagem de erro
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Prioriza a mensagem do backend
    const backendMessage = error.response?.data?.message;
    if (backendMessage) return backendMessage;
    
    // Se não houver mensagem específica, verifica se é erro de usuário bloqueado
    if (error.response?.status === 403) {
      return 'Sua conta está bloqueada. Chame a gente em contato@raspepix.com.br para saber mais.';
    }
    
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Um erro inesperado ocorreu';
};

export const getUserNotifications = async (page: number = 1): Promise<UserNotificationsResponse> => {
  try {
    const response = await api.get<UserNotificationsResponse>('/api/notificacao', {
      params: { page, limit: 10 },
    });
    
    // Verifica se a resposta tem a estrutura esperada
    if (!response.data || !Array.isArray(response.data.notifications)) {
      throw new Error('Formato de resposta inválido');
    }
    
    return response.data;
  } catch (error: any) {
    // Log mais detalhado do erro
    console.error('Erro completo ao buscar notificações:', {
      error,
      response: error.response,
      request: error.request,
      config: error.config
    });

    // Se houver uma resposta da API com mensagem de erro
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    // Se for um erro de rede
    if (error.request) {
      throw new Error('Erro de conexão com o servidor');
    }

    // Para outros tipos de erro
    throw new Error('Não foi possível carregar suas notificações. Por favor, tente novamente.');
  }
};

export const hideNotification = async (notificationId: string): Promise<Notification> => {
  try {
    const response = await api.patch<{ notification: Notification }>(`/api/notificacao/${notificationId}/ocultar`);
    return response.data.notification;
  } catch (error: any) {
    console.error('Erro ao ocultar notificação:', error);
    throw new Error(error.response?.data?.error || 'Não foi possível ocultar a notificação. Por favor, tente novamente.');
  }
};

export const getAdminUsers = async (page: number = 1): Promise<AdminUsersResponse> => {
  try {
    const response = await api.get<AdminUsersResponse>('/api/admin/usuarios', {
      params: { page }
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error(error.response?.data?.error || 'Não foi possível carregar a lista de usuários. Por favor, tente novamente.');
  }
}; 