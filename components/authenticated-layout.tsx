"use client"

import type React from "react"
import Header from "@/components/header"
import NavigationBar from "@/components/navigation-bar"
import type { ReactNode } from "react"
// Removed: import GlobalAudioPlayer from '@/components/global-audio-player';

interface AuthenticatedLayoutProps {
  children: ReactNode
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#191F26]">
      <Header />
      <main className="flex-1 flex flex-col overflow-auto">
        {" "}
        {/* Removed pb-20 */}
        {children}
      </main>
      <NavigationBar />
      {/* Removed GlobalAudioPlayer */}
    </div>
  )
}

export default AuthenticatedLayout
