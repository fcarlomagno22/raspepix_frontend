"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building2, Mail, Instagram, Music, Facebook, Link, Save, Share2, User } from "lucide-react"
import type { InstitutionalSettings } from "@/types/admin"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface InstitutionalSettingsFormProps {
  settings: InstitutionalSettings
  onSave: (settings: InstitutionalSettings) => Promise<void>
  isSaving: boolean
  isLoading: boolean
}

export function InstitutionalSettingsForm({ settings, onSave, isSaving, isLoading }: InstitutionalSettingsFormProps) {
  const [formData, setFormData] = useState<InstitutionalSettings>(settings)
  const { toast } = useToast()

  useEffect(() => {
    setFormData(settings)
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSave(formData)
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
    }
  }

  return (
    <Card className="bg-[#1A2430] border border-[#9FFF00]/10">
      <CardHeader>
        <CardTitle className="text-white">Dados Institucionais</CardTitle>
        <CardDescription className="text-gray-400">
          Configure os dados da empresa e links para redes sociais
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#9FFF00]"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-white flex items-center">
                <User className="h-4 w-4 text-[#9FFF00] mr-2" />
                Nome da Empresa
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="bg-[#232D3F] border-[#9FFF00]/10 text-white pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail" className="text-white flex items-center">
                <Mail className="h-4 w-4 text-[#9FFF00] mr-2" />
                E-mail de Suporte
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="supportEmail"
                  type="email"
                  value={formData.supportEmail}
                  onChange={handleChange}
                  className="bg-[#232D3F] border-[#9FFF00]/10 text-white pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center">
                <Share2 className="h-4 w-4 text-[#9FFF00] mr-2" />
                Redes Sociais
              </h3>
              <div className="bg-[#232D3F] rounded-lg p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl" className="text-white flex items-center">
                    <Instagram className="h-4 w-4 text-pink-400 mr-2" />
                    Instagram
                  </Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={handleChange}
                      placeholder="https://instagram.com/seuusuario"
                      className="bg-[#1A2430] border-[#9FFF00]/10 text-white pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktokUrl" className="text-white flex items-center">
                    <Music className="h-4 w-4 text-cyan-400 mr-2" />
                    TikTok
                  </Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="tiktokUrl"
                      value={formData.tiktokUrl}
                      onChange={handleChange}
                      placeholder="https://tiktok.com/@seuusuario"
                      className="bg-[#1A2430] border-[#9FFF00]/10 text-white pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl" className="text-white flex items-center">
                    <Facebook className="h-4 w-4 text-blue-400 mr-2" />
                    Facebook
                  </Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleChange}
                      placeholder="https://facebook.com/suapagina"
                      className="bg-[#1A2430] border-[#9FFF00]/10 text-white pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="bg-[#9FFF00] hover:bg-[#9FFF00]/90 text-[#191F26] mt-4"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#191F26] mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
