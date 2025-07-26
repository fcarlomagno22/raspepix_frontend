import Header from "@/components/header"
import NavigationBar from "@/components/navigation-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const levels = [
  { name: "Quartzo", range: "R$ 0 a R$ 999", commission: "5%", color: "border-gray-700", icon: "🪨" },
  { name: "Ágata", range: "R$ 1.000 a R$ 4.999", commission: "6%", color: "border-gray-600", icon: "🪨" },
  { name: "Ametista", range: "R$ 5.000 a R$ 14.999", commission: "7%", color: "border-purple-700", icon: "💎" },
  { name: "Topázio", range: "R$ 15.000 a R$ 29.999", commission: "8%", color: "border-yellow-700", icon: "💎" },
  { name: "Citrino", range: "R$ 30.000 a R$ 59.999", commission: "9%", color: "border-amber-700", icon: "💎" },
  { name: "Turmalina", range: "R$ 60.000 a R$ 99.999", commission: "10%", color: "border-emerald-700", icon: "💎" },
  { name: "Esmeralda", range: "R$ 100.000 a R$ 199.999", commission: "11%", color: "border-green-700", icon: "💚" },
  { name: "Rubi", range: "R$ 200.000 a R$ 399.999", commission: "12%", color: "border-red-700", icon: "❤️" },
  { name: "Diamante", range: "R$ 400.000 a R$ 1.999.999", commission: "13%", color: "border-blue-700", icon: "✨" },
  { name: "Duplo Diamante", range: "R$ 2.000.000 ou mais", commission: "15%", color: "border-yellow-500", icon: "🌟" },
]

export default function CarreiraPage() {
  return (
    <div className="min-h-screen bg-[#191F26] text-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pb-20">
        {/* Seção "Como Funciona" */}
        <section className="mb-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#9FFF00] mb-6">Como funciona?</h2>
          <p className="text-base text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Cada vez que um indicado seu deposita, você ganha comissão. O sistema soma o total gerado nos últimos 12
            meses e define seu nível automaticamente. Quanto maior o seu nível, maior a comissão.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="flex items-center gap-3 bg-[#2A343D] p-4 rounded-lg shadow-md">
              <span className="text-[#9FFF00] text-2xl">✓</span>
              <p className="text-base text-gray-200">Comissões de 5% até 15%</p>
            </div>
            <div className="flex items-center gap-3 bg-[#2A343D] p-4 rounded-lg shadow-md">
              <span className="text-[#9FFF00] text-2xl">✓</span>
              <p className="text-base text-gray-200">10 níveis que demonstram sua preciosidade</p>
            </div>
            <div className="flex items-center gap-3 bg-[#2A343D] p-4 rounded-lg shadow-md">
              <span className="text-[#9FFF00] text-2xl">✓</span>
              <p className="text-base text-gray-200">Saques via Pix a partir de R$ 20</p>
            </div>
            <div className="flex items-center gap-3 bg-[#2A343D] p-4 rounded-lg shadow-md">
              <span className="text-[#9FFF00] text-2xl">✓</span>
              <p className="text-base text-gray-200">Tudo visível em tempo real no seu painel</p>
            </div>
          </div>
        </section>

        {/* Seção "Conheça os 10 Níveis" */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-[#9FFF00] mb-10 text-center">Conheça os 10 Níveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {levels.map((level, index) => (
              <Card
                key={index}
                className={`border-4 ${level.color} bg-[#2A343D] text-white shadow-xl rounded-xl overflow-hidden transform transition-transform hover:scale-105`}
              >
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-3">
                    <span className="text-4xl">{level.icon}</span> Nível {index + 1} – {level.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-3">
                  <p className="text-base">
                    <span className="font-semibold text-[#9FFF00]">💰 Faturamento:</span> {level.range}
                  </p>
                  <p className="text-base">
                    <span className="font-semibold text-[#9FFF00]">📈 Comissão:</span> {level.commission}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <NavigationBar />
    </div>
  )
}
