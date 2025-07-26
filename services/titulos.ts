import { api } from "./api";

export interface Titulo {
  id: string;
  numero: string;
  tipo: "raspadinha" | "sorteio";
  dataCompra: string;
  dataUtilizacao?: string;
  dataSorteio?: string;
  ativo: boolean;
  contemplado: boolean;
  valorPremio: string | null;
  edicaoId: string;
  edicaoNome: string;
  utilizado: boolean;
}

export interface TitulosResponse {
  data: Titulo[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    perPage: number;
  };
}

interface GetTitulosParams {
  edicao_id?: string;
  tipo?: "raspadinha" | "sorteio";
  page?: number;
  per_page?: number;
}

export const getTitulos = async ({
  edicao_id,
  tipo,
  page = 1,
  per_page = 25,
}: GetTitulosParams): Promise<TitulosResponse> => {
  const params = new URLSearchParams();
  
  if (edicao_id) params.append("edicao_id", edicao_id);
  if (tipo) params.append("tipo", tipo);
  if (page) params.append("page", page.toString());
  if (per_page) params.append("per_page", per_page.toString());

  const response = await api.get<TitulosResponse>(`/api/titulos?${params.toString()}`);
  return response.data;
}; 