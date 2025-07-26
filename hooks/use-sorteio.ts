import { useState } from 'react';
import { sortearBilhete, usarBilhete } from '@/services/sorteio';
import type { RespostaSorteio, BilheteInstantaneo } from '@/types/notification';

interface UseSorteioResult {
  resultado: RespostaSorteio | null;
  bilheteUtilizado: BilheteInstantaneo | null;
  loading: boolean;
  error: string | null;
  sortear: () => Promise<void>;
  usarBilhetePremiado: (numeroTitulo: string) => Promise<void>;
  resetar: () => void;
}

export const useSorteio = (): UseSorteioResult => {
  const [resultado, setResultado] = useState<RespostaSorteio | null>(null);
  const [bilheteUtilizado, setBilheteUtilizado] = useState<BilheteInstantaneo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetar = () => {
    setResultado(null);
    setBilheteUtilizado(null);
    setError(null);
  };

  const sortear = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sortearBilhete();
      setResultado(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar sorteio');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const usarBilhetePremiado = async (numeroTitulo: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usarBilhete(numeroTitulo);
      setBilheteUtilizado(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao utilizar bilhete');
      setBilheteUtilizado(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    resultado,
    bilheteUtilizado,
    loading,
    error,
    sortear,
    usarBilhetePremiado,
    resetar
  };
}; 