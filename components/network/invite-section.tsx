"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Share2, Users, UserPlus, Megaphone, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface InviteSectionProps {
  clientLink: string
  influencerLink: string
  onShare: (type: "client" | "influencer") => void
}

export function InviteSection({ clientLink, influencerLink, onShare }: InviteSectionProps) {
  const [activeTab, setActiveTab] = useState<"client" | "influencer">("client")
  const [copiedClient, setCopiedClient] = useState(false)
  const [copiedInfluencer, setCopiedInfluencer] = useState(false)

  const handleCopy = async (type: "client" | "influencer") => {
    const link = type === "client" ? clientLink : influencerLink
    await navigator.clipboard.writeText(link)
    
    if (type === "client") {
      setCopiedClient(true)
      setTimeout(() => setCopiedClient(false), 2000)
    } else {
      setCopiedInfluencer(true)
      setTimeout(() => setCopiedInfluencer(false), 2000)
    }
  }

  return (
    <Card className="bg-[#1E2530] border-gray-700 p-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "client" | "influencer")}>
        <TabsList className="grid grid-cols-2 gap-4 bg-transparent">
          <TabsTrigger
            value="client"
            className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26] bg-gray-800"
          >
            <Users className="h-4 w-4 mr-2" />
            Convidar Cliente
          </TabsTrigger>
          <TabsTrigger
            value="influencer"
            className="data-[state=active]:bg-[#9FFF00] data-[state=active]:text-[#191F26] bg-gray-800"
          >
            <Megaphone className="h-4 w-4 mr-2" />
            Convidar Influencer
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent key="client-tab" value="client" className="mt-6">
            <motion.div
              key="client-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-lg font-semibold text-white mb-2">Link para Clientes</h3>
              <p className="text-gray-400 text-sm mb-4">
                Compartilhe este link com pessoas que querem jogar e ganhar prêmios na RaspePix.
              </p>

              <div className="flex gap-2 mb-6">
                <Input
                  value={clientLink}
                  readOnly
                  className="bg-gray-800 border-gray-700"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy("client")}
                  className="shrink-0"
                >
                  {copiedClient ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onShare("client")}
                  className="shrink-0"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button className="h-24 bg-[#9FFF00]/20 hover:bg-[#9FFF00]/30 text-[#9FFF00]">
                  <div className="flex flex-col items-center gap-2">
                    <UserPlus className="h-6 w-6" />
                    <span className="text-xs text-center">Tutorial para Clientes</span>
                  </div>
                </Button>
                <Button className="h-24 bg-[#9FFF00]/20 hover:bg-[#9FFF00]/30 text-[#9FFF00]">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-6 w-6" />
                    <span className="text-xs text-center">Material Promocional</span>
                  </div>
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent key="influencer-tab" value="influencer" className="mt-6">
            <motion.div
              key="influencer-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-lg font-semibold text-white mb-2">Link para Influencers</h3>
              <p className="text-gray-400 text-sm mb-4">
                Compartilhe este link com pessoas que querem fazer parte do time de influenciadores RaspePix.
              </p>

              <div className="flex gap-2 mb-6">
                <Input
                  value={influencerLink}
                  readOnly
                  className="bg-gray-800 border-gray-700"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy("influencer")}
                  className="shrink-0"
                >
                  {copiedInfluencer ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onShare("influencer")}
                  className="shrink-0"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button className="h-24 bg-[#9FFF00]/20 hover:bg-[#9FFF00]/30 text-[#9FFF00]">
                  <div className="flex flex-col items-center gap-2">
                    <Megaphone className="h-6 w-6" />
                    <span className="text-xs text-center">Como ser Influencer</span>
                  </div>
                </Button>
                <Button className="h-24 bg-[#9FFF00]/20 hover:bg-[#9FFF00]/30 text-[#9FFF00]">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-6 w-6" />
                    <span className="text-xs text-center">Kit do Influencer</span>
                  </div>
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </Card>
  )
} 