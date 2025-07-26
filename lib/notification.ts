import type { Notification } from "@/types/notification"
import { api } from "@/services/api"
import axios from 'axios';

interface ApiNotification {
  id: string
  title: string
  message: string
  target_type: "all" | "selected" | "single"
  is_active: boolean | undefined
  criado_em: string
}

interface ApiNotificationsResponse {
  notifications: ApiNotification[]
}

// Função para converter o formato da API para o formato do frontend
const convertApiNotification = (apiNotif: ApiNotification): Notification => {
  return {
    id: apiNotif.id,
    title: apiNotif.title,
    message: apiNotif.message,
    target_type: apiNotif.target_type || "all",
    is_active: true, // Por padrão, todas as notificações são ativas
    created_at: apiNotif.criado_em || new Date().toISOString(), // Usa a data de criação do Supabase
  }
}

export const getAllNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get('/api/notificacao/admin');
    const data = response.data;
    
    console.log('Dados brutos da API:', data);
    
    if (!data || !Array.isArray(data.notifications)) {
      console.error('Formato de resposta inválido:', data);
      throw new Error('Formato de resposta inválido');
    }
    
    const convertedNotifications = data.notifications.map(apiNotif => {
      console.log('Notificação da API:', apiNotif);
      const converted = convertApiNotification(apiNotif);
      console.log('Notificação convertida:', converted);
      return converted;
    });

    return convertedNotifications;
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Sessão de administrador expirada. Por favor, faça login novamente.');
      }
      if (error.response?.status === 403) {
        throw new Error('Não autorizado. Apenas administradores podem acessar esta função.');
      }
      if (error.response?.status === 404) {
        throw new Error('Recurso não encontrado. Verifique a URL da API.');
      }
      throw new Error(error.response?.data?.error || 'Falha ao carregar notificações. Por favor, tente novamente.');
    }
    
    throw new Error('Falha ao carregar notificações. Por favor, tente novamente.');
  }
}

// Função mock temporária para criar notificação
export const createNotification = async (
  data: Omit<Notification, "id" | "created_at">
): Promise<Notification> => {
  // TODO: Implementar integração com a API
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    ...data,
    id: `notif${Date.now()}`,
    created_at: new Date().toISOString()
  };
}

// Função mock temporária para buscar notificação por ID
export const getNotificationById = async (id: string): Promise<Notification | undefined> => {
  const notifications = await getAllNotifications();
  return notifications.find((notif) => notif.id === id);
}

// Função mock temporária para atualizar notificação
export const updateNotification = async (notification: Notification): Promise<Notification> => {
  // TODO: Implementar integração com a API
  await new Promise((resolve) => setTimeout(resolve, 500));
  return notification;
}

// Função mock temporária para deletar notificação
export const deleteNotification = async (id: string): Promise<void> => {
  // TODO: Implementar integração com a API
  await new Promise((resolve) => setTimeout(resolve, 300));
}

// Função helper para exibir destinatários
export const getTargetUserNames = (notification: Notification): { text: string; color: string; } => {
  if (notification.target_type === "all") {
    return {
      text: "Todos os usuários",
      color: "#9FFF00" // Verde
    }
  } else if (notification.target_type === "single" && notification.single_user_id) {
    return {
      text: "Usuário único",
      color: "#FF9F00" // Laranja
    }
  } else if (
    notification.target_type === "selected" &&
    notification.target_users &&
    notification.target_users.length > 0
  ) {
    return {
      text: `Usuários selecionados (${notification.target_users.length})`,
      color: "#00A3FF" // Azul
    }
  }
  return {
    text: "Desconhecido",
    color: "#FF0000" // Vermelho para erro
  }
}

export const validateNotification = (notification: Partial<Notification>): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!notification.title?.trim()) {
    errors.title = "O título é obrigatório"
  }

  if (!notification.message?.trim()) {
    errors.message = "A mensagem é obrigatória"
  }

  if (notification.target_type === "single" && !notification.single_user_id) {
    errors.single_user_id = "Selecione um usuário"
  }

  if (notification.target_type === "selected" && (!notification.target_users || notification.target_users.length === 0)) {
    errors.target_users = "Selecione pelo menos um usuário"
  }

  return errors
}
