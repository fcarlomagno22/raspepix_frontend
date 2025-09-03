"use client"

import type React from "react"
import { useState, useEffect, useCallback, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getUserProfile, updatePhone, type UserProfile } from "@/app/profile/actions"
import { maskPhone } from "@/lib/form-utils"
import { PencilIcon, Loader2, CheckIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { z } from "zod"
import { SUPABASE_URLS } from "@/config/supabase-urls"

// Schema de validação do telefone
const phoneSchema = z
  .string()
  .min(10, "Telefone deve ter no mínimo 10 dígitos")
  .max(11, "Telefone deve ter no máximo 11 dígitos")
  .regex(/^\d+$/, "Telefone deve conter apenas números")

export default function ProfileCard() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [isSavingPhone, setIsSavingPhone] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)
        const userProfile = await getUserProfile()

        if (userProfile) {
          setProfile(userProfile)
          setName(userProfile.name)
          setPhone(userProfile.phone || "")
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
        setError(error instanceof Error ? error.message : "Erro ao carregar dados do perfil")
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao carregar dados do perfil",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [toast])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "phone") {
      setPhone(value)
      setPhoneError(null) // Limpa o erro quando o usuário começa a digitar
    }
  }, [])

  const handlePhoneEdit = () => {
    if (isEditingPhone && phone !== profile?.phone) {
      handlePhoneSave()
    } else {
      setIsEditingPhone(!isEditingPhone)
    }
  }

  const handlePhoneSave = async () => {
    try {
      setIsSavingPhone(true)
      setPhoneError(null)

      // Remove todos os caracteres não numéricos
      const cleanPhone = phone.replace(/\D/g, "")

      // Valida o telefone
      try {
        phoneSchema.parse(cleanPhone)
      } catch (error) {
        if (error instanceof z.ZodError) {
          setPhoneError(error.errors[0].message)
          return
        }
      }

      const result = await updatePhone(cleanPhone)

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
          variant: "default",
        })
        setIsEditingPhone(false)
        
        // Atualiza o perfil com o novo telefone
        if (profile && result.phone) {
          setProfile({
            ...profile,
            phone: result.phone
          })
        }
      } else {
        setPhoneError(result.message)
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar telefone:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar telefone"
      setPhoneError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSavingPhone(false)
    }
  }

  const handleCancelPhoneEdit = () => {
    setPhone(profile?.phone || "")
    setPhoneError(null)
    setIsEditingPhone(false)
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl border border-[#9FFF00]/10 bg-[#1A2430] text-white animate-fade-in">
        <CardContent className="flex h-64 items-center justify-center text-gray-400">Carregando perfil...</CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl border border-[#9FFF00]/10 bg-[#1A2430] text-white animate-fade-in">
        <CardContent className="flex h-64 items-center justify-center text-red-400">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-2xl border border-[#9FFF00]/10 bg-[#1A2430] text-white animate-fade-in">
        <CardContent className="flex h-64 items-center justify-center text-red-400">
          Não foi possível carregar o perfil.
        </CardContent>
      </Card>
    )
  }

  const inputBaseClasses = "w-full p-3 rounded-md text-gray-200 focus:outline-none transition-all duration-200"
  const editableInputClasses =
    "bg-[#232D3F] border-[#9FFF00]/20 focus:border-[#9FFF00] focus:ring-1 focus:ring-[#9FFF00]"
  const readOnlyInputClasses = "bg-[#1A2430] border-transparent text-gray-400 cursor-default"

  return (
    <Card className="w-full max-w-2xl border border-[#9FFF00]/10 bg-[#1A2430] text-white shadow-glow-sm animate-fade-in">
      <div className="flex flex-col items-center -mt-12">
        <div className="w-24 h-24 rounded-full border-4 border-[#9FFF00]/20 overflow-hidden bg-[#232D3F] relative">
          <Image
                            src={profile.profile_picture || SUPABASE_URLS.IMAGES.RIPO_3X4}
            alt="Foto de Perfil"
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      </div>

      <CardHeader className="text-center py-6 border-b border-[#9FFF00]/10">
        <CardTitle className="text-3xl font-bold text-[#9FFF00] animate-text-glow">Meu Perfil</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8 p-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-200">Dados Pessoais</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Nome Completo
              </Label>
              <Input
                id="name"
                name="name"
                value={name}
                className={cn(inputBaseClasses, readOnlyInputClasses)}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                className={cn(inputBaseClasses, readOnlyInputClasses)}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="document" className="text-gray-300">
                CPF
              </Label>
              <Input
                id="document"
                name="document"
                value={profile.document ?? ""}
                className={cn(inputBaseClasses, readOnlyInputClasses)}
                disabled
              />
            </div>
            <div className="relative">
              <Label htmlFor="phone" className="text-gray-300">
                Telefone
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  name="phone"
                  value={maskPhone(phone)}
                  onChange={handleInputChange}
                  className={cn(
                    inputBaseClasses,
                    isEditingPhone ? editableInputClasses : readOnlyInputClasses,
                    phoneError && "border-red-500",
                    "pr-24", // Espaço para os botões
                  )}
                  disabled={isSavingPhone || !isEditingPhone}
                  maxLength={15}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  {isEditingPhone ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={handleCancelPhoneEdit}
                        className="text-gray-400 hover:text-red-400"
                        disabled={isSavingPhone}
                      >
                        <XIcon className="h-4 w-4" />
                        <span className="sr-only">Cancelar edição</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={handlePhoneSave}
                        className="text-gray-400 hover:text-[#9FFF00]"
                        disabled={isSavingPhone}
                      >
                        {isSavingPhone ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">Salvar telefone</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={handlePhoneEdit}
                      className="text-gray-400 hover:text-[#9FFF00]"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Editar telefone</span>
                    </Button>
                  )}
                </div>
              </div>
              {phoneError && (
                <p className="mt-1 text-sm text-red-400">{phoneError}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
