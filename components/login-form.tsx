"use client"

import { Label } from "@/components/ui/label"

import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation" // Importar useRouter
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Eye, EyeOff } from "lucide-react"
import Cookies from 'js-cookie'

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null) // Estado para mensagens de erro
  const router = useRouter() // Inicializar useRouter

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null) // Limpar erros anteriores

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error('Dados inválidos. Verifique suas informações.');
          case 401:
            throw new Error('Email ou senha incorretos.');
          case 500:
            throw new Error('Erro no servidor. Tente novamente mais tarde.');
          default:
            throw new Error('Erro ao fazer login. Tente novamente.');
        }
      }

      const data = await response.json();
      
      // Define os cookies com expiração de 1 hora
      const oneHour = new Date(new Date().getTime() + 60 * 60 * 1000);
      Cookies.set('access_token', data.access_token, { expires: oneHour });
      Cookies.set('refresh_token', data.refresh_token, { expires: oneHour });
      Cookies.set('user', JSON.stringify(data.user), { expires: oneHour });

      // Redireciona para a página home usando replace em vez de push
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-[#1a323a] bg-[#191F26] shadow-xl animate-fade-in relative pb-[180px] md:pb-12">
      {" "}
      {/* Ajustado 'pb-[180px]' para mobile e 'md:pb-12' para desktop */}
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/raspepix-logo.png"
            alt="RaspePix Logo"
            width={200}
            height={60}
            className="animate-pulse-glow-golden" /* Aplicado o novo brilho dourado */
            priority
          />
        </div>
        <CardTitle className="text-2xl font-bold text-center text-white">Entrar</CardTitle>
        <CardDescription className="text-center text-gray-400">Manda ver no login e bora raspar!</CardDescription>
      </CardHeader>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ffe00]"></div>
          <p className="mt-4 text-white">Entrando...</p>
        </div>
      ) : (
        <>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    placeholder="nome@exemplo.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="pl-10 bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300">
                    Senha
                  </Label>
                  <Button
                    variant="link"
                    className="px-0 font-normal text-xs text-[#9ffe00] hover:text-[#9ffe00]/80"
                    onClick={() => router.push("/recuperarsenha")}
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    className="pl-10 pr-10 bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                  </Button>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium transition-all duration-300 shadow-glow-sm hover:shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-400">
              Não tem uma conta?{" "}
              <Button
                variant="link"
                className="p-0 text-[#9ffe00] hover:text-[#9ffe00]/80"
                onClick={() => router.push("/cadastro")}
              >
                Criar conta
              </Button>
            </div>
          </CardFooter>
        </>
      )}
      {/* Imagem do Ripo - Visível apenas em telas pequenas */}
      <Image
        src="/images/ripo_3x4.png"
        alt="Ripo character"
        width={180}
        height={180}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 md:hidden" // Oculta em telas maiores que md
        priority
      />
    </Card>
  )
}

export default LoginForm
