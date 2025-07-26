"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { WinnerVideo } from "@/lib/mock-winner-videos"

interface VideoOverlayProps {
  video: WinnerVideo
}

export default function WinnerVideoOverlay({ video }: VideoOverlayProps) {
  const [likes, setLikes] = useState(video.initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState(video.comments)
  const [copied, setCopied] = useState(false)

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1)
    } else {
      setLikes(likes + 1)
    }
    setIsLiked(!isLiked)
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: String(comments.length + 1), author: "Você", text: newComment.trim() }])
      setNewComment("")
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/ganhadores?video=${video.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Confira o ganhador do RaspePix: ${video.winnerName}`,
          text: `Ganhou ${formatCurrency(video.prizeAmount)} na ${video.edition}!`,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-end p-4 text-white bg-gradient-to-t from-black/70 via-transparent to-black/10">
      {/* Winner Info */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold drop-shadow-lg">{video.winnerName}</h2>
        <p className="text-xl font-semibold text-[#9FFF00] drop-shadow-lg">{formatCurrency(video.prizeAmount)}</p>
        <p className="text-sm text-gray-300 drop-shadow-lg">{video.edition}</p>
      </div>

      {/* Interactions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleLike} className="text-white hover:text-red-500">
            <Heart className={`h-7 w-7 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            <span className="ml-1 text-lg">{likes}</span>
            <span className="sr-only">Curtir</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <MessageCircle className="h-7 w-7" />
            <span className="ml-1 text-lg">{comments.length}</span>
            <span className="sr-only">Comentários</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} className="text-white">
            {copied ? <Check className="h-7 w-7 text-[#9FFF00]" /> : <Share2 className="h-7 w-7" />}
            <span className="sr-only">Compartilhar</span>
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mb-4">
        <ScrollArea className="h-24 w-full pr-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <p key={comment.id} className="text-sm mb-1">
                <span className="font-bold">{comment.author}:</span> {comment.text}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-400">Nenhum comentário ainda. Seja o primeiro!</p>
          )}
        </ScrollArea>
        <div className="flex mt-2">
          <Input
            type="text"
            placeholder="Adicionar um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-white/20 border-none text-white placeholder-gray-300 focus:ring-[#9FFF00] focus:ring-offset-0"
          />
          <Button onClick={handleAddComment} className="ml-2 bg-[#9FFF00] text-[#191F26] hover:bg-[#8ae600]">
            Enviar
          </Button>
        </div>
      </div>
    </div>
  )
}
