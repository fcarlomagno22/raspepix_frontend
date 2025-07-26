"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MailIcon } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

export default function PasswordRecoveryForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real application, you would send the email to your backend here
    // and handle success/failure based on the API response.
    console.log("Password recovery request for:", email)

    setMessage("Se o e-mail existir, mandamos o link. Se não, é fake seu mesmo 🤷‍♂️")
    setIsSubmitting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="w-full bg-[#1a323a] text-white border-none shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="flex flex-col items-center space-y-4 p-6">
          <Image
            src="/images/raspepix-recovery.png"
            alt="RaspePix Recovery"
            width={150} // Mantendo o tamanho diminuído
            height={150} // Mantendo o tamanho diminuído
            className="object-contain mx-auto" // Centraliza a imagem
          />
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Perdeu a senha, mas não a dignidade!
          </CardTitle>
          <p className="text-sm text-center text-gray-300">
            Relaxa, acontece. Digita teu e-mail aí que o pombo-correio da RaspePix vai te salvar.
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-300">
                E-mail
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-[#2a424a] border-gray-600 text-white focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-[#1a323a] font-semibold py-2 rounded-md hover:bg-primary/90 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Me salva, RaspePix!"}
            </Button>
          </form>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-center text-sm text-gray-300"
            >
              {message}
            </motion.p>
          )}
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <div className="text-center text-sm text-gray-400 w-full">
            <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
              Lembrei da senha! Juro!
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
