"use client"

import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"

export default function DomRipoStorySection() {
  const textRef = useRef(null)
  const imageRef = useRef(null)
  const isInViewText = useInView(textRef, { once: true, amount: 0.5 })
  const isInViewImage = useInView(imageRef, { once: true, amount: 0.5 })

  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  }

  return (
    <section className="relative py-16 md:py-24 bg-[#191F26] text-white overflow-hidden">
      {/* Brilho verde de fundo */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-1/2 flex items-center justify-center z-0">
        <div className="absolute w-[400px] h-[400px] bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      {/* Overlay de Grade */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        <motion.div
          ref={textRef}
          initial="hidden"
          animate={isInViewText ? "visible" : "hidden"}
          variants={textVariants}
          className="text-center lg:text-left lg:w-1/2"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-[#9ffe00] leading-tight">
            Conheça o Dom Ripo!
          </h2>
          
          <div className="text-gray-200 space-y-6 text-lg md:text-xl leading-relaxed">
            <p>
              Ele nasceu no coração da quebrada.
              Filho de dona Jacira e do saudoso Seu Ribamar, Ripo cresceu vendo a luta diária do povo pra botar comida na mesa e sorrir mesmo sem motivo.
              Mas ele tinha um sonho: mudar de vida sem deixar de ser quem era.
            </p>

            <p>
              Entre trancos e barrancos, vendendo bala no trem, fazendo bico de tudo quanto é coisa, ele aprendeu que sorte não é só questão de números… é insistência.
            </p>

            <p>
              E foi aí que veio a virada.
              Dom Ripo não ganhou na loteria.
              Ele criou a própria sorte — com a RaspePix.
            </p>

            <p>
              Hoje ele é mais que um símbolo de sucesso: é o representante oficial da galera que acredita, que batalha, que faz acontecer.
            </p>

            <p className="text-[#9ffe00] font-semibold italic">
              Porque se tem uma coisa que o Dom sabe, é que a sorte sorri pra quem não para de tentar.
            </p>
          </div>
        </motion.div>

        {/* Imagem do Dom Ripo */}
        <motion.div
          ref={imageRef}
          initial="hidden"
          animate={isInViewImage ? "visible" : "hidden"}
          variants={imageVariants}
          className="lg:w-1/2 flex justify-center items-center"
        >
          <div className="relative w-full max-w-2xl animate-float">
            <Image
              src="https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//raspepix_28.png"
              alt="Dom Ripo"
              width={800}
              height={800}
              className="w-full h-auto rounded-3xl border-4 border-[#9ffe00] shadow-video-glow"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}