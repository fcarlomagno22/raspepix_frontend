import { api } from './api';

export interface SorteioEdicao {
  id: string;
  nome: string;
  valor_sorteio: number;
  valor_premios_instantaneos: number;
  data_inicio: string;
  data_fim: string;
  status: string;
  criado_em: string;
  atualizado_em: string;
  configuracoes_premios: any;
}

export interface Bilhete {
  id: string;
  numero: string;
  status: string;
  data_compra: string;
}

export interface TituloEdicao {
  numero: string;
  status: string;
  comprador_nome: string;
  comprador_cpf: string;
  status_pagamento: string;
  tipo_premio: string;
  valor_premio: number;
}

export interface ListagemTitulosResponse {
  titulos: TituloEdicao[];
  total: number;
  total_premiados: number;
  total_vendidos: number;
}

export interface ListagemTitulosParams {
  page: number;
  per_page: number;
  search?: string;
  status?: string;
}

export interface NumeroCapitalizadora {
  id: string;
  uuid: string;
  numero: string;
  premiado: boolean;
  descricao_premio: string;
  utilizado: boolean;
  criado_em: string;
  atualizado_em: string;
  comprador_id: string | null;
  comprado_em: string | null;
  status_pagamento: string | null;
  edicao_sorteio_id: string;
  comprador_nome: string | null;
  comprador_cpf: string | null;
}

export interface ListagemNumerosResponse {
  data: NumeroCapitalizadora[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const getEdicoes = async (): Promise<SorteioEdicao[]> => {
  try {
    const response = await api.get('/api/sorteio/edicoes');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar edições:', error);
    throw new Error('Não foi possível carregar as edições do sorteio');
  }
};

export const getBilhetes = async (edicaoId: string): Promise<Bilhete[]> => {
  try {
    const response = await api.get(`/api/sorteio/bilhetes?edicao=${edicaoId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar bilhetes:', error);
    throw new Error('Não foi possível carregar os bilhetes');
  }
};

export const sortearInstantaneo = async () => {
  try {
    const response = await api.post('/api/sorteio/instantaneo');
    return response.data;
  } catch (error) {
    console.error('Erro ao realizar sorteio:', error);
    throw new Error('Não foi possível realizar o sorteio');
  }
};

export const usarBilhete = async (numeroTitulo: string) => {
  try {
    const response = await api.post(`/api/sorteio/bilhetes/${numeroTitulo}/usar`);
    return response.data;
  } catch (error) {
    console.error('Erro ao usar bilhete:', error);
    throw new Error('Não foi possível usar o bilhete');
  }
};

export const atualizarStatusEdicao = async (id: string, status: string): Promise<{ status: string }> => {
  try {
    const response = await api.patch(`/api/sorteio/admin/edicoes/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar status da edição:', error);
    throw new Error('Não foi possível atualizar o status da edição');
  }
};

export const excluirEdicao = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/sorteio/admin/edicoes/${id}`);
  } catch (error: any) {
    console.error('Erro ao excluir edição:', error);
    
    // Tratamento específico para erro de autenticação
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    // Erro 404 - Edição não encontrada
    if (error.response?.status === 404) {
      throw new Error('Edição não encontrada');
    }

    throw new Error('Não foi possível excluir a edição');
  }
};

export const listarTitulosEdicao = async (
  edicaoId: string,
  params: ListagemTitulosParams
): Promise<ListagemTitulosResponse> => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.per_page.toString(),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status })
    });

    const response = await api.get(`/api/sorteio/edicoes/${edicaoId}/titulos?${queryParams}`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao listar títulos da edição:', error);
    
    // Tratamento específico para erro de autenticação
    if (error.response?.status === 401) {
      // Remove o token e redireciona para login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    // Erro 404 - Edição não encontrada
    if (error.response?.status === 404) {
      throw new Error('Edição não encontrada');
    }

    // Outros erros
    throw new Error('Não foi possível carregar os títulos da edição');
  }
}; 

export const listarNumerosCapitalizadora = async (
  edicaoId: string,
  page: number = 1,
  per_page: number = 25,
  search?: string,
  status_pagamento?: string
): Promise<ListagemNumerosResponse> => {
  try {
    const params = new URLSearchParams();
    
    // Parâmetros obrigatórios
    params.append('edicao_id', edicaoId);
    params.append('page', page.toString());
    params.append('per_page', per_page.toString());
    
    // Parâmetros opcionais
    if (search && search.trim() !== '') {
      params.append('search', search.trim());
    }
    
    if (status_pagamento && status_pagamento !== 'todos') {
      params.append('status_pagamento', status_pagamento.toUpperCase());
    }

    console.log('URL da requisição:', `/api/sorteio/numeros-capitalizadora?${params.toString()}`);
    const response = await api.get(`/api/sorteio/numeros-capitalizadora?${params.toString()}`);
    console.log('Resposta da API:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao listar números da capitalizadora:', error);
    
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    throw new Error('Não foi possível carregar os números da capitalizadora');
  }
}; 

export async function buscarTotalTitulosPagos(sorteioId: string): Promise<number> {
  try {
    const response = await api.get(`/api/admin/sorteios/${sorteioId}/titulos-pagos/total`);

    return response.data.total;
  } catch (error) {
    console.error('Erro ao buscar total de títulos pagos:', error);
    throw new Error('Erro ao buscar total de títulos pagos');
  }
} 

export async function buscarTotalTitulosPendentes(edicaoId: string): Promise<number> {
  const response = await api.get(`/api/admin/sorteios/${edicaoId}/titulos-pendentes/total`);
  return response.data.total;
} 

export async function atualizarStatusPagamentoTitulo(tituloId: string, novoStatus: 'PAGO' | 'PENDENTE') {
  try {
    const response = await api.patch(`/api/sorteio/titulos/${tituloId}/pagamento`, {
      status_pagamento: novoStatus.toLowerCase()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
} 