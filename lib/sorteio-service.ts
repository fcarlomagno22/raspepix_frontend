import Cookies from 'js-cookie';

interface SorteioResponse {
  sucesso: boolean;
  mensagem: string;
  numero_sorteado: string;
  edicao: {
    nome: string;
    data_inicio: string;
    data_fim: string;
  };
  valor_premio?: number;
}

export async function realizarSorteioInstantaneo(): Promise<SorteioResponse> {
  const token = Cookies.get('access_token');
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const response = await fetch('http://localhost:3000/api/sorteio/instantaneo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Erro ao realizar sorteio');
  }

  const data = await response.json();
  return data;
} 