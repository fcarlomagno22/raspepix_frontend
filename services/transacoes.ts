import { api } from "./api"
import Cookies from 'js-cookie'

export interface Transacao {
  id: string
  profile_id: string
  edicao_id: string | null
  tipo: "deposito" | "saque"
  valor: number
  data: string
  status: "pago" | "pendente"
  profiles?: {
    cpf: string
    full_name: string
  }
}

type TransactionResponse = Transacao[]

export async function getClientTransactions(clientId: string) {
  try {
    // Log para debug
    console.log('[TransacoesService] Iniciando busca de transações para cliente:', clientId);
    console.log('[TransacoesService] Admin token:', Cookies.get('admin_token'));

    const response = await api.get<TransactionResponse>(`/api/transacoes/admin/cliente/${clientId}`, {
      // Força o cabeçalho de autorização novamente para garantir
      headers: {
        'Authorization': `Bearer ${Cookies.get('admin_token')}`
      }
    })
    return response.data
  } catch (error: any) {
    console.error('Erro ao buscar transações:', {
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
      throw new Error('Erro de conexão com o servidor. Verifique sua internet.');
    }

    // Para outros tipos de erro
    throw new Error('Não foi possível carregar as transações. Por favor, tente novamente.');
  }
}

export async function getTransacoes(): Promise<Transacao[]> {
  try {
    const response = await api.get<Transacao[]>('/api/transacoes')
    // Ordena as transações por data (mais recentes primeiro)
    return response.data.sort((a, b) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime()
    })
  } catch (error: any) {
    console.error('Erro ao buscar transações:', error)
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error('Não foi possível carregar as transações. Por favor, tente novamente.')
  }
}