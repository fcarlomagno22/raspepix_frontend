export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH_TOKEN: '/api/auth/refresh',
      REGISTER: '/api/auth/register',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      ADMIN_LOGIN: '/api/admin/login',
      ADMIN_LOGOUT: '/api/admin/logout',
    },
    USER: {
      PROFILE: '/api/profile/me',
      NOTIFICATIONS: '/api/user/notifications',
      TRANSACTIONS: '/api/user/transactions',
    },
    ADMIN: {
      DASHBOARD: '/api/admin/dashboard',
      USERS: '/api/admin/users',
      SETTINGS: '/api/admin/settings',
    },
    CARTEIRA: {
      SALDO_PREMIOS: '/api/carteira/premios/saldo',
    },
  },
}; 