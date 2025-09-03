"use client"

import { motion, AnimatePresence } from "framer-motion"
import { NetworkMember } from "@/types/network"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Users } from "lucide-react"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface NetworkTreeViewProps {
  member: NetworkMember
}

interface NetworkNodeProps {
  member: NetworkMember
  level: number
  isLast: boolean
}

function NetworkNode({ member, level, isLast }: NetworkNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = member.children && member.children.length > 0
  const isRoot = level === 0
  const isInfluencer = member.type === "influencer" && member.accepted_terms === true

  const formatDate = (dateString?: string) => {
    if (!dateString) return "20/05/2025"
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return "Data inválida"
    }
  }

  const formatName = (name: string) => {
    if (isRoot) return name // Mantém o nome completo para o usuário logado
    
    const nameParts = name.trim().split(" ")
    if (nameParts.length === 1) return nameParts[0]
    
    const firstName = nameParts[0]
    const lastName = nameParts[nameParts.length - 1]
    return `${firstName} ${lastName.charAt(0)}.`
  }

  return (
    <div className="relative">
      {/* Linha vertical */}
      {!isLast && (
        <div
          className="absolute left-6 top-12 bottom-0 w-px bg-gray-700"
          style={{ left: "1.5rem" }}
        />
      )}

      <div className="relative flex mb-4">
        {/* Linha horizontal */}
        {level > 0 && (
          <div
            className="absolute left-0 top-6 w-6 h-px bg-gray-700"
            style={{ left: "-1.5rem" }}
          />
        )}

        <Card className="flex-1 p-4 bg-[#1E2530] border-gray-700">
          <div className="flex items-start gap-4">
            {/* Botão Expandir/Colapsar */}
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
            )}

            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.photoUrl} alt={member.name} />
              <AvatarFallback>
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Informações do Membro */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${isRoot ? 'text-[#9FFF00]' : 'text-white'}`}>
                  {isRoot ? member.name : formatName(member.name)}
                </h4>
                {!isRoot && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    isInfluencer ? 'bg-[#9FFF00] text-[#191F26]' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {isInfluencer ? 'Influencer' : 'Usuário'}
                  </span>
                )}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total Gerado</p>
                  <p className="font-medium text-white">
                    {formatCurrency(member.totalEarnings)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Cadastro</p>
                  <p className="font-medium text-white">
                    {formatDate(member.joinedAt)}
                  </p>
                </div>
                {hasChildren && (
                  <div>
                    <p className="text-gray-400">Rede</p>
                    <div className="flex items-center gap-1 text-white">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">
                        {member.children?.length || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filhos */}
      <AnimatePresence>
        {isExpanded && member.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-12"
          >
            {member.children.map((child, index) => (
              <NetworkNode
                key={child.id}
                member={child}
                level={level + 1}
                isLast={index === member.children!.length - 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function NetworkTreeView({ member }: NetworkTreeViewProps) {
  return (
    <div className="p-4">
      <NetworkNode member={member} level={0} isLast={true} />
    </div>
  )
} 




