import { api } from "./api"
import type { EdicaoSorteio, BilheteInstantaneo, RespostaSorteio } from "@/types/notification"
import axios from "axios";

// Interface original para manter compatibilidade
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
  configuracoes_premios: {
    valor_maximo: number;
    valor_minimo: number;
    total_titulos: number;
    quantidade_premios: number;
  };
}

interface SorteioError extends Error {
  type?: 'warning' | 'error';
}

// Restaurando o serviço original para manter compatibilidade
export const sorteioService = {
  async listarEdicoes(): Promise<SorteioEdicao[]> {
    const response = await api.get('/api/sorteio/edicoes');
    return response.data;
  },

  async excluirEdicao(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/api/sorteio/edicoes/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const customError = new Error('Não é possível deletar sorteios em andamento com números vendidos.') as SorteioError;
        customError.type = 'warning';
        throw customError;
      }
      throw new Error('Erro ao excluir sorteio. Por favor, tente novamente.');
    }
  }
};

// Novas funções mantidas
const validarBilhete = (bilhete: BilheteInstantaneo, totalTitulos: number) => {
  // Validar se número está dentro do range
  const numero = parseInt(bilhete.numero_titulo);
  if (numero < 1 || numero > totalTitulos) {
    throw new Error(`Número ${bilhete.numero_titulo} fora do range válido (1 a ${totalTitulos})`);
  }

  // Validar se bilhete premiado tem valor
  if (bilhete.premiado && !bilhete.valor_premio) {
    throw new Error(`Bilhete premiado ${bilhete.numero_titulo} deve ter um valor de prêmio`);
  }

  // Validar formato do número (zeros à esquerda)
  const numeroDigitos = totalTitulos.toString().length;
  if (bilhete.numero_titulo.length !== numeroDigitos) {
    throw new Error(`Número ${bilhete.numero_titulo} deve ter ${numeroDigitos} dígitos`);
  }
};

export const criarEdicao = async (edicao: EdicaoSorteio): Promise<EdicaoSorteio> => {
  try {
    // Validar todos os bilhetes antes de enviar
    edicao.bilhetesInstantaneos.forEach(bilhete => {
      validarBilhete(bilhete, edicao.configPremiosInstantaneos.total_titulos);
    });

    const response = await api.post('/api/sorteio/edicoes', edicao);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar edição:', error);
    throw new Error('Não foi possível criar a edição do sorteio. Por favor, verifique os dados e tente novamente.');
  }
}

export const listarBilhetes = async (edicaoId: string): Promise<BilheteInstantaneo[]> => {
  try {
    const response = await api.get(`/api/sorteio/bilhetes?edicao=${edicaoId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar bilhetes:', error);
    throw new Error('Não foi possível carregar os bilhetes. Por favor, tente novamente.');
  }
}

export const sortearBilhete = async (): Promise<RespostaSorteio> => {
  try {
    const response = await api.post('/api/sorteio/instantaneo/sortear');
    return response.data;
  } catch (error) {
    console.error('Erro ao sortear bilhete:', error);
    throw new Error('Não foi possível realizar o sorteio. Por favor, tente novamente.');
  }
}

export const usarBilhete = async (numeroTitulo: string): Promise<BilheteInstantaneo> => {
  try {
    const response = await api.post(`/api/sorteio/bilhetes/${numeroTitulo}/usar`);
    return response.data;
  } catch (error) {
    console.error('Erro ao usar bilhete:', error);
    throw new Error('Não foi possível utilizar o bilhete. Por favor, tente novamente.');
  }
} 