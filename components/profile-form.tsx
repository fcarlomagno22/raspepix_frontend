"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { updatePhone } from "@/app/profile/actions"
import { maskPhone, maskCPF } from "@/lib/form-utils"

interface ProfileData {
  full_name: string
  cpf: string
  email: string
  phone: string
}

interface ProfileFormProps {
  initialData: ProfileData
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const { toast } = useToast()
  const [isPending, setIsPending] = useState(false)
  const [phone, setPhone] = useState(initialData.phone || "")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPending(true)

    try {
      const result = await updatePhone(phone)

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
          variant: "default",
        })
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o telefone",
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl border border-[#9FFF00]/10 bg-[#1A2430] text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Meu Perfil</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Nome Completo
              </Label>
              <Input
                id="name"
                name="name"
                value={initialData.full_name || ""}
                className="bg-[#232D3F] border-[#9FFF00]/10 text-gray-400"
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
                value={initialData.email}
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
                value={maskCPF(initialData.cpf || "")}
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
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
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
