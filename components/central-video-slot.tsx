"use client"

import React from "react"

// Use React.memo para evitar re-renderizações desnecessárias deste componente
export const CentralVideoSlot = React.memo(() => {
  return (
    <video
      key="slot-background-video" // Adicionado para garantir que o elemento de vídeo não seja recriado
      loop
      autoPlay
      muted
      playsInline
      className="w-full h-full object-cover"
      preload="auto"
      onError={(e) => console.error("Video loading error:", e.currentTarget.error)}
    >
      <source
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fundo_tela_slot-5t0cCJwvtJ1NtV4o7eYcT3hDEWIwzs.mp4"
        type="video/mp4"
      />
      Your browser does not support the video tag.
    </video>
  )
})

CentralVideoSlot.displayName = "CentralVideoSlot"
