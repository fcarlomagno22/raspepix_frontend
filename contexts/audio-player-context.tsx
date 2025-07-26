"use client"

import type React from "react"
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation" // Importar usePathname
import { musicData, type MusicTrack } from "@/lib/music-data"

interface AudioPlayerContextType {
  currentSong: MusicTrack | null
  isPlaying: boolean
  togglePlayPause: () => void
  playNext: () => void
  playPrevious: () => void
  playSpecificSong: (index: number) => void
  shufflePlaylist: () => void
  currentSongIndex: number | null
  volume: number
  setVolume: (volume: number) => void
  playRandomSong: () => void
  audioRef: React.RefObject<HTMLAudioElement>
  currentTime: number
  duration: number
  seekTo: (time: number) => void
  pauseSong: () => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasQueuedNext = useRef(false)
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [shuffledPlaylist, setShuffledPlaylist] = useState<MusicTrack[]>([])
  const [volume, setVolumeState] = useState(0.5)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const pathname = usePathname() // Usar o hook usePathname

  const playNext = useCallback(() => {
    if (!audioRef.current || shuffledPlaylist.length === 0) return
    const nextIndex =
      currentSongIndex === null || currentSongIndex >= shuffledPlaylist.length - 1 ? 0 : currentSongIndex + 1
    setCurrentSongIndex(nextIndex)
    const nextSong = shuffledPlaylist[nextIndex]
    audioRef.current.src = nextSong.url
    audioRef.current.load()
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn("Erro ao tocar próxima música:", err)
        setIsPlaying(false)
      })
  }, [currentSongIndex, shuffledPlaylist])

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
    }

    setShuffledPlaylist([...musicData])
    if (musicData.length > 0) {
      setCurrentSongIndex(0)
      audioRef.current.src = musicData[0].url
      audioRef.current.load()
    }
  }, [])

  // Novo useEffect para parar a música ao acessar /logout
  useEffect(() => {
    if (pathname === "/logout") {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0 // Zera o tempo de reprodução
        audioRef.current.src = "" // Limpa a fonte do áudio
        audioRef.current.load() // Força o carregamento de uma fonte vazia para parar completamente
        setIsPlaying(false)
        setCurrentTime(0) // Atualiza o estado para o display
        setDuration(0) // Limpa a duração para o display
        hasQueuedNext.current = false // Reseta a flag de próxima música
      }
    }
  }, [pathname]) // Dependência no pathname para reagir à mudança de rota

  useEffect(() => {
    const handleEnded = () => {
      playNext()
    }

    const handleTimeUpdate = () => {
      if (!audioRef.current) return
      const timeRemaining = audioRef.current.duration - audioRef.current.currentTime
      setCurrentTime(audioRef.current.currentTime)
      if (timeRemaining <= 2 && !hasQueuedNext.current) {
        hasQueuedNext.current = true
        playNext()
      }
    }

    const handleLoadedMetadata = () => {
      if (!audioRef.current) return
      setDuration(audioRef.current.duration)
      setCurrentTime(0)
      hasQueuedNext.current = false
    }

    audioRef.current?.addEventListener("ended", handleEnded)
    audioRef.current?.addEventListener("timeupdate", handleTimeUpdate)
    audioRef.current?.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      audioRef.current?.removeEventListener("ended", handleEnded)
      audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate)
      audioRef.current?.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [playNext])

  const playSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.warn("Playback was prevented:", error)
          setIsPlaying(false)
        })
    }
  }, [])

  const pauseSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0 // Resetar o tempo de reprodução para o início
      audioRef.current.src = "" // Limpar a fonte do áudio
      audioRef.current.load() // Carregar uma fonte vazia para parar completamente
      setIsPlaying(false)
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    isPlaying ? pauseSong() : playSong()
  }, [isPlaying, playSong, pauseSong])

  const playPrevious = useCallback(() => {
    if (!audioRef.current || shuffledPlaylist.length === 0) return
    const prevIndex =
      currentSongIndex === null || currentSongIndex === 0 ? shuffledPlaylist.length - 1 : currentSongIndex - 1
    setCurrentSongIndex(prevIndex)
    const prevSong = shuffledPlaylist[prevIndex]
    audioRef.current.src = prevSong.url
    audioRef.current.load()
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((error) => {
        console.warn("Erro ao tocar música anterior:", error)
        setIsPlaying(false)
      })
  }, [currentSongIndex, shuffledPlaylist])

  const playSpecificSong = useCallback(
    (index: number) => {
      if (!audioRef.current || !shuffledPlaylist.length || index < 0 || index >= shuffledPlaylist.length) {
        console.warn("Tentativa de tocar índice inválido:", index)
        return
      }

      const selectedSong = shuffledPlaylist[index]
      if (!selectedSong?.url) {
        console.warn("Música não encontrada ou sem URL:", selectedSong)
        return
      }

      audioRef.current.pause()
      audioRef.current.currentTime = 0
      hasQueuedNext.current = false

      // Sempre atualiza a fonte, mesmo se for a mesma música
      setCurrentSongIndex(index)
      audioRef.current.src = selectedSong.url
      audioRef.current.load()
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Erro ao tocar música selecionada:", err)
          setIsPlaying(false)
        })
    },
    [shuffledPlaylist],
  )

  const shufflePlaylist = useCallback(() => {
    const shuffled = [...musicData].sort(() => Math.random() - 0.5)
    setShuffledPlaylist(shuffled)
    if (shuffled.length > 0) {
      const current = audioRef.current?.src
      const newIndex = shuffled.findIndex((song) => song.url === current)
      setCurrentSongIndex(newIndex !== -1 ? newIndex : 0)
    }
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      setVolumeState(newVolume)
    }
  }, [])

  const playRandomSong = useCallback(() => {
    if (!audioRef.current || shuffledPlaylist.length === 0) return
    const randomIndex = Math.floor(Math.random() * shuffledPlaylist.length)
    const randomSong = shuffledPlaylist[randomIndex]
    setCurrentSongIndex(randomIndex)
    audioRef.current.src = randomSong.url
    audioRef.current.load()
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((error) => {
        console.warn("Erro ao tocar música aleatória:", error)
        setIsPlaying(false)
      })
  }, [shuffledPlaylist])

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }, [])

  const currentSong = currentSongIndex !== null ? shuffledPlaylist[currentSongIndex] : null

  const value = {
    currentSong,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    playSpecificSong,
    shufflePlaylist,
    currentSongIndex,
    volume,
    setVolume,
    playRandomSong,
    audioRef,
    currentTime,
    duration,
    seekTo,
    pauseSong,
  }

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>
}

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider")
  }
  return context
}
