"use client"

import Image from "next/image"
import { useRouter } from "next/navigation" // Import useRouter

interface Winner {
  id: number | string;
  name?: string;
  winnerName?: string;
  prize?: string;
  prizeAmount?: number;
  video?: string;
  videoUrl?: string;
}

interface WinnerAvatarProps {
  winner: Winner
}

export default function WinnerAvatar({ winner }: WinnerAvatarProps) {
  const router = useRouter()

  // Normaliza os dados do ganhador
  const winnerName = winner.name || winner.winnerName || ""
  const winnerPrize = winner.prize || (winner.prizeAmount ? `R$ ${winner.prizeAmount}` : "")

  return (
    <div
      className="flex flex-col items-center text-center cursor-pointer group"
      onClick={() => router.push("/ganhadores")}
    >
      <div className="relative w-16 h-16 rounded-full border-2 border-[#9FFF00] overflow-hidden mb-2 flex items-center justify-center">
        <Image
          src={`/placeholder.svg?height=64&width=64&query=person portrait`}
          alt={winnerName}
          width={64}
          height={64}
          className="object-cover rounded-full"
        />
      </div>
      <p className="text-xs font-semibold text-white">{winnerName}</p>
      <p className="text-xs text-gray-300">{winnerPrize}</p>
    </div>
  )
}
