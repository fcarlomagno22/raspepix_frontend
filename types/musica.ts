export interface Musica {
  id: string;
  titulo: string;
  url_arquivo: string;
}

export interface MusicaResponse {
  data: Musica[];
  total: number;
  page: number;
  totalPages: number;
} 