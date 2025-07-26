export interface Musica {
  titulo: string;
  artista: string;
  criada_em: string;
}

export interface MusicaResponse {
  data: Musica[];
  total: number;
  page: number;
  totalPages: number;
} 