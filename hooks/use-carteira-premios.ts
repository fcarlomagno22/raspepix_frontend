import { useQuery } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/services/api';
import { API_CONFIG } from '@/config/api';
import { toast } from 'sonner';

interface CarteiraPremiosResponse {
  saldo_disponivel: number;
}

const fetchSaldoPremios = async (): Promise<CarteiraPremiosResponse> => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.CARTEIRA.SALDO_PREMIOS);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar saldo de prêmios:', error);
    const errorMessage = getErrorMessage(error);
    toast.error(`Não foi possível carregar o saldo de prêmios: ${errorMessage}`);
    throw error;
  }
};

// Formatador de moeda BRL
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function useCarteiraPremios() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['carteira-premios'],
    queryFn: fetchSaldoPremios,
    staleTime: 1000 * 60, // Considera os dados desatualizados após 1 minuto
    cacheTime: 1000 * 60 * 5, // Mantém os dados em cache por 5 minutos
  });

  return {
    saldo: data?.saldo_disponivel ?? 0,
    saldoFormatado: formatadorMoeda.format(data?.saldo_disponivel ?? 0),
    isLoading,
    error,
    refetch,
  };
}
