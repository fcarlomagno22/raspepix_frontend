export interface WinnerVideo {
  id: string
  videoUrl: string
  winnerName: string
  prizeAmount: number
  edition: string
  initialLikes: number
  comments: { id: string; author: string; text: string }[]
}

export const mockWinnerVideos: WinnerVideo[] = [
  {
    id: "1",
    videoUrl: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4",
    winnerName: "Ana C.",
    prizeAmount: 15000,
    edition: "Edição 5 - Maio/2024",
    initialLikes: 123,
    comments: [
      { id: "c1", author: "User1", text: "Parabéns, Ana! Que sorte!" },
      { id: "c2", author: "User2", text: "Incrível! Quero ser o próximo!" },
    ],
  },
  {
    id: "2",
    videoUrl: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//Banner%20para%20Mercado%20Shops%20Black%20Friday%20Simples%20Preto%20e%20Branco-2.mp4",
    winnerName: "João S.",
    prizeAmount: 50000,
    edition: "Edição 6 - Junho/2024",
    initialLikes: 250,
    comments: [
      { id: "c3", author: "User3", text: "Uau! Que prêmio!" },
      { id: "c4", author: "User4", text: "Merecido!" },
    ],
  },
  {
    id: "3",
    videoUrl: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4",
    winnerName: "Maria L.",
    prizeAmount: 5000,
    edition: "Edição 6 - Junho/2024",
    initialLikes: 80,
    comments: [{ id: "c5", author: "User5", text: "Que legal! Felicidades!" }],
  },
  {
    id: "4",
    videoUrl: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//new_Realiza!-4.mp4",
    winnerName: "Pedro M.",
    prizeAmount: 500,
    edition: "Edição 6 - Junho/2024",
    initialLikes: 50,
    comments: [{ id: "c6", author: "User6", text: "Parabéns!" }],
  },
  {
    id: "5",
    videoUrl: "https://wrivivjqxeulafrgdrsf.supabase.co/storage/v1/object/public/foto//Banner%20para%20Mercado%20Shops%20Black%20Friday%20Simples%20Preto%20e%20Branco-2.mp4",
    winnerName: "Fernanda G.",
    prizeAmount: 2500,
    edition: "Edição 4 - Abril/2024",
    initialLikes: 180,
    comments: [
      { id: "c7", author: "User7", text: "Show de bola!" },
      { id: "c8", author: "User8", text: "Que venham mais prêmios!" },
    ],
  },
]
