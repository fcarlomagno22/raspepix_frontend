import { MusicaResponse } from '@/types/musica';
import { musicData } from '@/lib/music-data';

export const getMusicas = async (page: number = 1): Promise<MusicaResponse> => {
  try {
    // Converte os dados mockados para o formato esperado
    const musicas = musicData.map(track => ({
      id: track.id,
      titulo: track.title,
      url_arquivo: track.url
    }));

    return {
      data: musicas,
      total: musicas.length,
      page: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Erro ao buscar músicas:', error);
    throw new Error('Não foi possível carregar as músicas');
  }
}; 