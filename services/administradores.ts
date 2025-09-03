import { api } from "./api";

export interface NovoAdministrador {
  nome_completo: string;
  cpf: string;
  email: string;
  senha: string;
  funcao: string;
  permissoes_pagina: string[];
}

export interface AdministradorResponse {
  message: string;
  data: {
    id: string;
    nome_completo: string;
    cpf: string;
    email: string;
    funcao: string;
    permissoes_pagina: string[];
    is_active: boolean;
    created_at: string;
  };
}

export const administradoresService = {
  cadastrar: async (adminData: NovoAdministrador): Promise<AdministradorResponse> => {
    try {
      console.log('Tentando cadastrar administrador:', adminData);
      console.log('URL da API:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/administradores`);
      
      const response = await api.post<AdministradorResponse>('/api/admin/administradores', adminData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao cadastrar administrador:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw new Error(error.response?.data?.error || 'Não foi possível cadastrar o administrador. Por favor, tente novamente.');
    }
  },
};
