import type { InstitutionalSettings, AdminUser, PagePermission } from "@/types/admin"

// Mock Institutional Settings
let mockInstitutionalSettings: InstitutionalSettings = {
  companyName: "RaspePix Entretenimento",
  supportEmail: "suporte@raspepix.com.br",
  instagramUrl: "https://instagram.com/raspepixoficial",
  tiktokUrl: "https://tiktok.com/@raspepix",
  facebookUrl: "https://facebook.com/raspepix",
}

// Mock Admin Users
let mockAdminUsers: AdminUser[] = [
  {
    id: "admin-1",
    name: "Fernando Carlomagno",
    cpf: "123.456.789-00",
    email: "fernando.carlomagno@raspepix.com.br",
    role: "Administrador",
    isActive: true,
    permissions: [
      "dashboard",
      "integracao",
      "portaldosorteado",
      "usuarios",
      "sorteio",
      "financeiro",
      "raspadinhas",
      "hq",
      "logs_auditoria",
      "notificacoes",
      "suporte",
      "configuracoes",
    ],
  },
  {
    id: "admin-2",
    name: "Ana Paula Silva",
    cpf: "987.654.321-00",
    email: "ana.silva@raspepix.com.br",
    role: "Gestão",
    isActive: true,
    permissions: ["dashboard", "usuarios", "sorteio", "hq", "logs_auditoria"],
  },
  {
    id: "admin-3",
    name: "Carlos Eduardo Santos",
    cpf: "111.222.333-44",
    email: "carlos.santos@raspepix.com.br",
    role: "Suporte",
    isActive: false,
    permissions: ["usuarios", "suporte", "logs_auditoria"],
  },
  {
    id: "admin-4",
    name: "Mariana Costa",
    cpf: "555.666.777-88",
    email: "mariana.costa@raspepix.com.br",
    role: "Financeiro",
    isActive: true,
    permissions: ["dashboard", "financeiro", "hq"],
  },
]

export const availablePages: { value: PagePermission; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "integracao", label: "Integração" },
  { value: "portaldosorteado", label: "Portal do Sorteado" },
  { value: "usuarios", label: "Usuários" },
  { value: "sorteio", label: "Sorteio" },
  { value: "financeiro", label: "Financeiro" },
  { value: "raspadinhas", label: "Raspadinhas" },
  { value: "hq", label: "HQ" },
  { value: "logs_auditoria", label: "Logs de Auditoria" },
  { value: "notificacoes", label: "Notificações" },
  { value: "suporte", label: "Suporte" },
  { value: "configuracoes", label: "Configurações" },
]

// --- Institutional Settings Functions ---
export const getAdminSettings = async (): Promise<InstitutionalSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockInstitutionalSettings)
    }, 500)
  })
}

export const updateAdminSettings = async (settings: InstitutionalSettings): Promise<InstitutionalSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockInstitutionalSettings = { ...settings }
      resolve(mockInstitutionalSettings)
    }, 1000)
  })
}

// --- Admin User Management Functions ---
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockAdminUsers])
    }, 500)
  })
}

export const createAdminUser = async (newAdmin: Omit<AdminUser, "id" | "isActive">): Promise<AdminUser> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const admin: AdminUser = {
        id: `admin-${mockAdminUsers.length + 1}`,
        isActive: true,
        ...newAdmin,
      }
      mockAdminUsers.push(admin)
      resolve(admin)
    }, 1000)
  })
}

export const updateAdminUser = async (updatedAdmin: AdminUser): Promise<AdminUser> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockAdminUsers.findIndex((a) => a.id === updatedAdmin.id)
      if (index !== -1) {
        mockAdminUsers[index] = { ...updatedAdmin }
        resolve(mockAdminUsers[index])
      } else {
        reject(new Error("Admin not found"))
      }
    }, 1000)
  })
}

export const deleteAdminUser = async (adminId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = mockAdminUsers.length
      mockAdminUsers = mockAdminUsers.filter((a) => a.id !== adminId)
      if (mockAdminUsers.length < initialLength) {
        resolve()
      } else {
        reject(new Error("Admin not found"))
      }
    }, 1000)
  })
}

export const toggleAdminStatus = async (adminId: string, isActive: boolean): Promise<AdminUser> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const admin = mockAdminUsers.find((a) => a.id === adminId)
      if (admin) {
        admin.isActive = isActive
        resolve(admin)
      } else {
        reject(new Error("Admin not found"))
      }
    }, 500)
  })
}

export const updateAdminPermissions = async (adminId: string, permissions: PagePermission[]): Promise<AdminUser> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const admin = mockAdminUsers.find((a) => a.id === adminId)
      if (admin) {
        admin.permissions = permissions
        resolve(admin)
      } else {
        reject(new Error("Admin not found"))
      }
    }, 1000)
  })
}
