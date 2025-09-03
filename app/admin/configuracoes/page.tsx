"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InstitutionalSettingsForm } from "@/components/admin/institutional-settings-form"
import { AdminList } from "@/components/admin/admin-list"
import { NewAdminModal } from "@/components/admin/new-admin-modal" // Changed import back to Modal
import { EditAdminModal } from "@/components/admin/edit-admin-modal"
import { EditPermissionsModal } from "@/components/admin/edit-permissions-modal"
import { DeleteAdminModal } from "@/components/admin/delete-admin-modal"
import { SuccessModal } from "@/components/admin/success-modal"
import AdminHeaderMobile from "@/components/admin/admin-header-mobile"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { useToast } from "@/hooks/use-toast"
import {
  getAdminSettings,
  updateAdminSettings,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleAdminStatus,
  updateAdminPermissions,
} from "@/lib/admin-data"
import type { InstitutionalSettings, AdminUser, PagePermission } from "@/types/admin"

export default function ConfiguracoesPage() {
  const { toast } = useToast()

  // Institutional Settings State
  const [institutionalSettings, setInstitutionalSettings] = useState<InstitutionalSettings>({
    companyName: "",
    supportEmail: "",
    instagramUrl: "",
    tiktokUrl: "",
    facebookUrl: "",
  })
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Admin Users State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true)
  const [isSavingAdmin, setIsSavingAdmin] = useState(false)
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Modal States
  const [isNewAdminModalOpen, setIsNewAdminModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const loadData = async () => {
      // Load Institutional Settings
      try {
        setIsLoadingSettings(true)
        const settings = await getAdminSettings()
        setInstitutionalSettings(settings)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao carregar dados institucionais.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSettings(false)
      }

      // Load Admin Users
      try {
        setIsLoadingAdmins(true)
        const admins = await getAdminUsers()
        setAdminUsers(admins)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao carregar administradores.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingAdmins(false)
      }
    }
    loadData()
  }, [toast])

  // Handlers for Institutional Settings
  const handleSaveInstitutionalSettings = async (settings: InstitutionalSettings) => {
    setIsSavingSettings(true)
    try {
      const updated = await updateAdminSettings(settings)
      setInstitutionalSettings(updated)
      toast({
        title: "Sucesso!",
        description: "Dados institucionais salvos com sucesso.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar dados institucionais.",
        variant: "destructive",
      })
      throw error // Re-throw to allow form to handle its own error state
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Handlers for Admin Users
  const handleNewAdmin = async () => {
    setIsSavingAdmin(true)
    try {
      // Recarregar a lista de administradores após o cadastro
      const admins = await getAdminUsers()
      setAdminUsers(admins)
      setSuccessMessage("Novo administrador cadastrado com sucesso!")
      setIsSuccessModalOpen(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar novo administrador.",
        variant: "destructive",
      })
    } finally {
      setIsSavingAdmin(false)
      setIsNewAdminModalOpen(false)
    }
  }

  const handleEditAdmin = async (updatedAdminData: AdminUser) => {
    setIsSavingAdmin(true)
    try {
      const updated = await updateAdminUser(updatedAdminData)
      setAdminUsers((prev) => prev.map((admin) => (admin.id === updated.id ? updated : admin)))
      setSuccessMessage("Administrador atualizado com sucesso!")
      setIsSuccessModalOpen(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar administrador.",
        variant: "destructive",
      })
    } finally {
      setIsSavingAdmin(false)
      setIsEditModalOpen(false)
      setSelectedAdmin(null)
    }
  }

  const handleUpdateAdminPermissions = async (adminId: string, permissions: PagePermission[]) => {
    setIsSavingAdmin(true)
    try {
      const updated = await updateAdminPermissions(adminId, permissions)
      setAdminUsers((prev) => prev.map((admin) => (admin.id === updated.id ? updated : admin)))
      setSuccessMessage("Permissões atualizadas com sucesso!")
      setIsSuccessModalOpen(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar permissões.",
        variant: "destructive",
      })
    } finally {
      setIsSavingAdmin(false)
      setIsPermissionModalOpen(false)
      setSelectedAdmin(null)
    }
  }

  const handleToggleAdminStatus = async (adminId: string, isActive: boolean) => {
    setIsTogglingStatus(true)
    try {
      const updated = await toggleAdminStatus(adminId, isActive)
      setAdminUsers((prev) => prev.map((admin) => (admin.id === updated.id ? updated : admin)))
      toast({
        title: "Sucesso!",
        description: `Administrador ${isActive ? "ativado" : "desativado"} com sucesso.`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao alterar status do administrador.",
        variant: "destructive",
      })
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    setIsDeletingAdmin(true)
    try {
      await deleteAdminUser(adminId)
      setAdminUsers((prev) => prev.filter((admin) => admin.id !== adminId))
      setSuccessMessage("Administrador excluído com sucesso!")
      setIsSuccessModalOpen(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir administrador.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingAdmin(false)
      setIsDeleteModalOpen(false)
      setSelectedAdmin(null)
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1 ml-0 lg:ml-64">
        <AdminHeaderMobile />
        <main className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Configurações</h1>

          <Tabs defaultValue="institutional" className="w-full">
            <TabsList className="bg-[#232D3F] border border-[#9FFF00]/10 mb-6 w-full">
              <TabsTrigger
                value="institutional"
                className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26] flex-1"
              >
                Dados Institucionais
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26] flex-1"
              >
                Permissões
              </TabsTrigger>
            </TabsList>

            <TabsContent value="institutional">
              <InstitutionalSettingsForm
                settings={institutionalSettings}
                onSave={handleSaveInstitutionalSettings}
                isSaving={isSavingSettings}
                isLoading={isLoadingSettings}
              />
            </TabsContent>

            <TabsContent value="permissions">
              <AdminList
                admins={adminUsers}
                onNewAdmin={() => setIsNewAdminModalOpen(true)}
                onEdit={(admin) => {
                  setSelectedAdmin(admin)
                  setIsEditModalOpen(true)
                }}
                onEditPermissions={(admin) => {
                  setSelectedAdmin(admin)
                  setIsPermissionModalOpen(true)
                }}
                onToggleStatus={handleToggleAdminStatus}
                onDelete={(admin) => {
                  setSelectedAdmin(admin)
                  setIsDeleteModalOpen(true)
                }}
                isLoading={isLoadingAdmins}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Modals */}
      <NewAdminModal // Changed component name back to Modal
        isOpen={isNewAdminModalOpen}
        onClose={() => setIsNewAdminModalOpen(false)}
        onSave={handleNewAdmin}
        isSaving={isSavingAdmin}
      />
      <EditAdminModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedAdmin(null)
        }}
        onSave={handleEditAdmin}
        isSaving={isSavingAdmin}
        admin={selectedAdmin}
      />
      <EditPermissionsModal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false)
          setSelectedAdmin(null)
        }}
        onSave={handleUpdateAdminPermissions}
        isSaving={isSavingAdmin}
        admin={selectedAdmin}
      />
      <DeleteAdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedAdmin(null)
        }}
        onConfirm={handleDeleteAdmin}
        isDeleting={isDeletingAdmin}
        admin={selectedAdmin}
      />
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} message={successMessage} />
    </div>
  )
}
