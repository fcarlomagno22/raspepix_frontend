export const adminAuth = {
  async login(email: string, password: string) {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Falha na autenticação');
    }
    
    const data = await response.json();
    
    // Armazenar o token no cookie (mais seguro que localStorage)
    document.cookie = `admin_token=${data.token}; path=/; secure; samesite=strict`;
    
    return data;
  },

  async logout() {
    // Remover o token do cookie
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Chamar endpoint de logout se necessário
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
}; 