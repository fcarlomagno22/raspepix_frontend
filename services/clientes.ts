import { api } from "./api";

export const clientesService = {
  atualizarStatus: async (userId: string, isActive: boolean) => {
    if (!userId) {
      throw new Error('ID do usuário não fornecido');
    }

    try {
      console.log('Enviando requisição para atualizar status:', {
        userId,
        isActive,
        url: `/api/admin/clientes/${userId}/status`
      });

      const response = await api.patch(`/api/admin/clientes/${userId}/status`, {
        is_active: isActive
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },
};