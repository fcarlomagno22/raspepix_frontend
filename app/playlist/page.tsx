"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Shuffle, SkipBack, Play, Pause, SkipForward, Volume2, VolumeX, Search } from "lucide-react"
import { useAudioPlayer } from "@/contexts/audio-player-context"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { getMusicasPublicas } from "@/services/musica"
import { useDebounce } from "@/hooks/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"

// Função utilitária para formatar o tempo (segundos para MM:SS)
const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "00:00"
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

export default function PlaylistPage() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    playSpecificSong,
    shufflePlaylist,
    volume,
    setVolume,
    currentTime,
    duration,
    seekTo,
  } = useAudioPlayer()

  const { data: musicasResponse, isLoading, error } = useQuery({
    queryKey: ["musicas", page, debouncedSearch],
    queryFn: () => getMusicasPublicas({ page, titulo: debouncedSearch }),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const musicas = musicasResponse?.data || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (musicas.length > 0 && !currentSong) {
      shufflePlaylist();
    }
  }, [currentSong, shufflePlaylist, musicas]);

  if (!mounted) {
    return (
      <AuthenticatedLayout>
        <main className="flex-1 pb-24 md:pb-28 px-3 md:px-4 lg:px-8 max-w-full md:max-w-6xl mx-auto w-full">
          <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden mt-4 md:mt-6 mb-6 md:mb-8">
            <div className="w-full h-full bg-[#1E2530]" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg bg-[#1E2530]">
                <div className="h-6 w-6 bg-[#2E3540]" />
                <div className="ml-4 flex-grow">
                  <div className="h-5 w-48 mb-2 bg-[#2E3540]" />
                  <div className="h-4 w-32 bg-[#2E3540]" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <main className="flex-1 pb-24 md:pb-28 px-3 md:px-4 lg:px-8 max-w-full md:max-w-6xl mx-auto w-full">
        {/* Banner da Playlist */}
        <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden mt-4 md:mt-6 mb-6 md:mb-8">
          <Image
            src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//ChatGPT%20Image%2018%20de%20jun.%20de%202025%2013_58_38.png"
            alt="Playlist Banner"
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181f27] to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white text-2xl md:text-3xl font-bold z-10">RaspePix Hits</div>
        </div>

        {/* Barra de Busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar música..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1E2530] border-gray-700"
          />
        </div>

        {/* Barra de Progresso e Tempos */}
        <div className="flex items-center gap-3 w-full mb-6 md:mb-8">
          <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 0}
            step={1}
            onValueChange={(val) => seekTo(val[0])}
            className="flex-grow [&>span:first-child]:h-2 [&>span:first-child]:bg-[#2e2e2e] [&>span:first-child]:rounded-full [&>span:first-child>span]:bg-[#9FFF00] [&>span:first-child>span]:h-2"
            aria-label="Music progress"
          />
          <span className="text-sm text-gray-400">{formatTime(duration)}</span>
        </div>

        {/* Controles de Reprodução */}
        <div className="flex items-center justify-center gap-4 mb-6 md:mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-[#9FFF00] transition-colors"
            onClick={shufflePlaylist}
            aria-label="Shuffle playlist"
          >
            <Shuffle className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-[#9FFF00] transition-colors"
            onClick={playPrevious}
            aria-label="Play previous song"
          >
            <SkipBack className="h-8 w-8" />
          </Button>
          <Button
            className="bg-[#9FFF00] text-[#181f27] rounded-full p-3 hover:bg-[#7CCF00] transition-colors shadow-lg"
            size="icon"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-[#9FFF00] transition-colors"
            onClick={playNext}
            aria-label="Play next song"
          >
            <SkipForward className="h-8 w-8" />
          </Button>
          <div className="flex items-center gap-2 w-24">
            {volume === 0 ? (
              <VolumeX className="h-5 w-5 text-gray-400" />
            ) : (
              <Volume2 className="h-5 w-5 text-gray-400" />
            )}
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0] / 100)}
              className="w-full"
              aria-label="Volume control"
            />
          </div>
        </div>

        {/* Lista de Músicas */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg bg-[#1E2530]">
                <div className="h-6 w-6 bg-[#2E3540]" />
                <div className="ml-4 flex-grow">
                  <div className="h-5 w-48 mb-2 bg-[#2E3540]" />
                  <div className="h-4 w-32 bg-[#2E3540]" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              Erro ao carregar músicas. Por favor, tente novamente mais tarde.
            </div>
          ) : musicas.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              Nenhuma música encontrada.
            </div>
          ) : (
            musicas.map((musica, index) => (
              <motion.div
                key={`${musica.titulo}-${musica.artista}-${musica.criada_em}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSong?.titulo === musica.titulo ? "bg-[#9FFF00]/20 text-[#9FFF00]" : "hover:bg-[#1E2530]"
                }`}
                onClick={() => playSpecificSong(index)}
                aria-current={currentSong?.titulo === musica.titulo ? "true" : "false"}
              >
                <div className="flex-shrink-0 w-6 text-center text-sm font-mono">{index + 1}</div>
                <div className="ml-4 flex-grow">
                  <div className="font-medium text-base">{musica.titulo}</div>
                  <div className="text-sm text-gray-400">{musica.artista}</div>
                </div>
                {currentSong?.titulo === musica.titulo && (
                  <div className="ml-auto text-[#9FFF00]">
                    <Play className="h-4 w-4 animate-pulse" />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Paginação */}
        {musicasResponse && musicasResponse.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 text-sm text-gray-400">
              Página {page} de {musicasResponse.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(musicasResponse.totalPages, p + 1))}
              disabled={page === musicasResponse.totalPages || isLoading}
            >
              Próxima
            </Button>
          </div>
        )}
      </main>
    </AuthenticatedLayout>
  )
}
