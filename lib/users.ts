import { getUsers } from "@/services/api"
import type { User } from "@/types/notification"

// Mock data for users
export const users: User[] = [
  { id: "user123", name: "João Silva", email: "joao.silva@example.com", cpf: "111.222.333-44" },
  { id: "user456", name: "Maria Oliveira", email: "maria.o@example.com", cpf: "555.666.777-88" },
  { id: "user789", name: "Pedro Souza", email: "pedro.s@example.com", cpf: "999.000.111-22" },
  { id: "user101", name: "Ana Costa", email: "ana.c@example.com", cpf: "123.456.789-00" },
  { id: "user102", name: "Carlos Pereira", email: "carlos.p@example.com", cpf: "098.765.432-11" },
  { id: "user103", name: "Beatriz Lima", email: "beatriz.l@example.com", cpf: "234.567.890-12" },
  { id: "user104", name: "Fernando Rocha", email: "fernando.r@example.com", cpf: "345.678.901-23" },
  { id: "user105", name: "Gabriela Santos", email: "gabriela.s@example.com", cpf: "456.789.012-34" },
  { id: "user106", name: "Hugo Almeida", email: "hugo.a@example.com", cpf: "567.890.123-45" },
  { id: "user107", name: "Isabela Fernandes", email: "isabela.f@example.com", cpf: "678.901.234-56" },
]

export const searchUsers = async (query: string): Promise<User[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate API call
  const lowerCaseQuery = query.toLowerCase()
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(lowerCaseQuery) ||
      user.email.toLowerCase().includes(lowerCaseQuery) ||
      user.cpf.includes(query),
  )
}

export const getUserById = async (id: string): Promise<User | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return users.find((user) => user.id === id)
}

export const getUsersByCpf = async (cpf: string): Promise<User | null> => {
  try {
    const users = await getUsers();
    const user = users.find(u => u.cpf === cpf);
    
    if (!user) return null;

    // Converte para o formato esperado pelo componente
    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf
    };
  } catch (error) {
    console.error('Erro ao buscar usuário por CPF:', error);
    return null;
  }
}
