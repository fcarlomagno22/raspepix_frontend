import type { Notification } from "@/types/notification"
import { api } from "@/services/api"
import axios from 'axios';

interface ApiNotification {
  id: string
  title: string
  message: string
  target_type?: "all" | "selected" | "single"
  is_active?: boolean
  created_at: string
  date: string
  time: string
  status: string
  single_user_id?: string
  target_users?: string[]
}

interface ApiNotificationsResponse {
  notifications: ApiNotification[]
}

// Função para converter o formato da API para o formato do frontend
const convertApiNotification = (apiNotif: ApiNotification): Notification => {
  console.log('Valores importantes:', {
    is_active_type: typeof apiNotif.is_active,
    is_active_value: apiNotif.is_active,
    status: apiNotif.status
  });
  
  const notification = {
    id: apiNotif.id,
    title: apiNotif.title,
    message: apiNotif.message,
    target_type: apiNotif.target_type || "all",
    single_user_id: apiNotif.single_user_id,
    target_users: apiNotif.target_users,
    is_active: apiNotif.is_active,
    created_at: apiNotif.created_at,
    date: apiNotif.date || new Date().toLocaleDateString('pt-BR'),
    time: apiNotif.time ? apiNotif.time.split('.')[0] : new Date().toLocaleTimeString('pt-BR'),
    status: apiNotif.status
  };
  
  return notification;
}

export const getAllNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get('/api/admin/notificacao/list');
    const data = response.data;
    
    console.log('Dados brutos da API:', JSON.stringify(data, null, 2));
    
    if (!data || !Array.isArray(data.notifications)) {
      console.error('Formato de resposta inválido:', data);
      throw new Error('Formato de resposta inválido');
    }
    
    const convertedNotifications = data.notifications.map(apiNotif => {
      console.log('Notificação da API (raw):', JSON.stringify(apiNotif, null, 2));
      const converted = convertApiNotification(apiNotif);
      console.log('Notificação convertida (final):', JSON.stringify(converted, null, 2));
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

export const updateNotificationStatus = async (id: string, isActive: boolean): Promise<Notification> => {
  try {
    console.log('Enviando atualização de status:', { id, isActive });
    
    const response = await api.patch(`/api/admin/notificacao/${id}/status`, {
      is_active: isActive
    });
    
    console.log('Resposta completa da API:', response.data);
    
    const notificationData = response.data.notification || response.data;
    console.log('Dados da notificação retornados:', notificationData);
    
    const notification: Notification = {
      id: notificationData.id,
      title: notificationData.title,
      message: notificationData.message,
      target_type: notificationData.target_type || "all",
      single_user_id: notificationData.single_user_id,
      target_users: notificationData.target_users,
      is_active: isActive,
      created_at: notificationData.created_at,
      date: notificationData.date,
      time: notificationData.time,
      status: notificationData.status
    };
    
    console.log('Notificação convertida:', notification);
    return notification;
  } catch (error) {
    console.error('Erro ao atualizar status da notificação:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Falha ao atualizar status da notificação');
    }
    throw new Error('Falha ao atualizar status da notificação');
  }
}

export const createNotification = async (
  data: Omit<Notification, "id" | "created_at" | "date" | "time" | "status">
): Promise<Notification> => {
  try {
    const now = new Date();
    const apiData = {
      ...data,
      data: now.toISOString().split('T')[0],
      hora: now.toTimeString().split(' ')[0],
      status: 'active'
    };

    const response = await api.post('/api/admin/notificacao', apiData);
    return convertApiNotification(response.data);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Falha ao criar notificação');
    }
    throw new Error('Falha ao criar notificação');
  }
}

export const updateNotification = async (
  id: string, 
  data: Omit<Notification, "id" | "created_at" | "date" | "time" | "status">
): Promise<Notification> => {
  try {
    const response = await api.put(`/api/admin/notificacao/${id}`, data);
    return convertApiNotification(response.data);
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Falha ao atualizar notificação');
    }
    throw new Error('Falha ao atualizar notificação');
  }
}

export const deleteNotification = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/admin/notificacao/${id}`);
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Falha ao deletar notificação');
    }
    throw new Error('Falha ao deletar notificação');
  }
}

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
