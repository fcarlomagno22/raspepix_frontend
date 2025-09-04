import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import Providers from "./providers"
import { AudioPlayerProvider } from "@/contexts/audio-player-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RaspePix",
  description: "RaspePix - Raspadinhas Online",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
            storageKey="raspepix-theme"
          >
            <AudioPlayerProvider>
              {children}
              <Toaster />
            </AudioPlayerProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
