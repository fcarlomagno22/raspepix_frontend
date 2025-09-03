import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

interface RegulamentoResponse {
  success: boolean;
  data: {
    regras: string;
  };
}

export function useRegulamento() {
  const { data, isLoading, error } = useQuery<RegulamentoResponse>({
    queryKey: ["regulamento"],
    queryFn: async () => {
      try {
        const response = await api.get("/api/promocoes/regulamento");
        return response.data;
      } catch (err) {
        console.error('Erro ao buscar regulamento:', err);
        throw new Error('Não foi possível carregar o regulamento. Por favor, tente novamente mais tarde.');
      }
    },
  });

  return {
    regulamento: data?.data.regras,
    isLoading,
    error,
  };
}
