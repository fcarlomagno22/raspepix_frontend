"use client"

// REMOVED: import Header from "@/components/header"
// REMOVED: import NavigationBar from "@/components/navigation-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { formatDate } from "@/lib/utils" // Assuming formatDate is available here
import AuthenticatedLayout from "@/components/authenticated-layout" // ADDED

// Mock data for HQs - using the specified image for all
const hqs = [
  {
    id: "1",
    title: "Aventuras do Raspepix",
    description:
      "Junte-se ao Raspepix em sua primeira grande aventura para desvendar os mistérios do universo das raspadinhas.",
    edition: "Edição #1",
    publicationDate: "2023-01-15",
    coverImage: "/images/foto_hq.png", // Using the provided image
  },
  {
    id: "2",
    title: "O Segredo da Moeda Dourada",
    description:
      "Uma lenda antiga sobre uma moeda dourada que concede desejos. Raspepix e seus amigos embarcam em uma jornada perigosa para encontrá-la.",
    edition: "Edição #2",
    publicationDate: "2023-03-20",
    coverImage: "/images/foto_hq.png", // Using the provided image
  },
  {
    id: "3",
    title: "O Desafio Final",
    description:
      "O maior desafio de todos! Raspepix precisa usar toda a sua inteligência e sorte para superar o vilão e salvar o dia.",
    edition: "Edição #3",
    publicationDate: "2023-05-25",
    coverImage: "/images/foto_hq.png", // Using the provided image
  },
  {
    id: "4",
    title: "A Origem dos Prêmios",
    description: "Descubra como os grandes prêmios do Raspepix surgiram e qual o segredo por trás de tanta sorte.",
    edition: "Edição #4",
    publicationDate: "2023-07-10",
    coverImage: "/images/foto_hq.png", // Using the provided image
  },
  {
    id: "5",
    title: "O Tesouro Escondido",
    description:
      "Um mapa misterioso leva Raspepix a uma ilha desconhecida, cheia de armadilhas e um tesouro incalculável.",
    edition: "Edição #5",
    publicationDate: "2023-09-01",
    coverImage: "/images/foto_hq.png", // Using the provided image
  },
]

export default function Hqs() {
  return (
    <AuthenticatedLayout>
      {" "}
      {/* WRAPPED WITH AUTHENTICATED LAYOUT */}
      <main className="flex-1 pt-4 md:pt-6 pb-16 md:pb-20 px-3 md:px-4 lg:px-8 max-w-full md:max-w-6xl mx-auto w-full">
        {/* Título da página - Ajustado para ficar mais próximo do header e centralizado */}
        <h1 className="text-white text-xl md:text-2xl font-bold mb-6 text-center">Nossas HQs</h1>

        {hqs.length === 0 ? (
          <div className="bg-[#1E2530] rounded-lg p-6 text-center">
            <p className="text-gray-400 text-lg">Nenhuma HQ disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {hqs.map((hq, index) => (
              <motion.div
                key={hq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[#1E2530] border border-[#9FFF00]/10 text-white overflow-hidden h-full flex flex-col">
                  <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
                    <img
                      src={hq.coverImage || "/placeholder.svg"}
                      alt={`Capa da HQ: ${hq.title}`}
                      className="w-full h-full object-cover"
                      width={400}
                      height={256}
                    />
                  </div>
                  <CardHeader className="p-4 pb-2 flex-grow text-center">
                    <CardTitle className="text-lg font-semibold text-[#9FFF00]">{hq.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-gray-400 text-center">
                    <p className="mb-1">{hq.edition}</p>
                    <p>Publicado em: {formatDate(hq.publicationDate)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        {/* Spacer for navigation bar */}
        <div className="h-16 md:h-20" aria-hidden="true"></div>
      </main>
      {/* Navigation Bar is now provided by AuthenticatedLayout */}
    </AuthenticatedLayout>
  )
}
