import { useState, useEffect } from 'react';
import { getUserNotifications } from '@/services/api';

export function useUnreadNotifications() {
  const [hasUnread, setHasUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUnreadNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await getUserNotifications(1); // Pegamos apenas a primeira página
        const hasUnreadNotifications = response.notifications.some(notification => !notification.read);
        setHasUnread(hasUnreadNotifications);
      } catch (error) {
        console.error('Erro ao verificar notificações não lidas:', error);
        setHasUnread(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUnreadNotifications();

    // Verificar a cada 5 minutos
    const interval = setInterval(checkUnreadNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    hasUnread,
    isLoading
  };
} 