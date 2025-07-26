"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, Pause, Shuffle, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react"
import { useAudioPlayer } from "@/contexts/audio-player-context"
import { musicData } from "@/lib/music-data"
import { Slider } from "@/components/ui/slider" // Assuming Slider is available

export default function PlaylistUI() {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    playSpecificSong, // Agora aceita index
    shufflePlaylist,
    currentSongIndex,
    volume,
    setVolume,
  } = useAudioPlayer()

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {/* Playlist Header/Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden mb-6">
        <Image
          src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//ChatGPT%20Image%2018%20de%20jun.%20de%202025%2013_58_38.png"
          alt="Playlist Banner"
          layout="fill"
          objectFit="cover"
          className="brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#191F26] to-transparent flex items-end p-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">RaspePix Hits</h1>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="bg-[#1E2530] rounded-lg md:rounded-xl p-4 border border-gray-800 w-full mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            className="w-12 h-12 rounded-full bg-[#9FFF00] hover:bg-[#9FFF00]/80 text-[#191F26]"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={playPrevious} className="text-gray-300 hover:text-white">
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={playNext} className="text-gray-300 hover:text-white">
            <SkipForward className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={shufflePlaylist} className="text-gray-300 hover:text-white">
            <Shuffle className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto md:max-w-[200px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
            className="text-gray-300 hover:text-white"
          >
            {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(val) => setVolume(val[0] / 100)}
            className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-gray-600 [&>span:first-child>span]:bg-[#9FFF00] [&>span:first-child>span]:h-1 [&>span:first-child>span]:w-3 [&>span:first-child>span]:rounded-full"
          />
        </div>
      </div>

      {/* Song List */}
      <div className="bg-[#1E2530] rounded-lg md:rounded-xl p-4 border border-gray-800 w-full">
        <h2 className="text-white text-xl font-bold mb-4">Músicas</h2>
        <div className="space-y-2">
          {musicData.map((track, index) => (
            <div
              key={track.id}
              className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors duration-200 ${
                currentSong?.id === track.id ? "bg-[#9FFF00]/20 text-[#9FFF00]" : "hover:bg-[#191F26] text-gray-300"
              }`}
              onClick={() => playSpecificSong(index)} // Passando o index
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm ${currentSong?.id === track.id ? "text-[#9FFF00]" : "text-gray-500"}`}>
                  {index + 1}.
                </span>
                <div className="flex flex-col">
                  <span
                    className={`text-base font-medium ${currentSong?.id === track.id ? "text-[#9FFF00]" : "text-white"}`}
                  >
                    {track.title}
                  </span>
                  <span className="text-xs text-gray-400">RaspePix Music</span>
                </div>
              </div>
              {currentSong?.id === track.id && isPlaying && (
                <span className="text-[#9FFF00] text-sm animate-pulse">Tocando...</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
