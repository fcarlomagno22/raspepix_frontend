"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Mock Data para cidades, agora com a propriedade 'state'
const mockCities = [
  { name: "São Paulo", state: "SP", users: 12000, avgValue: 85.5 },
  { name: "Campinas", state: "SP", users: 3000, avgValue: 70.0 },
  { name: "Rio de Janeiro", state: "RJ", users: 7500, avgValue: 92.1 },
  { name: "Niterói", state: "RJ", users: 1500, avgValue: 60.0 },
  { name: "Belo Horizonte", state: "MG", users: 6000, avgValue: 78.2 },
  { name: "Uberlândia", state: "MG", users: 2000, avgValue: 55.0 },
  { name: "Salvador", state: "BA", users: 3000, avgValue: 70.0 },
  { name: "Feira de Santana", state: "BA", users: 800, avgValue: 45.0 },
  { name: "Porto Alegre", state: "RS", users: 4500, avgValue: 110.0 },
  { name: "Caxias do Sul", state: "RS", users: 1200, avgValue: 80.0 },
  { name: "Curitiba", state: "PR", users: 4000, avgValue: 95.0 },
  { name: "Londrina", state: "PR", users: 1000, avgValue: 75.0 },
  { name: "Florianópolis", state: "SC", users: 2500, avgValue: 90.0 },
  { name: "Joinville", state: "SC", users: 700, avgValue: 65.0 },
  { name: "Brasília", state: "DF", users: 2200, avgValue: 105.0 },
  { name: "Recife", state: "PE", users: 2500, avgValue: 88.0 },
  { name: "Olinda", state: "PE", users: 600, avgValue: 50.0 },
  { name: "Fortaleza", state: "CE", users: 2800, avgValue: 80.0 },
  { name: "Caucaia", state: "CE", users: 500, avgValue: 40.0 },
  { name: "Manaus", state: "AM", users: 1800, avgValue: 65.0 },
  { name: "Belém", state: "PA", users: 1500, avgValue: 70.0 },
  { name: "Vitória", state: "ES", users: 900, avgValue: 95.0 },
  { name: "Goiânia", state: "GO", users: 1800, avgValue: 82.0 },
  { name: "Campo Grande", state: "MS", users: 700, avgValue: 70.0 },
  { name: "Cuiabá", state: "MT", users: 600, avgValue: 68.0 },
  { name: "João Pessoa", state: "PB", users: 800, avgValue: 75.0 },
  { name: "Teresina", state: "PI", users: 500, avgValue: 60.0 },
  { name: "Natal", state: "RN", users: 900, avgValue: 80.0 },
  { name: "Porto Velho", state: "RO", users: 300, avgValue: 55.0 },
  { name: "Boa Vista", state: "RR", users: 200, avgValue: 50.0 },
  { name: "Palmas", state: "TO", users: 400, avgValue: 62.0 },
  { name: "Maceió", state: "AL", users: 700, avgValue: 70.0 },
  { name: "Aracaju", state: "SE", users: 600, avgValue: 65.0 },
  { name: "São Luís", state: "MA", users: 1000, avgValue: 72.0 },
  { name: "Rio Branco", state: "AC", users: 150, avgValue: 48.0 },
  { name: "Macapá", state: "AP", users: 250, avgValue: 58.0 },
]

interface TopCitiesTableProps {
  selectedStateUF: string | null
}

export default function TopCitiesTable({ selectedStateUF }: TopCitiesTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const filteredCities = selectedStateUF ? mockCities.filter((city) => city.state === selectedStateUF) : mockCities // Se nenhum estado selecionado, mostra todas

  // Ordenar as cidades filtradas por número de usuários
  const sortedFilteredCities = [...filteredCities].sort((a, b) => b.users - a.users)

  return (
    <section className="space-y-6 flex-1">
      {" "}
      {/* Adicionado flex-1 para ocupar espaço */}
      <h2 className="text-2xl font-bold text-white">Cidades com Mais Usuários</h2>
      <Card className="rounded-2xl bg-[#0D1117] border-[#9ffe00]/10 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {selectedStateUF ? `Top 5 Cidades em ${selectedStateUF}` : "Top 5 Cidades (Geral)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedFilteredCities.length === 0 ? (
            <p className="text-center text-gray-400 py-4">
              {selectedStateUF ? `Nenhuma cidade encontrada para ${selectedStateUF}.` : "Nenhuma cidade disponível."}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#9ffe00]/20">
                    <TableHead className="text-[#9ffe00]">Cidade</TableHead>
                    <TableHead className="text-[#9ffe00] text-right">Usuários</TableHead>
                    <TableHead className="text-[#9ffe00] text-right">Valor Médio/Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFilteredCities.slice(0, 5).map((city, index) => (
                    <TableRow key={index} className="border-[#9ffe00]/10">
                      <TableCell className="font-medium">{city.name}</TableCell>
                      <TableCell className="text-right">{city.users.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(city.avgValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sortedFilteredCities.length > 5 && (
                <div className="mt-4 text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#9ffe00] text-black hover:bg-[#7FFF00]/90 transition-colors">
                        Ver todas
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] bg-[#0D1117] border-[#9ffe00]/20 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Todas as Cidades {selectedStateUF ? `em ${selectedStateUF}` : ""}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-[#9ffe00]/20">
                              <TableHead className="text-[#9ffe00]">Cidade</TableHead>
                              <TableHead className="text-[#9ffe00] text-right">Usuários</TableHead>
                              <TableHead className="text-[#9ffe00] text-right">Valor Médio/Usuário</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedFilteredCities.map((city, index) => (
                              <TableRow key={index} className="border-[#9ffe00]/10">
                                <TableCell className="font-medium">{city.name}</TableCell>
                                <TableCell className="text-right">{city.users.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{formatCurrency(city.avgValue)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
