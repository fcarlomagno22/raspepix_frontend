"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MarketingResource } from "@/types/network"
import { Download, FileText, Image, Video, Link as LinkIcon, Tag } from "lucide-react"

interface ResourcesSectionProps {
  resources: MarketingResource[]
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

export function ResourcesSection({ resources }: ResourcesSectionProps) {
  const categories = Array.from(new Set(resources.map((r) => r.category)))

  return (
    <div className="space-y-8">
      {categories.map((category, categoryIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4 capitalize">
            {category === "social"
              ? "Redes Sociais"
              : category === "whatsapp"
              ? "WhatsApp"
              : category === "email"
              ? "E-mail Marketing"
              : "Apresentações"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources
              .filter((resource) => resource.category === category)
              .map((resource, index) => {
                const Icon = RESOURCE_ICONS[resource.type]

                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: (categoryIndex * 0.1) + (index * 0.05) }}
                  >
                    <Card className="p-6 bg-[#1E2530] border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${CATEGORY_COLORS[resource.category]}`}>
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{resource.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{resource.description}</p>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {resource.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-gray-800 text-gray-300"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <Button
                            className="w-full mt-4 bg-[#9FFF00]/20 hover:bg-[#9FFF00]/30 text-[#9FFF00]"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Material
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
          </div>
        </motion.div>
      ))}
    </div>
  )
} 