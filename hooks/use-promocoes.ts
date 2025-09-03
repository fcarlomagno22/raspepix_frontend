import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import Cookies from 'js-cookie';

interface Promocao {
  id: string;
  titulo: string;
  descricao: string;
  premio_descricao: string;
  meta_vendas: number;
  inicio_em: string;
  fim_em: string;
  is_ativa: boolean;
  progresso_vendas?: number;
}

interface PromocaoResponse {
  success: boolean;
  data: Promocao[];
}

interface ProgressoResponse {
  success: boolean;
  data: {
    progresso_vendas: number;
  };
}

export function usePromocoes() {
  const { data: promocoesData, isLoading: isLoadingPromocoes, error: errorPromocoes } = useQuery<PromocaoResponse>({
    queryKey: ["promocoes"],
    queryFn: async () => {
      try {
        const response = await api.get("/api/promocoes");
        return response.data;
      } catch (err) {
        console.error('Erro ao buscar promoções:', err);
        throw new Error('Não foi possível carregar as promoções. Por favor, tente novamente mais tarde.');
      }
    },
    retry: 1,
    retryDelay: 1000
  });

  const { data: progressoData, isLoading: isLoadingProgresso } = useQuery<ProgressoResponse>({
    queryKey: ["progresso-promocao", promocoesData?.data.find(p => p.is_ativa)?.id],
    queryFn: async () => {
      const promocaoAtiva = promocoesData?.data.find(p => p.is_ativa);
      if (!promocaoAtiva) return { success: true, data: { progresso_vendas: 0 } };

      const response = await api.get(`/api/promocoes/${promocaoAtiva.id}/meu-progresso`);

      return response.data;
    },
    enabled: !!promocoesData?.data.find(p => p.is_ativa),
  });

  const promocoes = promocoesData?.data.map(promocao => {
    if (promocao.is_ativa) {
      return {
        ...promocao,
        progresso_vendas: progressoData?.data.progresso_vendas || 0
      };
    }
    return promocao;
  }) || [];

  return {
    promocoes,
    isLoading: isLoadingPromocoes || isLoadingProgresso,
    error: errorPromocoes,
  };
}
