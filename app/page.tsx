import LandingHeader from "@/components/landing-header"
import HeroSection from "@/components/hero-section"
import WeeklyLotterySection from "@/components/weekly-lottery-section"
import StatisticsSection from "@/components/statistics-section"
import HowItWorksSection from "@/components/how-it-works-section"
import LegalitySection from "@/components/legality-section"
import PrizesSection from "@/components/prizes-section"
import DomRipoComicsSection from "@/components/dom-ripo-comics-section"
import CtaSection from "@/components/cta-section"
import FooterSection from "@/components/footer-section" // Importa o novo rodapé

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#191F26]">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <WeeklyLotterySection />
        <StatisticsSection />
        <HowItWorksSection />
        <LegalitySection />
        <PrizesSection />
        <DomRipoComicsSection />
        <CtaSection />
      </main>
      <FooterSection /> {/* Adiciona o rodapé aqui, fora do <main> */}
    </div>
  )
}
