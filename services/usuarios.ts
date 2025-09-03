import { getAdminUsers } from './api';

export interface Usuario {
  id: string;           // ID do Supabase
  full_name: string;
  idade: number;
  cpf: string;
  phone: string;
  email: string;
  gender: string;
  birth_date: string;
  state_uf: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
}

interface ListUsuariosResponse {
  message: string;
  data: Usuario[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const usuariosService = {
  listar: async (): Promise<ListUsuariosResponse> => {
    return await getAdminUsers();
  },
};