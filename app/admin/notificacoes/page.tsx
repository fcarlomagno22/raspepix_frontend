"use client"

import { useState, useEffect, useCallback } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import {
  Bell,
  Plus,
  Trash2,
  Edit,
  Users,
  User,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  SortDesc,
  SortAsc,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  getTargetUserNames,
} from "@/lib/notification"
import type { Notification, NotificationTargetType } from "@/types/notification"
import NotificationForm from "@/components/admin/notification-form"
import DeleteNotificationDialog from "@/components/admin/delete-notification-dialog"

type NotificationStatusFilter = "all" | "active" | "inactive"
type SortOrder = "asc" | "desc"

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<NotificationStatusFilter>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc") // 'desc' for newest first
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [deletingNotification, setDeletingNotification] = useState<Notification | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllNotifications()
      setNotifications(data)
    } catch (err) {
      setError("Falha ao carregar notificações.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleNewNotification = () => {
    setEditingNotification(null)
    setFormError(null)
    setIsFormOpen(true)
  }

  const handleEditNotification = (notification: Notification) => {
    setEditingNotification(notification)
    setFormError(null)
    setIsFormOpen(true)
  }

  const handleDeleteNotification = async (notification: Notification) => {
    setDeletingNotification(notification);
  }

  const handleConfirmDelete = async () => {
    if (!deletingNotification) return;
    
    try {
      setLoading(true);
      await deleteNotification(deletingNotification.id);
      await fetchNotifications();
    } catch (err) {
      setError("Falha ao excluir notificação. Por favor, tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
      setDeletingNotification(null);
    }
  }

  const handleSaveNotification = async (notificationData: Omit<Notification, "id" | "created_at">) => {
    setFormLoading(true)
    setFormError(null)
    try {
      if (editingNotification) {
        await updateNotification(editingNotification.id, notificationData)
      } else {
        await createNotification(notificationData)
      }
      setIsFormOpen(false)
      fetchNotifications() // Re-fetch to update list
    } catch (err) {
      setFormError("Falha ao salvar notificação. Verifique os dados.")
      console.error(err)
    } finally {
      setFormLoading(false)
    }
  }

  const filteredAndSortedNotifications = notifications
    .filter((notif) => {
      const matchesSearch =
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTargetUserNames(notif).text.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && notif.is_active) ||
        (statusFilter === "inactive" && !notif.is_active)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

  const getTargetIcon = (type: NotificationTargetType) => {
    switch (type) {
      case "all":
        return <Users className="h-4 w-4 mr-1" style={{ color: "#9FFF00" }} />
      case "selected":
        return <UserPlus className="h-4 w-4 mr-1" style={{ color: "#00A3FF" }} />
      case "single":
        return <User className="h-4 w-4 mr-1" style={{ color: "#FF9F00" }} />
      default:
        return <AlertCircle className="h-4 w-4 mr-1" style={{ color: "#FF0000" }} />
    }
  }

  // Dummy session time and logout for AdminSidebar
  const sessionTimeRemaining = 3600 // 1 hour
  const handleLogout = () => {
    console.log("Admin logged out")
    // Implement actual logout logic here
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar sessionTimeRemaining={sessionTimeRemaining} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="flex items-center justify-between p-4 border-b border-[#9FFF00]/10 bg-[#1A2430] lg:hidden">
          {/* Mobile header content, e.g., menu button and title */}
          <span className="text-white text-lg font-semibold">Notificações</span>
          {/* AdminSidebar SheetTrigger is already in AdminSidebar */}
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Notificações</h1>
            <Button
              onClick={handleNewNotification}
              className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26] w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Notificação
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar notificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#232D3F] border-[#9FFF00]/10 focus:border-[#9FFF00]/30 text-white"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-[#9FFF00]/10 bg-[#232D3F] text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar ({statusFilter === "all" ? "Todas" : statusFilter === "active" ? "Ativas" : "Inativas"})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#232D3F] border-[#9FFF00]/10 text-white">
                <DropdownMenuItem
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "bg-[#9FFF00]/10 text-white" : ""}
                >
                  Todas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("active")}
                  className={statusFilter === "active" ? "bg-[#9FFF00]/10 text-white" : ""}
                >
                  Ativas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("inactive")}
                  className={statusFilter === "inactive" ? "bg-[#9FFF00]/10 text-white" : ""}
                >
                  Inativas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="border-[#9FFF00]/10 bg-[#232D3F] text-white"
            >
              {sortOrder === "desc" ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
              Data
            </Button>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64 text-gray-400">Carregando notificações...</div>
          )}

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">{error}</div>}

          {!loading && !error && filteredAndSortedNotifications.length === 0 && (
            <Card className="bg-[#1A2430] border border-[#9FFF00]/10">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Bell size={48} className="text-gray-500 mb-4" />
                <p className="text-gray-400 text-center">Nenhuma notificação encontrada.</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && filteredAndSortedNotifications.length > 0 && (
            <div className="grid gap-4">
              {filteredAndSortedNotifications.map((notification) => (
                <Card key={notification.id} className="bg-[#1A2430] border border-[#9FFF00]/10">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-white text-lg max-w-[80%] truncate">{notification.title}</CardTitle>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditNotification(notification)}
                          className="text-gray-400 hover:text-white hover:bg-[#9FFF00]/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNotification(notification)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <div className="flex items-center">
                        {getTargetIcon(notification.target_type)}
                        {notification.target_type !== "all" && (
                          <span style={{ color: getTargetUserNames(notification).color }}>
                            {getTargetUserNames(notification).text}
                          </span>
                        )}
                      </div>
                      <span className="mx-2">•</span>
                      {notification.date} às {notification.time}
                    </div>
                  </CardHeader>
                  <CardContent className="text-gray-300">{notification.message}</CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        <NotificationForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={(notification) => {
            setIsFormOpen(false);
            fetchNotifications(); // Recarrega a lista após criar
          }}
          initialData={editingNotification}
          onUpdate={fetchNotifications} // Passa a função para recarregar a lista
        />

        <DeleteNotificationDialog
          isOpen={!!deletingNotification}
          onClose={() => setDeletingNotification(null)}
          onConfirm={handleConfirmDelete}
          title={deletingNotification?.title || ""}
        />
      </div>
    </div>
  )
}
