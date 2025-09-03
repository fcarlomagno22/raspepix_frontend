"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MarketingResource } from "@/types/network"
import { Download, FileText, Image, Video, Link as LinkIcon, Tag, Plus, Trash2, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MarketingResourcesAdminProps {
  resources: MarketingResource[]
  onAddResource?: (resource: MarketingResource) => void
  onDeleteResource?: (resourceId: string) => void
}

const RESOURCE_ICONS = {
  document: FileText,
  image: Image,
  video: Video,
  link: LinkIcon,
} as const

const CATEGORY_COLORS = {
  social: "bg-blue-500/20 text-blue-400",
  whatsapp: "bg-green-500/20 text-green-400",
  email: "bg-purple-500/20 text-purple-400",
  presentation: "bg-amber-500/20 text-amber-400",
} as const

export function MarketingResourcesAdmin({ resources, onAddResource, onDeleteResource }: MarketingResourcesAdminProps) {
  const { toast } = useToast()
  const [isAddingResource, setIsAddingResource] = useState(false)
  const [newResource, setNewResource] = useState({
    title: "",
    type: "document" as keyof typeof RESOURCE_ICONS,
    category: "social" as keyof typeof CATEGORY_COLORS,
    url: "",
  })

  const handleAddResource = () => {
    if (!newResource.title || !newResource.url) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    onAddResource?.({
      id: Date.now().toString(),
      ...newResource,
    })

    setNewResource({
      title: "",
      type: "document",
      category: "social",
      url: "",
    })
    setIsAddingResource(false)

    toast({
      title: "Recurso Adicionado",
      description: "O recurso de marketing foi adicionado com sucesso.",
    })
  }

  const handleDeleteResource = (resourceId: string) => {
    onDeleteResource?.(resourceId)
    toast({
      title: "Recurso Removido",
      description: "O recurso de marketing foi removido com sucesso.",
    })
  }

  const categories = Array.from(new Set(resources.map((r) => r.category)))

  return (
    <div className="space-y-8">
      {/* Botão Adicionar Recurso */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsAddingResource(!isAddingResource)}
          className="bg-[#9FFF00] text-[#191F26] hover:bg-[#8AE000]"
        >
          {isAddingResource ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Recurso
            </>
          )}
        </Button>
      </div>

      {/* Formulário de Novo Recurso */}
      {isAddingResource && (
        <Card className="bg-[#232A34] border-[#366D51] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Novo Recurso</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Título</label>
              <Input
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                className="bg-[#1A2430] border-[#366D51] text-white"
                placeholder="Nome do recurso"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Tipo</label>
                <Select
                  value={newResource.type}
                  onValueChange={(value: keyof typeof RESOURCE_ICONS) =>
                    setNewResource({ ...newResource, type: value })
                  }
                >
                  <SelectTrigger className="bg-[#1A2430] border-[#366D51] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
                    <SelectItem value="document">Documento</SelectItem>
                    <SelectItem value="image">Imagem</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Categoria</label>
                <Select
                  value={newResource.category}
                  onValueChange={(value: keyof typeof CATEGORY_COLORS) =>
                    setNewResource({ ...newResource, category: value })
                  }
                >
                  <SelectTrigger className="bg-[#1A2430] border-[#366D51] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#232A34] border-[#366D51] text-white">
                    <SelectItem value="social">Redes Sociais</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">E-mail Marketing</SelectItem>
                    <SelectItem value="presentation">Apresentações</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">URL</label>
              <Input
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                className="bg-[#1A2430] border-[#366D51] text-white"
                placeholder="Link do recurso"
              />
            </div>

            <Button onClick={handleAddResource} className="w-full bg-[#9FFF00] text-[#191F26] hover:bg-[#8AE000]">
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Recurso
            </Button>
          </div>
        </Card>
      )}

      {/* Grid 2x2 de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((resource) => {
                const Icon = RESOURCE_ICONS[resource.type]
                return (
                  <Card key={resource.id} className="bg-[#232A34] border-[#366D51] p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-[#1A2430] rounded-lg">
                          <Icon className="h-5 w-5 text-[#9FFF00]" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{resource.title}</h3>
                          <Badge className={CATEGORY_COLORS[resource.category]}>
                            <Tag className="h-3 w-3 mr-1" />
                            {resource.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#9FFF00]/30 hover:border-[#9FFF00]/50 hover:bg-[#9FFF00]/10"
                          asChild
                        >
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 text-[#9FFF00]" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteResource(resource.id)}
                          className="border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
        ))}
      </div>
    </div>
  )
} 