"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import WinnerVideoPlayer from "@/components/winner-video-player"
import WinnerVideoOverlay from "@/components/winner-video-overlay"
import { mockWinnerVideos, type WinnerVideo } from "@/lib/mock-winner-videos"
import { Button } from "@/components/ui/button"
import { ChevronDown, Loader2, X } from "lucide-react" // Import X icon

const VIDEOS_PER_LOAD = 3

export default function GanhadoresPage() {
  const [videos, setVideos] = useState<WinnerVideo[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const videoRefs = useRef<(HTMLDivElement | null)[]>([])
  const observer = useRef<IntersectionObserver | null>(null)
  const router = useRouter() // Initialize useRouter

  useEffect(() => {
    setVideos(mockWinnerVideos.slice(0, VIDEOS_PER_LOAD))
  }, [])

  const loadMoreVideos = useCallback(() => {
    if (loadingMore || videos.length >= mockWinnerVideos.length) return

    setLoadingMore(true)
    setTimeout(() => {
      const nextVideos = mockWinnerVideos.slice(videos.length, videos.length + VIDEOS_PER_LOAD)
      setVideos((prevVideos) => [...prevVideos, ...nextVideos])
      setLoadingMore(false)
    }, 1000)
  }, [loadingMore, videos.length])

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
            setCurrentVideoIndex(index)
          }
        })
      },
      {
        threshold: 0.75,
      },
    )

    videoRefs.current.forEach((ref) => {
      if (ref) observer.current?.observe(ref)
    })

    return () => {
      observer.current?.disconnect()
    }
  }, [videos])

  useEffect(() => {
    if (videoRefs.current[currentVideoIndex]) {
      videoRefs.current[currentVideoIndex]?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [currentVideoIndex])

  const handleVideoEnd = useCallback(() => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex((prevIndex) => prevIndex + 1)
    } else if (videos.length < mockWinnerVideos.length) {
      loadMoreVideos()
    }
  }, [currentVideoIndex, videos.length, loadMoreVideos, mockWinnerVideos.length])

  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex((prevIndex) => prevIndex + 1)
    } else if (videos.length < mockWinnerVideos.length) {
      loadMoreVideos()
    }
  }

  const handleClose = () => {
    router.push("/home")
  }

  return (
    <div className="relative flex flex-col h-screen w-full bg-black overflow-hidden">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white"
        aria-label="Fechar"
      >
        <X className="h-6 w-6" />
      </Button>

      <main className="flex-1 flex flex-col items-center justify-center w-full h-full overflow-y-scroll snap-y snap-mandatory">
        {videos.length === 0 && !loadingMore ? (
          <div className="text-white text-center">Carregando vídeos de ganhadores...</div>
        ) : (
          videos.map((video, index) => (
            <div
              key={video.id}
              ref={(el) => {
                videoRefs.current[index] = el
              }}
              data-index={index}
              className="relative w-full h-screen flex-shrink-0 snap-center"
            >
              <WinnerVideoPlayer
                src={video.videoUrl}
                isPlaying={index === currentVideoIndex}
                onVideoEnd={handleVideoEnd}
              />
              <WinnerVideoOverlay video={video} />
              {index === currentVideoIndex &&
                (index < videos.length - 1 || videos.length < mockWinnerVideos.length) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextVideo}
                    className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-black/50 hover:bg-black/70 text-white animate-bounce"
                  >
                    <ChevronDown className="h-8 w-8" />
                    <span className="sr-only">Próximo Ganhador</span>
                  </Button>
                )}
            </div>
          ))
        )}

        {loadingMore && (
          <div className="w-full h-24 flex items-center justify-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mr-2" /> Carregando mais vídeos...
          </div>
        )}

        {!loadingMore && videos.length === mockWinnerVideos.length && videos.length > 0 && (
          <div className="w-full h-24 flex items-center justify-center text-gray-400">
            Você viu todos os vídeos de ganhadores!
          </div>
        )}
      </main>
    </div>
  )
}
