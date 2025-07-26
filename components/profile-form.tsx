"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getUserProfile, updateUserProfile, type UserProfile } from "@/app/profile/actions"
import { maskPhone, maskCEP } from "@/lib/form-utils"

interface ProfileFormProps {
  userId: string // ID do usuário logado
}

export default function ProfileForm({ userId }: ProfileFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // campos editáveis
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const userProfile = await getUserProfile(userId)

      if (userProfile) {
        setProfile(userProfile)
        setName(userProfile.name)
        setPhone(userProfile.phone || "")
        setAddress(userProfile.address || "")
        setCity(userProfile.city || "")
        setState(userProfile.state || "")
        setZipCode(userProfile.zip_code || "")
      } else {
        toast({
          title: "Erro",
          description: "Falha ao carregar o perfil do usuário.",
          variant: "destructive",
        })
      }
      setLoading(false)
    }

    fetchProfile()
  }, [userId, toast])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const formData = new FormData(event.currentTarget)
      const result = await updateUserProfile(userId, formData)

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
          variant: "default",
        })

        // obtém novamente o perfil para atualizar a UI
        const updatedProfile = await getUserProfile(userId)
        if (updatedProfile) {
          setProfile(updatedProfile)
          setName(updatedProfile.name)
          setPhone(updatedProfile.phone || "")
          setAddress(updatedProfile.address || "")
          setCity(updatedProfile.city || "")
          setState(updatedProfile.state || "")
          setZipCode(updatedProfile.zip_code || "")
        }
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Carregando perfil...</div>
  }

  if (!profile) {
    return <div className="flex h-64 items-center justify-center text-red-400">Não foi possível carregar o perfil.</div>
  }

  return (
    <Card className="w-full max-w-2xl border border-[#9FFF00]/10 bg-[#1A2430] text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Meu Perfil</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* linha 1 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Nome Completo
              </Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
                required
                disabled={isPending}
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
                className="bg-[#232D3F] border-[#9FFF00]/10 text-gray-400"
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
                className="bg-[#232D3F] border-[#9FFF00]/10 text-gray-400"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-300">
                Telefone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={maskPhone(phone)}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
                disabled={isPending}
              />
            </div>
          </div>

          {/* linha 2 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="address" className="text-gray-300">
                Endereço
              </Label>
              <Input
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-gray-300">
                Cidade
              </Label>
              <Input
                id="city"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-gray-300">
                Estado
              </Label>
              <Input
                id="state"
                name="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="zip_code" className="text-gray-300">
                CEP
              </Label>
              <Input
                id="zip_code"
                name="zip_code"
                value={maskCEP(zipCode)}
                onChange={(e) => setZipCode(e.target.value)}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-white"
                disabled={isPending}
              />
            </div>
          </div>

          <Button type="submit" className="mt-6 w-full bg-[#9FFF00] text-black hover:bg-[#8AE000]" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
