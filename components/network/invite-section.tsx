"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs } from "@/components/ui/tabs"
import { Copy, Share2, Users, Megaphone, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useReferralLink } from "@/hooks/use-referral-link"
import { Skeleton } from "@/components/ui/skeleton"

interface InviteSectionProps {
  onShare: (type: "client" | "influencer") => void
  isInfluencer: boolean
}

export function InviteSection({ onShare, isInfluencer }: InviteSectionProps) {
  const [copiedClient, setCopiedClient] = useState(false)
  const { referralLink, isLoading, error } = useReferralLink(isInfluencer)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopiedClient(true)
    setTimeout(() => setCopiedClient(false), 2000)
  }

  return (
    <Card className="bg-[#1E2530] border-gray-700 p-6">
      <Tabs defaultValue="default">
        <div className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-lg font-semibold text-white mb-2">Seu Link de Divulgação</h3>
            <p className="text-gray-400 text-sm mb-4">
              Compartilhe este link e ganhe comissões por cada novo usuário ou influencer que entrar através dele.
            </p>

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <div className="flex gap-2 mb-6">
              {isLoading ? (
                <Skeleton className="h-10 flex-1" />
              ) : (
                <>
                  <Input
                    value={referralLink}
                    readOnly
                    className="bg-gray-800 border-gray-700"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
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
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button className="h-24 bg-[#9FFF00]/20 hover:bg-[#9FFF00]/30 text-[#9FFF00]">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-xs text-center">Material Promocional<br/>para Usuários</span>
                </div>
              </Button>
              <Button className="h-24 bg-[#9FFF00]/20 hover:bg-[#9FFF00]/30 text-[#9FFF00]">
                <div className="flex flex-col items-center gap-2">
                  <Megaphone className="h-6 w-6" />
                  <span className="text-xs text-center">Material Promocional<br/>para Influencers</span>
                </div>
              </Button>
            </div>
          </motion.div>
        </div>
      </Tabs>
    </Card>
  )
} 