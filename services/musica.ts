import { api } from "./api";
import { MusicaResponse } from "@/types/musica";

interface GetMusicasParams {
  page?: number;
  titulo?: string;
}

export const getMusicasPublicas = async ({ page = 1, titulo = "" }: GetMusicasParams): Promise<MusicaResponse> => {
  const response = await api.get<MusicaResponse>("/api/musicas", {
    params: { page, titulo }
  });
  return response.data;
}; 