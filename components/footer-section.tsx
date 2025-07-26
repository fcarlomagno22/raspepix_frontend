"use client"

import Image from "next/image"
import Link from "next/link"
import { Instagram, Shield, TwitterIcon as TikTok } from "lucide-react"

export default function FooterSection() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 px-4 md:px-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Logo e Redes Sociais */}
        <div className="flex flex-col items-center md:items-start">
          <Image src="/images/00 - Logo RaspePix.png" alt="RaspePix Logo" width={150} height={50} className="mb-4" />
          <div className="flex space-x-4">
            <Link href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
              <Instagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
              <TikTok className="h-6 w-6" />
              <span className="sr-only">TikTok</span>
            </Link>
          </div>
        </div>

        {/* Links de Suporte */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Suporte</h3>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Contato
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>

        {/* Texto Legal */}
        <div className="md:col-span-2 lg:col-span-2 text-sm text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-2">
            <Link
              href="/admin/login"
              className="flex items-center text-[#9ffe00] hover:text-[#9ffe00] transition-colors"
            >
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-medium">Regulamentado no Brasil</span>
            </Link>
            <span className="relative flex h-2 w-2 ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9ffe00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9ffe00]"></span>
            </span>
          </div>
          <p>
            Título de Capitalização da Modalidade Filantropia Premiável de Contribuição Única, emitido pela CAPEMISA
            Capitalização S/A, CNPJ 14.056.028/0001-55, aprovado pelo Processo SUSEP n.o 15414.XXXXXX/XXXX-XX. CONTATO
            LOCAL: [DDD] XXXX-XXXX. SAC 0800 940 1130. OUVIDORIA 0800 707 4936, de segunda a sexta-feira, das 8h às 17h.
            É proibida a venda de título de capitalização a menores de dezesseis anos. O valor não exigido dentro do
            prazo prescricional, estabelecido pela legislação em vigor, acarretará a perda desse direito. A aquisição
            deste título faculta ao adquirente a cessão de 100% do direito de resgate à [ENTIDADE BENEFICENTE],
            certificada nos termos da legislação em vigor. Antes de contratar consulte previamente as Condições Gerais.
            As condições contratuais/regulamento deste produto protocolizadas pela sociedade junto à SUSEP poderão ser
            consultadas no endereço eletrônico www.susep.gov.br, de acordo com o número de processo constante da
            proposta. Consulte as informações legais da Resolução CNSP 382/2020 em www.capemisa.com.br. Prêmios líquidos
            de imposto de renda. Confira o resultado dos sorteios e as condições de participação em
            www.sitedoproduto.com.br. Sorteio DD/MM/AAAA. Valor do Título de Capitalização R$ [...]. Imagens meramente
            ilustrativas.
          </p>
        </div>
      </div>
    </footer>
  )
}
