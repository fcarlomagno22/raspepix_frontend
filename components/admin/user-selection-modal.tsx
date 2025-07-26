"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, User, Check } from "lucide-react"
import type { User as AppUser } from "@/types/notification"
import { getUsers } from "@/services/api"

interface UserSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUsers: (users: AppUser[]) => void
  initialSelectedUsers: AppUser[]
  singleSelect?: boolean
}

export default function UserSelectionModal({
  isOpen,
  onClose,
  onSelectUsers,
  initialSelectedUsers,
  singleSelect,
}: UserSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<AppUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>(initialSelectedUsers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedUsers(initialSelectedUsers);
  }, [initialSelectedUsers]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUsers = await getUsers();
      // Converte para o formato esperado pelo componente
      const formattedUsers = apiUsers.map(user => ({
        id: user.id,
        name: user.name,
        cpf: user.cpf
      }));
      setUsers(formattedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: AppUser) => {
    if (singleSelect) {
      setSelectedUsers([user]);
    } else {
      if (selectedUsers.some(u => u.id === user.id)) {
        setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
      } else {
        setSelectedUsers(prev => [...prev, user]);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cpf.includes(searchTerm)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A2430] text-white border-[#9FFF00]/10 max-w-[90%] w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {singleSelect ? "Selecionar Usuário" : "Selecionar Usuários"}
          </DialogTitle>
        </DialogHeader>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#232D3F] border-[#9FFF00]/10 focus:border-[#9FFF00]/30 text-white"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center items-center h-32 text-gray-400">
              Carregando usuários...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Nenhum usuário encontrado
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUsers.some(u => u.id === user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#9FFF00]/10 border border-[#9FFF00]/30"
                      : "bg-[#232D3F] border border-[#9FFF00]/10 hover:border-[#9FFF00]/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">CPF: {user.cpf}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-[#9FFF00]" />
                  )}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-[#9FFF00] text-[#9FFF00] hover:bg-[#9FFF00]/10 bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSelectUsers(selectedUsers);
              onClose();
            }}
            disabled={selectedUsers.length === 0}
            className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26]"
          >
            {singleSelect ? "Selecionar Usuário" : `Selecionar (${selectedUsers.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
