import { api } from "./api";
import Cookies from 'js-cookie';

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

interface LoginResponse {
  user: User;
  message: string;
  token: string;
}

interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    nome_completo: string;
    email: string;
    funcao: string;
    esta_ativo: boolean;
    permissoes_pagina: string[];
  };
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/api/auth/login', data);
    
    // Armazena o token
    if (response.data.token) {
      Cookies.set('access_token', response.data.token, {
        path: '/',
        sameSite: 'lax'
      });
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Erro ao fazer login:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Não foi possível fazer login. Por favor, tente novamente.');
  }
};

export const adminAuth = {
  login: async (data: LoginData): Promise<AdminLoginResponse> => {
    const response = await api.post<AdminLoginResponse>('/api/admin/login', {
      email: data.email,
      senha: data.password
    });
    
    if (response.data.token) {
      Cookies.set('admin_token', response.data.token, {
        path: '/',
        sameSite: 'lax'
      });
    }
    
    // Salvar dados do administrador no cookie para permissões
    if (response.data.admin) {
      Cookies.set('admin_data', JSON.stringify({
        permissoes_pagina: response.data.admin.permissoes_pagina,
        funcao: response.data.admin.funcao
      }), {
        path: '/',
        sameSite: 'lax'
      });
    }
    
    return response.data;
  },
  
  logout: async () => {
    try {
      await api.post('/api/admin/logout');
    } finally {
      Cookies.remove('admin_token', { path: '/' });
      Cookies.remove('admin_data', { path: '/' });
      window.location.href = '/admin/login';
    }
  },

  getToken: () => {
    const adminToken = Cookies.get('admin_token');
    const supabaseToken = Cookies.get('sb-kvwnpmdhyhrmfpgnojbh-auth-token');
    
    console.log('Tokens disponíveis:', {
      adminToken: !!adminToken,
      supabaseToken: !!supabaseToken
    });

    return adminToken || (supabaseToken ? JSON.parse(supabaseToken).access_token : null);
  }
}; 