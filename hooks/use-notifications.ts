import { useState, useEffect, useRef } from 'react';
import { getUserNotifications } from '@/services/api';

export function useUnreadNotifications() {
  const [hasUnread, setHasUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        const response = await getUserNotifications(1);
        const hasUnreadNotifications = response.notifications.some(
          notification => !notification.read
        );
        setHasUnread(hasUnreadNotifications);
      } catch (err) {
        console.error('Erro ao verificar notificações não lidas:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
        setHasUnread(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []); // array vazio para executar apenas no mount

  return {
    hasUnread,
    isLoading,
    error
  };
} 