"use client"

import { motion } from "framer-motion"
import Counter from "./counter" // Importa o novo componente Counter

export default function StatisticsSection() {
  const stats = [
    { value: "5M+", description: "Em prêmios que poderiam ter sido seus" },
    { value: "240K+", description: "Pessoas mais ricas que você (por enquanto)" },
    { value: "99.9%", description: "De chance de você se divertir (e talvez ganhar)" },
    { value: "24/7", description: "Horas para você raspar enquanto assiste Netflix" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Atraso sequencial para cada card
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }} // Ativa a animação quando 30% da seção está visível
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8" // Grid 2x2 no mobile, 1x4 no desktop
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border-2 border-primary flex flex-col items-center text-center shadow-lg hover:shadow-primary/30 transition-shadow duration-300"
            >
              <h3 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
                <Counter target={stat.value} />
              </h3>
              <p className="text-base md:text-lg text-gray-300">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
