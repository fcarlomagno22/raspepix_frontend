"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Trash2, CheckCheck, X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDate } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { getUserNotifications, hideNotification, markNotificationAsRead } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { DialogClose } from "@/components/ui/dialog"

// Define a interface para uma notificação
interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  important: boolean
  date: string
  time?: string
  created_at?: string
  target_type?: "all" | "selected" | "single"
  is_active?: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<string | string[] | null>(null)
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const { isMobile } = useMobile()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const response = await getUserNotifications(currentPage)
        setNotifications(response.notifications)
        setTotalPages(response.totalPages)
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas notificações. Por favor, tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [currentPage, toast])

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * 10 // Assuming ITEMS_PER_PAGE is 10
    const endIndex = startIndex + 10
    return notifications.slice(startIndex, endIndex)
  }, [notifications, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const markAsRead = async (id: string) => {
    try {
      const updatedNotification = await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((notif) => (notif.id === id ? updatedNotification : notif)));
      setSelectedNotifications((prev) => prev.filter((notifId) => notifId !== id));
      toast({
        title: "Sucesso",
        description: "Notificação marcada como lida",
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao marcar notificação como lida',
        variant: "destructive",
      });
    }
  }

  const markSelectedAsRead = async () => {
    try {
      const promises = selectedNotifications.map(id => markNotificationAsRead(id));
      const updatedNotifications = await Promise.all(promises);
      
    setNotifications((prev) =>
        prev.map((notif) => {
          const updated = updatedNotifications.find(n => n.id === notif.id);
          return updated || notif;
        })
      );
      setSelectedNotifications([]);
      
      toast({
        title: "Sucesso",
        description: "Notificações marcadas como lidas",
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
      toast({
        title: "Erro",
        description: 'Erro ao marcar notificações como lidas',
        variant: "destructive",
      });
    }
  }

  const confirmDeleteNotification = (id: string) => {
    setNotificationToDelete(id)
    setIsDeletingMultiple(false)
    setShowDeleteConfirmationModal(true)
  }

  const confirmDeleteSelectedNotifications = () => {
    setNotificationToDelete(selectedNotifications)
    setIsDeletingMultiple(true)
    setShowDeleteConfirmationModal(true)
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    setSelectedNotifications((prev) => prev.filter((notifId) => notifId !== id))
    setShowDeleteConfirmationModal(false)
    setNotificationToDelete(null)
  }

  const deleteSelectedNotifications = () => {
    setNotifications((prev) => prev.filter((notif) => !selectedNotifications.includes(notif.id)))
    setSelectedNotifications([])
    setShowDeleteConfirmationModal(false)
    setNotificationToDelete(null)
  }

  const cancelDelete = () => {
    setShowDeleteConfirmationModal(false)
    setNotificationToDelete(null)
    setIsDeletingMultiple(false)
  }

  const executeDelete = async () => {
    try {
    if (isDeletingMultiple && Array.isArray(notificationToDelete)) {
        // Por enquanto mantemos o comportamento atual para deleção múltipla
        deleteSelectedNotifications();
    } else if (typeof notificationToDelete === "string") {
        await hideNotification(notificationToDelete);
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationToDelete));
        toast({
          title: "Sucesso",
          description: "Notificação removida com sucesso",
          variant: "default",
        });
      }
      setShowDeleteConfirmationModal(false);
      setNotificationToDelete(null);
      setIsDeletingMultiple(false);
    } catch (error) {
      console.error('Erro ao ocultar notificação:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao remover notificação',
        variant: "destructive",
      });
    }
  }

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications((prev) => (prev.includes(id) ? prev.filter((notifId) => notifId !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(notifications.map((notif) => notif.id))
    }
  }

  const openNotificationModal = async (notification: Notification) => {
    try {
      let notificationToShow = notification;
      
      if (!notification.read) {
        const updatedNotification = await markNotificationAsRead(notification.id);
        notificationToShow = updatedNotification;
        
        // Atualiza a notificação na lista local
        setNotifications((prev) => 
          prev.map((n) => n.id === notification.id ? updatedNotification : n)
        );
      }
      
      setSelectedNotification(notificationToShow);
      setShowNotificationModal(true);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast({
        title: "Erro",
        description: 'Erro ao marcar notificação como lida',
        variant: "destructive",
      });
      // Ainda abre o modal mesmo se der erro ao marcar como lida
      setSelectedNotification(notification);
      setShowNotificationModal(true);
    }
  }

  const closeNotificationModal = () => {
    setShowNotificationModal(false)
    setSelectedNotification(null)
  }

  const isLongMessage = (message: string) => message.length > 100 // Define what constitutes a "long message"

  const selectAll = selectedNotifications.length === notifications.length && notifications.length > 0

  return (
    <AuthenticatedLayout>
      {" "}
      {/* WRAPPED WITH AUTHENTICATED LAYOUT */}
      <main className="flex-1 pt-4 pb-36 px-3 md:px-4 lg:px-8 max-w-full md:max-w-6xl mx-auto w-full">
        <h1 className="text-white text-xl md:text-2xl font-bold mb-4 mt-6 text-center">Notificações</h1>

        {selectedNotifications.length > 0 && (
          <div className="flex space-x-2 mb-4">
            <Button
              onClick={markSelectedAsRead}
              className="bg-[#1E2530] hover:bg-[#1E2530]/80 text-white text-xs h-8 px-2 rounded-lg"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              {isMobile ? "Lidas" : "Marcar como lidas"}
            </Button>
            <Button
              onClick={confirmDeleteSelectedNotifications}
              className="bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs h-8 px-2 rounded-lg"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isMobile ? "Excluir" : "Excluir selecionadas"}
            </Button>
          </div>
        )}

        <div className="flex items-center mb-3 bg-[#1E2530] p-2 rounded-lg">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={toggleSelectAll}
            className="data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-[#191F26]"
          />
          <label htmlFor="select-all" className="text-white text-sm ml-2 cursor-pointer">
            Selecionar todas
          </label>
          <span className="ml-auto text-gray-400 text-xs">{notifications.length} notificações</span>
        </div>

        {isLoading ? (
          <div className="bg-[#1E2530] rounded-lg p-4 text-center">
            <p className="text-gray-400">Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-[#1E2530] rounded-lg p-4 text-center">
            <Bell className="h-12 w-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">Você não tem notificações</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`bg-[#1E2530] rounded-lg p-4 relative ${
                    notification.read ? "opacity-70" : "border-l-4 border-[#9FFF00] bg-[#1E2530]/80"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={() => toggleNotificationSelection(notification.id)}
                      className="mt-1 data-[state=checked]:bg-[#9FFF00] data-[state=checked]:text-[#191F26]"
                      />
                    <div 
                      className="flex-1 min-w-0 cursor-pointer" 
                      onClick={() => openNotificationModal(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <h3
                          className={`text-sm font-medium mb-1 ${
                            notification.read ? "text-gray-400" : "text-white"
                          }`}
                        >
                          {notification.title}
                          {notification.important && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/20 text-red-400">
                              Importante
                            </span>
                          )}
                          {!notification.read && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#9FFF00]/10 text-[#9FFF00]">
                              Nova
                          </span>
                          )}
                        </h3>
                        <div className="flex items-center space-x-2 ml-2">
                          {!notification.read && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs h-6 px-2 bg-[#1E2530] hover:bg-[#1E2530]/80 text-gray-400"
                            >
                              <CheckCheck className="h-3 w-3 mr-1" />
                              {!isMobile && "Marcar como lida"}
                            </Button>
                          )}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteNotification(notification.id);
                            }}
                            className="text-xs h-6 px-2 bg-red-900/20 hover:bg-red-900/40 text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p
                        className={`text-sm mb-2 ${
                          notification.read ? "text-gray-500" : "text-gray-300"
                        }`}
                      >
                        {isLongMessage(notification.message) ? (
                          <>
                            {notification.message.slice(0, 100)}...{" "}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openNotificationModal(notification);
                              }}
                              className="text-[#9FFF00] hover:underline focus:outline-none"
                            >
                              Ver mais
                            </button>
                          </>
                        ) : (
                          notification.message
                          )}
                        </p>
                      <div className="text-xs text-gray-500">
                        {notification.date} {notification.time}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="flex justify-center mt-4 space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="bg-[#1E2530] hover:bg-[#1E2530]/80 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              {!isMobile && "Anterior"}
            </Button>
            <span className="flex items-center px-4 py-2 bg-[#1E2530] text-white rounded-lg">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="bg-[#1E2530] hover:bg-[#1E2530]/80 text-white"
            >
              {!isMobile && "Próxima"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Modais */}
              <Dialog open={showNotificationModal} onOpenChange={closeNotificationModal}>
          <DialogContent className="bg-[#1E2530] border border-gray-800 p-6 gap-0 rounded-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9FFF00]/20 via-[#9FFF00] to-[#9FFF00]/20 rounded-t-xl"></div>
            
            <DialogHeader className="relative">
              <div className="absolute -left-6 top-0 h-full w-1 bg-[#9FFF00]/30"></div>
              <DialogTitle className="text-xl font-bold text-white text-left">
                {selectedNotification?.title}
                {selectedNotification?.important && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-red-900/20 text-red-400">
                    Importante
                  </span>
                )}
                    </DialogTitle>
                  </DialogHeader>

            <div className="space-y-6">
              {/* Mensagem */}
              <div className="bg-[#191F26] rounded-lg p-4 border border-gray-800">
                <p className="text-gray-200 text-sm leading-relaxed">
                  {selectedNotification?.message}
                </p>
              </div>

              {/* Informações de Data/Hora */}
              <div className="bg-[#191F26] rounded-lg p-4 border border-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[#9FFF00] text-xs font-medium">Data</p>
                    <p className="text-gray-300 text-sm">{selectedNotification?.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[#9FFF00] text-xs font-medium">Hora</p>
                    <p className="text-gray-300 text-sm">{selectedNotification?.time}</p>
                  </div>
                  {selectedNotification?.created_at && (
                    <div className="col-span-2 space-y-1">
                      <p className="text-[#9FFF00] text-xs font-medium">Criado em</p>
                      <p className="text-gray-300 text-sm">
                        {new Date(selectedNotification.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
                    <Button
                      onClick={closeNotificationModal}
                className="bg-[#191F26] hover:bg-[#191F26]/80 text-white border border-gray-800 hover:border-[#9FFF00]/50 transition-colors rounded-lg"
                    >
                      Fechar
                    </Button>
                  </DialogFooter>

            <DialogClose className="absolute right-4 top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4 text-gray-400" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
                </DialogContent>
              </Dialog>

              <AlertDialog open={showDeleteConfirmationModal} onOpenChange={cancelDelete}>
          <AlertDialogContent className="bg-[#1E2530] border border-gray-800 p-6 gap-0 rounded-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20 rounded-t-xl"></div>
            
            <AlertDialogHeader className="relative">
              <div className="absolute -left-6 top-0 h-full w-1 bg-red-500/30"></div>
              <AlertDialogTitle className="text-xl font-bold text-white">
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 mt-2">
                      {isDeletingMultiple
                  ? `Tem certeza que deseja excluir ${selectedNotifications.length} notificações?`
                        : "Tem certeza que deseja excluir esta notificação?"}
                <p className="text-sm text-gray-400 mt-2">Esta ação não pode ser desfeita.</p>
                    </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-6 space-x-2">
                    <AlertDialogCancel
                      onClick={cancelDelete}
                className="bg-[#191F26] hover:bg-[#191F26]/80 text-white border border-gray-800 hover:border-[#9FFF00]/50 transition-colors mt-0 rounded-lg"
                    >
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={executeDelete}
                className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 hover:border-red-500 transition-colors rounded-lg"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
      </main>
    </AuthenticatedLayout>
  )
}
