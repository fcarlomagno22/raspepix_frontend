"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { formatCPF, formatPhone, formatDate, removeMask } from "@/lib/form-utils"
import { api } from '@/services/api'
import Cookies from 'js-cookie'

export default function RegistrationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    cpf: '',
    phone: '',
    birthDate: '',
    password: '',
    referralCode: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    // Aplicar máscaras para visualização
    switch (name) {
      case 'cpf':
        formattedValue = formatCPF(value)
        break
      case 'phone':
        formattedValue = formatPhone(value)
        break
      case 'birthDate':
        formattedValue = formatDate(value)
        break
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Remover máscaras e formatar dados para o backend
      const cleanCpf = removeMask(formData.cpf)
      const cleanPhone = removeMask(formData.phone)
      
      // Converter data de DD/MM/AAAA para AAAA-MM-DD
      const [day, month, year] = formData.birthDate.split('/')
      const formattedDate = `${year}-${month}-${day}`

      const response = await api.post('/api/auth/register', {
        fullname: formData.fullname,
        email: formData.email,
        cpf: cleanCpf,
        phone: cleanPhone,
        birth_date: formattedDate,
        password: formData.password,
        referral_code: formData.referralCode || undefined
      })

      // Armazenar tokens
      const oneHour = new Date(new Date().getTime() + 60 * 60 * 1000)
      Cookies.set('access_token', response.data.access_token, { expires: oneHour })
      Cookies.set('refresh_token', response.data.refresh_token, { expires: oneHour })
      Cookies.set('user', JSON.stringify(response.data.user), { expires: oneHour })

      router.replace('/home')
    } catch (error: any) {
      console.error('Erro no registro:', error)
      setError(error.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-[#1a323a] bg-[#191F26] shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-white">Criar Conta</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Preencha seus dados para começar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname" className="text-gray-300">Nome Completo</Label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
              className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-gray-300">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              required
              maxLength={14}
              className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
              maxLength={15}
              className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-gray-300">Data de Nascimento</Label>
            <Input
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              placeholder="DD/MM/AAAA"
              required
              maxLength={10}
              className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white pr-10"
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

          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-gray-300">Código de Indicação (opcional)</Label>
            <Input
              id="referralCode"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Código de quem te indicou"
              className="bg-[#1a323a] border-[#1a323a] focus:border-[#9ffe00] focus:ring-[#9ffe00] text-white"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#9ffe00] hover:bg-[#9ffe00]/90 text-[#191F26] font-medium"
          >
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-400 text-center w-full">
          Já tem uma conta?{" "}
          <Button
            variant="link"
            className="p-0 text-[#9ffe00] hover:text-[#9ffe00]/80"
            onClick={() => router.push("/login")}
          >
            Entrar
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}
