"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDaysIcon, CheckCircleIcon } from "lucide-react"
import Link from "next/link"

export default function WeeklyLotterySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [particles, setParticles] = useState([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 25 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 8 + Math.random() * 12,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 3,
        opacity: 0.5 + Math.random() * 0.5,
      }))
    )
  }, [])

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
    hidden: { opacity: 0, x: -100, y: 50 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        mass: 0.8,
      },
    },
  }

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden flex items-center justify-center" // Reduzido py-
    >
      <div className="container px-4 md:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center max-w-7xl">
        {" "}
        {/* Reduzido gap- */}
        <motion.div
          className="flex flex-col gap-6 text-center md:text-left z-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {" "}
          {/* Reduzido gap- */}
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg"
            variants={itemVariants}
          >
            Não ganhou na raspadinha nem no Gira-Gira do Dom Ripo?{" "}
            <span className="text-yellow-400 inline-block animate-text-glow-yellow">Relaxa!</span>
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto md:mx-0"
            variants={itemVariants}
          >
            Toda semana sorteamos até <strong className="text-yellow-400 font-bold">R$ 20.000</strong> entre todos os
            participantes! Quanto mais você raspa, mais chances tem de levar essa grana toda! 🤑
          </motion.p>
          <div className="grid grid-cols-2 gap-6 mt-8">
            {" "}
            {/* Alterado para grid-cols-2 e reduzido mt- */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-700/40 border border-gray-600 backdrop-blur-sm text-white p-6 rounded-xl shadow-xl hover:scale-[1.02] transition-transform duration-300 ease-out">
                <CardContent className="flex flex-col items-center p-0 text-center">
                  <CalendarDaysIcon className="w-12 h-12 text-yellow-400 mb-4 drop-shadow-md" /> {/* Reduzido mb- */}
                  <h3 className="text-xl font-bold mb-1">Todo Sábado</h3> {/* Reduzido text- e mb- */}
                  <p className="text-base text-gray-300">Sorteio pela Loteria Federal</p> {/* Reduzido text- */}
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-700/40 border border-gray-600 backdrop-blur-sm text-white p-6 rounded-xl shadow-xl hover:scale-[1.02] transition-transform duration-300 ease-out">
                <CardContent className="flex flex-col items-center p-0 text-center">
                  <CheckCircleIcon className="w-12 h-12 text-yellow-400 mb-4 drop-shadow-md" /> {/* Reduzido mb- */}
                  <h3 className="text-xl font-bold mb-1">Automático</h3> {/* Reduzido text- e mb- */}
                  <p className="text-base text-gray-300">Só raspar e concorrer</p> {/* Reduzido text- */}
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <motion.div className="mt-8 flex justify-center md:justify-start" variants={itemVariants}>
            {" "}
            {/* Reduzido mt- */}
            <Link href="/login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-4 text-xl font-bold rounded-full shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/50">
                Quero Concorrer Agora!
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        <div className="relative flex items-center justify-center h-[450px] md:h-[550px] lg:h-[650px] w-full mt-[-40px] md:mt-0">
          {" "}
          {/* Reduzido h- e mt- */}
          <motion.img
            src="/images/moeda-2.png"
            alt="Moeda 3D Animada"
            className="absolute w-[500px] h-[500px] md:w-[650px] md:h-[650px] lg:w-[750px] lg:h-[750px] object-contain z-10
                       animate-coin-float animate-coin-rotate-y drop-shadow-2xl"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Falling money particles */}
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute bg-yellow-300 rounded-full opacity-0"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animation: `money-fall ${p.duration}s linear ${p.delay}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
