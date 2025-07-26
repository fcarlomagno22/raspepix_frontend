"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Pause, Trash2, Upload, Music } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import AdminSidebar from "@/components/admin/admin-sidebar" // Import AdminSidebar
import AdminHeaderMobile from "@/components/admin/admin-header-mobile" // Import AdminHeaderMobile
import { useRouter } from "next/navigation" // Import useRouter for logout simulation

interface MusicTrack {
  id: string
  title: string
  artist: string
  url: string
  plays: number
}

// Initial mock data for the playlist
const initialMusicData: MusicTrack[] = [
  {
    id: "1",
    title: "Raspa que Vem",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/00%20-%20Raspa%20que%20Vem.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "2",
    title: "Som pro Povão",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/01%20-%20Som%20pro%20Povao.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "3",
    title: "Pura Emoção",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/02%20-%20Pura%20Emocao.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "4",
    title: "Vida de Patrão",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/03%20-%20Vida%20de%20Patrao.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "5",
    title: "Cai no Pix",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/04%20-%20Cai%20no%20Pix.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "6",
    title: "Iate na Marina",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/05%20-%20Iate%20na%20Marina.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "7",
    title: "Destino sou Eu",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/06%20-%20Destino%20sou%20Eu.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "8",
    title: "Flow Tranquilo",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/07%20-%20Flow%20Tranquilo.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "9",
    title: "L de Like",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/08%20-%20L%20de%20Like.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "10",
    title: "Que foda",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/09%20-%20Que%20foda.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "11",
    title: "Oportunidade Digital",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/10%20-%20Oportunidade%20Digital.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "12",
    title: "Fé na Vida",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/11%20-%20Fe%20na%20vida.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "13",
    title: "O Poderoso Chefão",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/11%20-%20O%20Poderoso%20Chefao.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "14",
    title: "Nem tudo tá Perdido",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/12%20-%20Nem%20tudo%20ta%20perdido.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "15",
    title: "Sem Trama",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/13%20-%20Sem%20Trama.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
  {
    id: "16",
    title: "Na Missão",
    artist: "Dom Ripo Band",
    url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/14%20-%20Na%20missao.mp3",
    plays: Math.floor(Math.random() * 1000),
  },
]

const SESSION_TIMEOUT_SECONDS = 3 * 60 // 3 minutes
const WARNING_THRESHOLD_SECONDS = 60 // 1 minute

export default function AdminPlaylistPage() {
  const router = useRouter()
  const [musicList, setMusicList] = useState<MusicTrack[]>(initialMusicData)
  const [newSongTitle, setNewSongTitle] = useState("")
  const [newSongArtist, setNewSongArtist] = useState("Dom Ripo Band") // Default artist
  const [currentPlayingSongId, setCurrentPlayingSongId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Session management states and refs
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)

  const resetSessionTimer = () => {
    setSessionTimeRemaining(SESSION_TIMEOUT_SECONDS)
    setShowSessionWarning(false)
  }

  const handleLogout = () => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    console.log("Admin logged out due to inactivity or explicit action.")
    router.push("/admin/login")
  }

  // Session Timer Effect
  useEffect(() => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)

    sessionTimerRef.current = setInterval(() => {
      setSessionTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          handleLogout()
          return 0
        }
        if (prevTime <= WARNING_THRESHOLD_SECONDS) {
          setShowSessionWarning(true)
        }
        return prevTime - 1
      })
    }, 1000)

    // Activity listeners to reset timer
    const activityEvents = ["mousemove", "keydown", "scroll", "touchstart"]
    activityEvents.forEach((event) => window.addEventListener(event, resetSessionTimer))

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
      activityEvents.forEach((event) => window.removeEventListener(event, resetSessionTimer))
    }
  }, [])

  useEffect(() => {
    // Cleanup function to pause audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  const handleAddSong = () => {
    if (newSongTitle.trim() === "") {
      alert("O nome da música não pode estar vazio.")
      return
    }

    const newSong: MusicTrack = {
      id: Date.now().toString(), // Simple unique ID
      title: newSongTitle.trim(),
      artist: newSongArtist.trim(),
      url: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix/musics/Album%20-%20No%20Inicio/04%20-%20Cai%20no%20Pix.mp3", // Placeholder URL
      plays: Math.floor(Math.random() * 1000),
    }

    setMusicList((prevList) => [...prevList, newSong])
    setNewSongTitle("")
    setNewSongArtist("Dom Ripo Band")
  }

  const handlePlayPause = (song: MusicTrack) => {
    if (!audioRef.current) return

    if (currentPlayingSongId === song.id) {
      // If the same song is playing, pause it
      audioRef.current.pause()
      setCurrentPlayingSongId(null)
    } else {
      // Play a new song
      if (audioRef.current.src !== song.url) {
        audioRef.current.src = song.url
        audioRef.current.load() // Load the new source
      }
      audioRef.current.play().catch((e) => console.error("Error playing audio:", e))
      setCurrentPlayingSongId(song.id)

      // Increment play count
      setMusicList((prevList) =>
        prevList.map((item) => (item.id === song.id ? { ...item, plays: item.plays + 1 } : item)),
      )
    }
  }

  const handleDeleteSong = (id: string) => {
    if (currentPlayingSongId === id && audioRef.current) {
      audioRef.current.pause()
      setCurrentPlayingSongId(null)
    }
    setMusicList((prevList) => prevList.filter((song) => song.id !== id))
  }

  return (
    <div className="flex min-h-screen bg-[#0D1117] text-white">
      {/* Mobile Header */}
      <AdminHeaderMobile
        onOpenSidebar={() => {
          /* This will be handled by SheetTrigger in AdminSidebar */
        }}
      />

      {/* Sidebar (Desktop fixed, Mobile overlay) */}
      <AdminSidebar sessionTimeRemaining={sessionTimeRemaining} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto pt-20 lg:pt-6 lg:ml-64">
        {/* Session Warning */}
        {showSessionWarning && (
          <div className="fixed top-0 left-0 right-0 bg-red-800/80 text-white text-center py-2 z-50 animate-pulse">
            Sua sessão irá expirar em {sessionTimeRemaining} segundos!
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Gerenciar Playlist</h1>
            <p className="text-muted-foreground">Adicione, ouça e gerencie as músicas da plataforma.</p>
          </div>
        </div>

        {/* Add New Music Form */}
        <Card className="bg-[#2A3B4D] border border-[#9FFF00]/20 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-white">Adicionar Nova Música</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="songName" className="block text-sm font-medium text-gray-300 mb-1">
                  Nome da Música
                </label>
                <Input
                  id="songName"
                  placeholder="Nome da Música"
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  className="bg-[#1A2430] border border-[#9FFF00]/30 text-white placeholder:text-gray-500 focus:ring-[#9FFF00] focus:border-[#9FFF00]"
                />
              </div>
              <div>
                <label htmlFor="artistName" className="block text-sm font-medium text-gray-300 mb-1">
                  Artista
                </label>
                <Input
                  id="artistName"
                  placeholder="Artista"
                  value={newSongArtist}
                  onChange={(e) => setNewSongArtist(e.target.value)}
                  className="bg-[#1A2430] border border-[#9FFF00]/30 text-white placeholder:text-gray-500 focus:ring-[#9FFF00] focus:border-[#9FFF00]"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent text-[#9FFF00] border-[#9FFF00] hover:bg-[#9FFF00]/10 hover:text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Simular Upload de Música
              </Button>
              <Button onClick={handleAddSong} className="flex-1 bg-[#9FFF00] text-[#1A2430] hover:bg-[#8AE600]">
                <Music className="h-4 w-4 mr-2" />
                Adicionar Música
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-[#9FFF00]/20" />

        {/* Music List Table */}
        <Card className="bg-[#2A3B4D] border border-[#9FFF00]/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-white">Músicas na Playlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1A2430] hover:bg-[#1A2430]">
                    <TableHead className="text-[#9FFF00] text-center">Nome da Música</TableHead>
                    <TableHead className="text-[#9FFF00] text-center">Artista</TableHead>
                    <TableHead className="text-[#9FFF00] text-center">Player</TableHead>
                    <TableHead className="text-[#9FFF00] text-center">Reproduções</TableHead>
                    <TableHead className="text-[#9FFF00] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {musicList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400 py-4">
                        Nenhuma música na playlist. Adicione uma!
                      </TableCell>
                    </TableRow>
                  ) : (
                    musicList.map((song) => (
                      <TableRow key={song.id} className="border-b border-[#9FFF00]/10 hover:bg-[#2A3B4D]/50">
                        <TableCell className="font-medium text-white text-center">{song.title}</TableCell>
                        <TableCell className="text-gray-300 text-center">{song.artist}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePlayPause(song)}
                            className={cn(
                              "text-[#9FFF00] hover:bg-[#9FFF00]/10",
                              currentPlayingSongId === song.id && "text-red-400 hover:text-red-300",
                            )}
                          >
                            {currentPlayingSongId === song.id ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5" />
                            )}
                            <span className="sr-only">
                              {currentPlayingSongId === song.id ? "Pause" : "Play"} {song.title}
                            </span>
                          </Button>
                        </TableCell>
                        <TableCell className="text-gray-300 text-center">{song.plays}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSong(song.id)}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Excluir {song.title}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Hidden audio element for playback control */}
      <audio ref={audioRef} onEnded={() => setCurrentPlayingSongId(null)} />
    </div>
  )
}
