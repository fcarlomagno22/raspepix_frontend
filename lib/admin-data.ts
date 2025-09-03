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
    cpf: "226.522.048-58",
    email: "contato@raspepix.com.br",
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
  ]

export const availablePages: { value: PagePermission; label: string }[] = [
  { value: "*", label: "Acesso Total (Todas as páginas)" },
  { value: "dashboard", label: "Dashboard" },
  { value: "integracao", label: "Integração" },
  { value: "portaldosorteado", label: "Portal do Sorteado" },
  { value: "clientes", label: "Clientes" },
  { value: "afiliados", label: "Afiliados" },
  { value: "influencers", label: "Influencers" },
  { value: "sorteio", label: "Sorteio" },
  { value: "financeiro", label: "Financeiro" },
  { value: "raspadinhas", label: "Raspadinhas" },
  { value: "hq", label: "HQ" },
  { value: "playlist", label: "Playlist" },
  { value: "marketing", label: "Marketing" },
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
