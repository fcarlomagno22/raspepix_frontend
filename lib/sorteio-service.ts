import { api } from '@/services/api';

export async function sortearNumero() {
  try {
    const response = await api.post('/api/sorteio/instantaneo');
    return response.data;
  } catch (error) {
    throw new Error('Não foi possível realizar o sorteio');
  }
} 

export async function realizarSorteioInstantaneo() {
  try {
    const response = await api.post('/api/sorteio/instantaneo');
    console.log('Resposta da API de sorteio:', response.data);
    
    // Verifica se a resposta tem a estrutura esperada
    if (!response.data || typeof response.data.valor_premio === 'undefined') {
      console.warn('Formato de resposta inválido da API de sorteio:', response.data);
      return {
        sucesso: false,
        valor_premio: 0,
        numero_sorteado: null
      };
    }
    
    console.log('🔍 DEBUG API - Campos da resposta:', {
      sucesso: response.data.sucesso,
      valor_premio: response.data.valor_premio,
      numero_sorteado: response.data.numero_sorteado,
      tipo_sucesso: typeof response.data.sucesso
    });
    
    return {
      sucesso: response.data.sucesso,
      valor_premio: response.data.valor_premio,
      numero_sorteado: response.data.numero_sorteado
    };
  } catch (error) {
    console.error('Erro ao realizar sorteio instantâneo:', error);
    return {
      sucesso: false,
      valor_premio: 0,
      numero_sorteado: null
    };
  }
}

export async function obterChancesInstantaneasNaoUtilizadas() {
  try {
    const response = await api.get('/api/sorteio/instantaneos/nao-utilizados');
    console.log('Resposta da API de chances:', response.data);
    
    // Validação adicional
    if (!response.data || typeof response.data.quantidade !== 'number') {
      console.warn('Formato de resposta inválido da API de chances:', response.data);
      return 0;
    }
    
    return response.data.quantidade;
  } catch (error) {
    console.error('Erro ao obter chances instantâneas:', error);
    return 0;
  }
} 