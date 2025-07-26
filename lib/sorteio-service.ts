import { api } from '@/services/api';

export async function sortearNumero() {
  try {
    const response = await api.post('/api/sorteio/instantaneo');
    return response.data;
  } catch (error) {
    console.error('Erro ao sortear número:', error);
    throw new Error('Não foi possível realizar o sorteio');
  }
} 