"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Coins, CheckCircle, Heart } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    icon: CreditCard,
    title: "Compre suas chances para raspar e girar",
    description:
      "Adquira chances duplas: uma para a raspadinha e outra para o Gira‑Gira do Dom Ripo, gerando números de sorte para concorrer ao sorteio mensal.",
  },
  {
    icon: Coins,
    title: "Raspe e gire para prêmios instantâneos",
    description:
      "Descubra prêmios instantâneos na raspadinha e no Gira‑Gira do Dom Ripo a cada jogada.",
  },
  {
    icon: CheckCircle,
    title: "Concorra ao sorteio mensal",
    description:
      "Seus números de sorte entram automaticamente no grande sorteio mensal com prêmios incríveis.",
  },
  {
    icon: Heart,
    title: "Ganhe fazendo o bem",
    description:
      "Parte da receita é destinada a causas sociais — você concorre e ainda ajuda quem precisa!",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
}

export default function HowItWorksSection() {
  return (
    <section className="w-full py-12 md:py-20 lg:py-24 bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight"
            variants={itemVariants}
          >
            Como funciona? Chance em dobro!
          </motion.h2>
          <motion.p
            className="max-w-[700px] text-gray-300 md:text-lg"
            variants={itemVariants}
          >
            Ganhe na raspadinha e no Gira‑Gira do Dom Ripo – número de sorte para o sorteio mensal.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="flex flex-col items-center text-center p-6 bg-gray-800 border-2 border-primary shadow-lg h-full transition-transform duration-300 hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <div className="mb-4 flex justify-center">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                  <CardDescription className="text-gray-300 text-sm">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <Link href="/login" passHref>
            <Button className="w-full sm:w-auto bg-primary text-[#191F26] hover:bg-[#7cc200] transition-colors duration-300 text-lg px-8 py-6 rounded-full font-bold shadow-glow">
              Bora Raspar e Girar!
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}