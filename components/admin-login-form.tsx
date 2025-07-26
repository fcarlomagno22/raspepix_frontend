"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { api } from '@/services/api';
import Cookies from 'js-cookie';

export default function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      const response = await api.post('/api/admin/login', { email, password });
      
      // Armazenar token
      Cookies.set('admin_token', response.data.token);
      
      // Redirecionar para dashboard
      router.replace('/admin/dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-[#1a323a] bg-[#191F26] shadow-xl animate-fade-in relative pb-[180px] md:pb-12">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/raspepix-logo.png"
            alt="RaspePix Logo"
            width={180}
            height={45}
            className="animate-pulse-glow-golden"
            priority
          />
        </div>
        <CardTitle className="text-3xl font-bold text-white">Painel Administrativo</CardTitle>
        <CardDescription className="text-gray-400">Entre com suas credenciais de administrador</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              E-mail Administrativo
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                placeholder="123@123.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                className="pl-10 h-12 bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-300">
                Senha
              </Label>
              <Button variant="link" className="px-0 font-normal text-xs text-[#9ffe00] hover:text-[#9ffe00]/80">
                Esqueceu a senha?
              </Button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                className="pl-10 pr-10 h-12 bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
              </Button>
            </div>
          </div>
          {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm text-center">{error}</p>}
          <Button
            type="submit"
            className="w-full h-12 bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-bold transition-all duration-300 shadow-glow-sm hover:shadow-glow relative flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <ShieldAlert className="h-5 w-5" />
                Entrar
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 mt-4">
        <Link href="/login" passHref>
          <Button variant="link" className="p-0 text-[#9ffe00] hover:text-[#9ffe00]/80 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para login de usuário
          </Button>
        </Link>
        <div className="text-center text-xs text-gray-500 flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#9FFF00]"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Conexão segura
          </div>
          <span>© 2023 RaspePix. Todos os direitos reservados.</span>
        </div>
      </CardFooter>
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
