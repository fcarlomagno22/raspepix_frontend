"use client"

import { useRef, useEffect, useState } from "react"
import { VolumeX, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  src: string
  isPlaying: boolean
  onVideoEnd: () => void
}

export default function WinnerVideoPlayer({ src, isPlaying, onVideoEnd }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        // Only play if the video is currently paused
        if (videoRef.current.paused) {
          videoRef.current.play().catch((e) => {
            // Catch and log the specific AbortError if it occurs due to rapid state changes
            if (e.name === "AbortError") {
              console.warn("Video play was aborted, likely due to rapid state change.")
            } else {
              console.error("Error playing video:", e)
            }
          })
        }
      } else {
        // Only pause if the video is currently playing
        if (!videoRef.current.paused) {
          videoRef.current.pause()
        }
      }
    }
  }, [isPlaying])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  return (
    <div
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={() => setShowControls(true)}
      onTouchEnd={() => setTimeout(() => setShowControls(false), 3000)}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        muted={isMuted}
        onEnded={onVideoEnd}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className={`absolute bottom-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white transition-opacity ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        <span className="sr-only">{isMuted ? "Desmutar" : "Mutar"}</span>
      </Button>
    </div>
  )
}
