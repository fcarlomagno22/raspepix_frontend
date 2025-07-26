"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, Scale, FileText, CheckCircle } from "lucide-react"

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
}

const highlightBoxVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10, delay: 0.6 } },
}

const sealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10, delay: 0.8 } },
}

export default function LegalitySection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2, // Ajuste conforme a necessidade para quando a animação deve começar
  })

  const legalPoints = [
    {
      icon: Shield,
      title: "Título de Capitalização",
      description: "100% legal, sem pegadinha e com direito a carteirinha! 😎",
    },
    {
      icon: Scale,
      title: "Fiscalizado e Regulamentado",
      description: "Temos fiscalização! Órgãos competentes ficam de olho em tudo pra você não ter dor de cabeça!",
    },
    {
      icon: FileText,
      title: "Prêmios Pré-Aprovados",
      description:
        "Os prêmios já estão 'carimbados' por órgãos reguladores. É como ter a receita aprovada pela vovó! 👵✅",
    },
    {
      icon: CheckCircle,
      title: "Pagamento Garantido",
      description: "Se você ganhar, a gente PAGA! Não é promessa de político, é lei mesmo! 💰⚖️",
    },
  ]

  return (
    <section
      ref={ref}
      className="relative py-12 md:py-16 bg-gray-950 text-white overflow-hidden" // py- ajustado
      style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="container mx-auto px-4 text-center max-w-6xl">
        {/* Header Section */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={cardVariants} className="mb-10">
          {" "}
          {/* mb- ajustado */}
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            {" "}
            {/* Font size ajustado */}
            Transparência e{" "}
            <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">Legalidade</span>
          </h2>
          <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
            {" "}
            {/* Font size ajustado */}
            Nosso modelo é baseado em <strong className="text-primary">Título de Capitalização</strong>, totalmente
            regulamentado e fiscalizado pela SUSEP. Aqui é tudo na transparência! 🔍
          </p>
        </motion.div>

        {/* Legal Points Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {" "}
          {/* gap- e mb- ajustados */}
          {legalPoints.map((point, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              transition={{ delay: index * 0.1 + 0.2 }} // Atraso sequencial
            >
              <Card className="bg-gray-800 border border-gray-700 p-5 flex flex-col items-center text-center h-full hover:border-primary transition-colors duration-300">
                {" "}
                {/* p- ajustado */}
                <div className="mb-3 text-primary">
                  {" "}
                  {/* mb- ajustado */}
                  <point.icon size={40} strokeWidth={1.5} /> {/* Icon size ajustado */}
                </div>
                <CardTitle className="text-xl font-bold mb-1 text-white">{point.title}</CardTitle>{" "}
                {/* Font size ajustado */}
                <CardDescription className="text-sm text-gray-300">{point.description}</CardDescription>{" "}
                {/* Font size ajustado */}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Highlight Box */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={highlightBoxVariants}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-primary p-7 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto mb-10 relative overflow-hidden" // p- e mb- ajustados
        >
          <h3 className="text-2xl font-bold mb-5 text-primary">100% Transparente</h3> {/* Font size ajustado */}
          <ul className="space-y-3 text-base md:text-lg text-center max-w-2xl mx-auto">
            {" "}
            {/* Font size e text-center ajustados */}
            <li>
              <span className="text-red-500 font-bold mr-2">❌</span> NÃO É BET
            </li>
            <li>
              <span className="text-red-500 font-bold mr-2">❌</span> NÃO É CASSINO
            </li>
            <li>
              <span className="text-red-500 font-bold mr-2">❌</span> NÃO É PEGADINHA
            </li>
            <li>
              <motion.span
                className="text-primary font-bold mr-2 inline-block"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                ✅
              </motion.span>
              <span className="inline-block align-middle animate-text-glow-primary">
                É CHANCE REAL DE GANHAR E AJUDAR
              </span>
            </li>
          </ul>
        </motion.div>

        {/* Regulation Seal */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={sealVariants}
          className="flex items-center justify-center gap-2 text-base md:text-lg font-semibold text-gray-200" // Font size e gap ajustados
        >
          <div className="relative flex items-center justify-center">
            <span className="relative flex h-2.5 w-2.5">
              {" "}
              {/* Size ajustado */}
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span> {/* Size ajustado */}
            </span>
          </div>
          Regulamentado no Brasil
        </motion.div>
      </div>
    </section>
  )
}
