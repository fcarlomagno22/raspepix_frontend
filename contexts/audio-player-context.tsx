"use client"

import type React from "react"
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import type { Musica } from "@/types/musica"

interface AudioPlayerContextType {
  currentSong: Musica | null
  isPlaying: boolean
  togglePlayPause: () => void
  playNext: () => void
  playPrevious: () => void
  playSpecificSong: (index: number) => void
  shufflePlaylist: (playlist?: Musica[]) => void
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
  const hasAutoplayed = useRef(false)
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playlist, setPlaylist] = useState<Musica[]>([])
  const [volume, setVolumeState] = useState(0.5)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const pathname = usePathname()

  const playNext = useCallback(() => {
    if (!audioRef.current || playlist.length === 0) return
    const nextIndex =
      currentSongIndex === null || currentSongIndex >= playlist.length - 1 ? 0 : currentSongIndex + 1
    setCurrentSongIndex(nextIndex)
    const nextSong = playlist[nextIndex]
    if (!nextSong?.url_arquivo) {
      console.warn("Música sem URL:", nextSong)
      return
    }
    audioRef.current.src = nextSong.url_arquivo
    audioRef.current.load()
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn("Erro ao tocar próxima música:", err)
        setIsPlaying(false)
      })
  }, [currentSongIndex, playlist])

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
      if (!hasAutoplayed.current) {
        hasAutoplayed.current = true;
        playRandomSong(); // dispara o play aproveitando a última interação (login)
      }
    }
  }, [volume])

  useEffect(() => {
    if (pathname === "/logout") {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.src = ""
        audioRef.current.load()
        setIsPlaying(false)
        setCurrentTime(0)
        setDuration(0)
        hasQueuedNext.current = false
      }
    }
  }, [pathname])

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
      audioRef.current.currentTime = 0
      audioRef.current.src = ""
      audioRef.current.load()
      setIsPlaying(false)
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    isPlaying ? pauseSong() : playSong()
  }, [isPlaying, playSong, pauseSong])

  const playPrevious = useCallback(() => {
    if (!audioRef.current || playlist.length === 0) return
    const prevIndex =
      currentSongIndex === null || currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1
    setCurrentSongIndex(prevIndex)
    const prevSong = playlist[prevIndex]
    if (!prevSong?.url_arquivo) {
      console.warn("Música sem URL:", prevSong)
      return
    }
    audioRef.current.src = prevSong.url_arquivo
    audioRef.current.load()
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((error) => {
        console.warn("Erro ao tocar música anterior:", error)
        setIsPlaying(false)
      })
  }, [currentSongIndex, playlist])

  const playSpecificSong = useCallback(
    (index: number) => {
      if (!audioRef.current || !playlist.length || index < 0 || index >= playlist.length) {
        console.warn("Tentativa de tocar índice inválido:", index)
        return
      }

      const selectedSong = playlist[index]
      if (!selectedSong?.url_arquivo) {
        console.warn("Música não encontrada ou sem URL:", selectedSong)
        return
      }

      audioRef.current.pause()
      audioRef.current.currentTime = 0
      hasQueuedNext.current = false

      setCurrentSongIndex(index)
      audioRef.current.src = selectedSong.url_arquivo
      audioRef.current.load()
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Erro ao tocar música selecionada:", err)
          setIsPlaying(false)
        })
    },
    [playlist],
  )

  const shufflePlaylist = useCallback((newPlaylist: Musica[] = []) => {
    if (newPlaylist.length > 0) {
      setPlaylist(newPlaylist)
    }
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      setVolumeState(newVolume)
    }
  }, [])

  const playRandomSong = useCallback(() => {
    if (isPlaying) {
      console.log("Já existe uma música tocando, ignorando playRandomSong");
      return;
    }

    if (!audioRef.current || playlist.length === 0) {
      console.warn("Não há músicas na playlist ou o audio não está pronto");
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * playlist.length)
    const randomSong = playlist[randomIndex]
    if (!randomSong?.url_arquivo) {
      console.warn("Música sem URL:", randomSong)
      return
    }
    
    console.log("Tentando tocar música:", randomSong.titulo);
    setCurrentSongIndex(randomIndex)
    audioRef.current.src = randomSong.url_arquivo
    audioRef.current.load()
    
    audioRef.current.volume = volume;
    audioRef.current.muted = false;
    
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Música começou a tocar:", randomSong.titulo);
          setIsPlaying(true);
        })
        .catch((error) => {
          console.warn("Erro ao tocar música aleatória:", error);
          setIsPlaying(false);
        });
    }
  }, [playlist, volume, isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }, [])

  const currentSong = currentSongIndex !== null ? playlist[currentSongIndex] : null

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
