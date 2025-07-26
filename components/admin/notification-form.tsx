"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Users, UserPlus, User, X } from "lucide-react"
import type { Notification, NotificationTargetType, User as AppUser } from "@/types/notification"
import UserSelectionModal from "./user-selection-modal"
import { getUsersByCpf } from "@/lib/users"
import { validateNotification } from "@/lib/notification"
import { createNotification, updateNotification, getUsers } from "@/services/api"

interface NotificationFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (notification: Notification) => void
  initialData?: Notification | null
  onUpdate?: () => void // Nova prop para recarregar a lista
}

export default function NotificationForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  onUpdate,
}: NotificationFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [message, setMessage] = useState(initialData?.message || "")
  const [targetType, setTargetType] = useState<NotificationTargetType>(initialData?.target_type || "all")
  const [selectedUsers, setSelectedUsers] = useState<AppUser[]>([])
  const [availableUsers, setAvailableUsers] = useState<AppUser[]>([])
  const [isNotificationActive, setIsNotificationActive] = useState(initialData?.is_active ?? true)
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(false)
  const [cpfSearch, setCpfSearch] = useState("")
  const [cpfSearchError, setCpfSearchError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if ((targetType === "selected" || targetType === "single") && availableUsers.length === 0) {
      loadUsers();
    }
  }, [targetType]);

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      console.log('Resposta completa:', response); // Debug
      const formattedUsers = response.users.map(user => {
        if (!user.uuid) {
          console.error('User without uuid:', user);
          return null;
        }
        return {
          id: user.uuid,
          name: user.full_name,
        cpf: user.cpf
        };
      }).filter(Boolean); // Remove any null entries
      
      console.log('Formatted users:', formattedUsers); // Debug
      setAvailableUsers(formattedUsers);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Não foi possível carregar a lista de usuários');
    }
  };

  const handleSelectUser = (user: AppUser) => {
    if (targetType === "single") {
      // Para seleção única, substitui a lista inteira
      setSelectedUsers([user]);
    } else if (targetType === "selected") {
      // Para seleção múltipla, verifica se já está selecionado
      const isAlreadySelected = selectedUsers.find(u => u.id === user.id);
      if (isAlreadySelected) {
        // Se já está selecionado, remove
        setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
      } else {
        // Se não está selecionado, adiciona
        setSelectedUsers(prev => [...prev, user]);
      }
    }
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setMessage(initialData.message)
      setTargetType(initialData.target_type)
      setIsNotificationActive(initialData.is_active)
      // TODO: Carregar usuários selecionados quando implementarmos a API
      setSelectedUsers([])
    } else {
      setTitle("")
      setMessage("")
      setTargetType("all")
      setSelectedUsers([])
      setIsNotificationActive(true)
    }
    setCpfSearch("")
    setCpfSearchError(null)
  }, [initialData, isOpen])

  const handleCpfSearch = useCallback(async () => {
    if (!cpfSearch) {
      setCpfSearchError("Por favor, digite um CPF.")
      return
    }
    setCpfSearchError(null)
    try {
      const user = await getUsersByCpf(cpfSearch)
      if (user) {
        if (targetType === "single") {
          setSelectedUsers([user])
        } else if (targetType === "selected") {
          if (!selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers((prev) => [...prev, user])
          }
        }
        setCpfSearch("")
      } else {
        setCpfSearchError("CPF não encontrado.")
      }
    } catch (err) {
      setCpfSearchError("Erro ao buscar CPF.")
    }
  }, [cpfSearch, selectedUsers, targetType])

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const notificationData = {
      title,
      message,
      target_type: targetType,
      is_active: isNotificationActive,
      target_users: targetType === "selected" ? selectedUsers.map((u) => u.id) : undefined,
      single_user_id: targetType === "single" ? selectedUsers[0]?.id : undefined,
    }

    // Validar dados antes de enviar
    const errors = validateNotification(notificationData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setLoading(true);
    setError(null);

    try {
      let savedNotification;
      if (initialData?.id) {
        savedNotification = await updateNotification(initialData.id, notificationData);
        onUpdate?.(); // Chama a função de atualização após editar
      } else {
        savedNotification = await createNotification(notificationData);
      }
      onSuccess?.(savedNotification);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar notificação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A2430] text-white border-[#9FFF00]/10 max-w-[90%] w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {initialData ? "Editar Notificação" : "Nova Notificação"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 mt-6 pr-2">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md text-sm">{error}</div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-white">
              Título
            </Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={`bg-[#232D3F] border-[#9FFF00]/10 focus:border-[#9FFF00]/30 text-white ${
                validationErrors.title ? "border-red-500" : ""
              }`}
            />
            {validationErrors.title && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.title}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message" className="text-white">
              Mensagem
            </Label>
            <Textarea
              id="message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className={`bg-[#232D3F] border-[#9FFF00]/10 focus:border-[#9FFF00]/30 text-white resize-none ${
                validationErrors.message ? "border-red-500" : ""
              }`}
            />
            {validationErrors.message && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="target_type" className="text-white">
              Destinatários
            </Label>
            <Select
              value={targetType}
              onValueChange={(value: NotificationTargetType) => {
                setTargetType(value)
                setSelectedUsers([]) // Clear selected users when target type changes
              }}
            >
              <SelectTrigger className="bg-[#232D3F] border-[#9FFF00]/10 focus:border-[#9FFF00]/30 text-white [&>svg]:text-[#9FFF00]">
                <SelectValue placeholder="Selecione o tipo de destinatário" />
              </SelectTrigger>
              <SelectContent className="bg-[#232D3F] border-[#9FFF00]/10 text-white">
                <SelectItem value="all" className="focus:bg-[#9FFF00]/10 focus:text-white">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" style={{ color: "#9FFF00" }} /> 
                    <span style={{ color: "#9FFF00" }}>Todos os usuários</span>
                  </div>
                </SelectItem>
                <SelectItem value="selected" className="focus:bg-[#9FFF00]/10 focus:text-white">
                  <div className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" style={{ color: "#00A3FF" }} /> 
                    <span style={{ color: "#00A3FF" }}>Selecionar múltiplos usuários</span>
                  </div>
                </SelectItem>
                <SelectItem value="single" className="focus:bg-[#9FFF00]/10 focus:text-white">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" style={{ color: "#FF9F00" }} /> 
                    <span style={{ color: "#FF9F00" }}>Apenas um usuário</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(targetType === "selected" || targetType === "single") && (
            <div className="space-y-4 border border-[#9FFF00]/10 p-4 rounded-md">
              <h4 className="font-semibold text-white">Seleção de Usuários</h4>
              <div className="flex gap-2 items-end">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="cpfSearch" className="text-white">
                    Buscar por CPF
                  </Label>
                  <Input
                    id="cpfSearch"
                    placeholder="Digite o CPF"
                    value={cpfSearch}
                    onChange={(e) => setCpfSearch(e.target.value)}
                    className="bg-[#232D3F] border-[#9FFF00]/10 focus:border-[#9FFF00]/30 text-white h-9 w-40"
                  />
                  {cpfSearchError && <p className="text-red-400 text-xs">{cpfSearchError}</p>}
                </div>
                <Button
                  type="button"
                  onClick={handleCpfSearch}
                  className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26] border-[#9FFF00]"
                >
                  Buscar CPF
                </Button>
              </div>

              <div className="bg-[#232D3F] border border-[#9FFF00]/10 rounded-md p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                {error && (
                  <p className="text-center text-red-400 py-4">{error}</p>
                )}
                {!error && availableUsers.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">Carregando usuários...</p>
                ) : (
                  <div className="space-y-2">
                    {availableUsers.slice(0, 25).map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`flex items-center justify-between text-white text-sm bg-[#1A2430] p-2 rounded-md cursor-pointer hover:bg-[#9FFF00]/10 ${
                          selectedUsers.find(u => u.id === user.id)
                            ? "border border-[#9FFF00]/30"
                            : "border border-transparent"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-[#9FFF00]" />
                          <span>{user.name}</span>
                          <span className="text-gray-400">({user.cpf})</span>
                        </div>
                        {selectedUsers.find(u => u.id === user.id) && (
                          <X className="h-4 w-4 text-[#9FFF00]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isNotificationActive}
              onCheckedChange={setIsNotificationActive}
              className="data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-[#191F26]"
            />
            <Label htmlFor="is_active" className="text-white">
              Notificação Ativa
            </Label>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#9FFF00] text-[#9FFF00] hover:bg-[#9FFF00]/10 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26]">
              {loading ? "Salvando..." : initialData ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>

        <UserSelectionModal
          isOpen={isUserSelectionModalOpen}
          onClose={() => setIsUserSelectionModalOpen(false)}
          onSelectUsers={(users) => {
            if (targetType === "single") {
              setSelectedUsers(users.slice(0, 1)) // Only take the first one for single select
            } else {
              setSelectedUsers(users)
            }
          }}
          initialSelectedUsers={selectedUsers}
          singleSelect={targetType === "single"}
        />
      </DialogContent>
    </Dialog>
  )
}
