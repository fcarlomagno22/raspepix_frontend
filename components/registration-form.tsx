"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EyeIcon, EyeOffIcon } from "lucide-react" // Import icons
import { useRouter } from "next/navigation"
import { useReferral } from "@/contexts/ReferralContext"
import {
  maskCPF,
  maskDate,
  maskPhone,
  validateCPF,
  validateAge,
  validatePassword,
  validateEmail,
  validateFullName,
} from "@/lib/form-utils"
import { cn } from "@/lib/utils" // Assuming cn is available for conditional class names
import { api } from '@/services/api';
import Cookies from 'js-cookie';
import { useDebounce } from '@/hooks/use-debounce';

interface FormData {
  cpf: string
  fullName: string
  socialName: string
  dob: string
  gender: string
  phone: string
  email: string
  cep: string // Keep for now, might be used in backend
  street: string // Keep for now
  number: string // Keep for now
  complement: string // Keep for now
  neighborhood: string // Keep for now
  city: string // Keep for now
  uf: string // Keep for now
  password: string
  confirmPassword: string
  termsAccepted: boolean
}

const initialFormData: FormData = {
  cpf: "",
  fullName: "",
  socialName: "",
  dob: "",
  gender: "",
  phone: "",
  email: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  uf: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
}

const statesOfBrazil = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
}

export default function RegistrationForm() {
  const router = useRouter()
  const { referralCode } = useReferral()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [showSocialNameInput, setShowSocialNameInput] = useState(false)
  const [isCepLoading, setIsCepLoading] = useState(false) // Keep for now, but won't be used
  const [direction, setDirection] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [ageValidation, setAgeValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });
  const [cpfValidation, setCpfValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });
  
  // Debounce para CPF, email e data de nascimento
  const debouncedCpf = useDebounce(formData.cpf, 500);
  const debouncedEmail = useDebounce(formData.email, 500);
  const debouncedDob = useDebounce(formData.dob, 500);

  // Validar CPF quando o valor debounced mudar
  useEffect(() => {
    if (debouncedCpf && debouncedCpf.length === 14) { // 14 caracteres com máscara
      const cleanedCpf = debouncedCpf.replace(/\D/g, '');
      if (validateCPF(cleanedCpf)) {
        setCpfValidation({ isValid: true, message: 'CPF válido' });
      } else {
        setCpfValidation({ isValid: false, message: 'CPF inválido' });
      }
    } else if (debouncedCpf && debouncedCpf.length > 0) {
      setCpfValidation({ isValid: false, message: 'CPF incompleto' });
    } else {
      setCpfValidation({ isValid: null, message: '' });
    }
  }, [debouncedCpf]);

  // Validar email quando o valor debounced mudar
  useEffect(() => {
    if (debouncedEmail && debouncedEmail.length > 0) {
      if (validateEmail(debouncedEmail)) {
        setEmailValidation({ isValid: true, message: 'E-mail válido' });
      } else {
        setEmailValidation({ isValid: false, message: 'E-mail inválido' });
      }
    } else {
      setEmailValidation({ isValid: null, message: '' });
    }
  }, [debouncedEmail]);

  // Validar idade quando a data de nascimento mudar
  useEffect(() => {
    if (debouncedDob && debouncedDob.length === 10) {
      const isValidAge = validateAge(debouncedDob);
      if (isValidAge) {
        setAgeValidation({ isValid: true, message: 'Idade válida' });
      } else {
        setAgeValidation({ isValid: false, message: 'Você deve ter entre 16 e 100 anos' });
      }
    } else if (debouncedDob && debouncedDob.length > 0) {
      setAgeValidation({ isValid: false, message: 'Data de nascimento inválida' });
    } else {
      setAgeValidation({ isValid: null, message: '' });
    }
  }, [debouncedDob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let maskedValue = value

    if (name === "cpf") {
      maskedValue = maskCPF(value)
      const cleanedCpf = maskedValue.replace(/\D/g, "")
      if (cleanedCpf.length === 11) {
        if (!validateCPF(cleanedCpf)) {
          setErrors((prev) => ({ ...prev, cpf: "CPF inválido." }))
        } else {
          setErrors((prev) => ({ ...prev, cpf: undefined }))
        }
      } else if (cleanedCpf.length > 0 && cleanedCpf.length < 11) {
        setErrors((prev) => ({ ...prev, cpf: "CPF incompleto." }))
      } else {
        setErrors((prev) => ({ ...prev, cpf: undefined }))
      }
    }
    if (name === "dob") maskedValue = maskDate(value)
    if (name === "phone") maskedValue = maskPhone(value)
    // Removed CEP masking as the field is no longer in the UI
    // if (name === "cep") maskedValue = maskCEP(value)

    setFormData((prev) => ({ ...prev, [name]: maskedValue }))
    // For other fields, clear error on change, but CPF has specific instant validation
    if (name !== "cpf") {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleCheckboxChange = (name: keyof FormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    if (name === "termsAccepted") {
      setErrors((prev) => ({ ...prev, termsAccepted: undefined }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    let isValid = true

    if (step === 1) {
      const cleanedCpf = formData.cpf.replace(/\D/g, "")
      if (!formData.cpf || !validateCPF(cleanedCpf)) {
        newErrors.cpf = "CPF inválido ou não preenchido."
        isValid = false
      }
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Nome completo é obrigatório."
        isValid = false
      } else if (!validateFullName(formData.fullName)) {
        newErrors.fullName = "Digite seu nome completo (nome e sobrenome)."
        isValid = false
      }
      if (!formData.dob || !validateAge(formData.dob)) {
        newErrors.dob = ageValidation.message || "Data de nascimento inválida. Você deve ter entre 16 e 100 anos."
        isValid = false
      }
      if (!formData.gender) {
        newErrors.gender = "Gênero é obrigatório."
        isValid = false
      }
      if (!formData.phone || formData.phone.replace(/\D/g, "").length !== 11) {
        newErrors.phone = "Celular inválido. Deve conter 11 dígitos."
        isValid = false
      }
      if (!formData.email || !validateEmail(formData.email)) {
        newErrors.email = "E-mail inválido."
        isValid = false
      }
    } else if (step === 2) {
      // This was previously step 3
      if (!formData.password || !validatePassword(formData.password)) {
        newErrors.password = "A senha deve ter 8+ caracteres, maiúscula, minúscula, número e caractere especial."
        isValid = false
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas não coincidem."
        isValid = false
      }
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = "Você deve aceitar os termos para continuar."
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setDirection(-1)
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Formatar os dados mantendo as máscaras visuais mas enviando no formato correto
      const [day, month, year] = formData.dob.split('/');
      const formattedDate = `${year}-${month}-${day}`;
      
      const data = {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove máscara do CPF
        phone: formData.phone.replace(/\D/g, ''), // Remove máscara do telefone
        birth_date: formattedDate,
        gender: formData.gender,
        social_name: formData.socialName || undefined,
        referral_code: referralCode || undefined,
        accepted_terms: formData.termsAccepted
      };

      await api.post('/api/auth/register', data);
      
      // Redirecionar para página de login com mensagem de sucesso
      router.replace('/login?registered=true');
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Usar a mensagem do erro diretamente (já tratada pelo interceptor)
      const errorMessage = error.message || 'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed CEP auto-fill effect as the address step is removed
  // useEffect(() => {
  //   const fetchCepData = async () => {
  //     const cleanedCep = formData.cep.replace(/\D/g, "")
  //     if (cleanedCep.length === 8) {
  //       setIsCepLoading(true)
  //       const addressData = await fetchAddressByCep(cleanedCep)
  //       if (addressData) {
  //         setFormData((prev) => ({
  //           ...prev,
  //           street: addressData.logradouro || "",
  //           neighborhood: addressData.bairro || "",
  //           city: addressData.localidade || "",
  //           uf: addressData.uf || "",
  //         }))
  //         setErrors((prev) => ({ ...prev, cep: undefined }))
  //       } else {
  //         setErrors((prev) => ({ ...prev, cep: "CEP não encontrado ou inválido." }))
  //       }
  //       setIsCepLoading(false)
  //     }
  //   }
  //   const timeoutId = setTimeout(fetchCepData, 500) // Debounce CEP input
  //   return () => clearTimeout(timeoutId)
  // }, [formData.cep])

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-6">Dados Pessoais</h2>
            <div>
              <Label htmlFor="cpf" className="text-white">
                CPF
              </Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className={cn(
                  "bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary",
                  errors.cpf && "border-red-500",
                  cpfValidation.isValid === true && formData.cpf && !errors.cpf && "border-green-500",
                  cpfValidation.isValid === false && formData.cpf && "border-red-500",
                )}
              />
              {errors.cpf && (
                <p className="text-red-500 text-sm mt-1" aria-live="polite">
                  {errors.cpf}
                </p>
              )}
              {cpfValidation.isValid === true && formData.cpf && !errors.cpf && (
                <p className="text-green-500 text-sm mt-1" aria-live="polite">
                  ✓ {cpfValidation.message}
                </p>
              )}
              {cpfValidation.isValid === false && formData.cpf && !errors.cpf && (
                <p className="text-red-500 text-sm mt-1" aria-live="polite">
                  {cpfValidation.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="fullName" className="text-white">
                Nome Completo
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Seu nome completo"
                className={cn(
                  "bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary",
                  errors.fullName && "border-red-500",
                )}
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="socialNameCheck"
                checked={showSocialNameInput}
                onCheckedChange={setShowSocialNameInput}
                className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:text-white"
              />
              <Label htmlFor="socialNameCheck" className="text-white">
                Informar meu nome social
              </Label>
            </div>
            {showSocialNameInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Label htmlFor="socialName" className="text-white">
                  Nome Social
                </Label>
                <Input
                  id="socialName"
                  name="socialName"
                  value={formData.socialName}
                  onChange={handleChange}
                  placeholder="Seu nome social"
                  className="bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary"
                />
              </motion.div>
            )}
            <div>
              <Label htmlFor="dob" className="text-white">
                Data de Nascimento
                {formData.dob && formData.dob.length === 10 && ageValidation.isValid === null && (
                  <span className="ml-2 text-yellow-400 text-sm">Verificando...</span>
                )}
              </Label>
              <Input
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className={cn(
                  "bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary",
                  errors.dob && "border-red-500",
                  ageValidation.isValid === true && formData.dob && !errors.dob && "border-green-500",
                  ageValidation.isValid === false && formData.dob && "border-red-500",
                )}
              />
              {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
              {ageValidation.isValid === true && formData.dob && !errors.dob && (
                <p className="text-green-500 text-sm mt-1" aria-live="polite">
                  ✓ {ageValidation.message}
                </p>
              )}
              {ageValidation.isValid === false && formData.dob && (
                <p className="text-red-500 text-sm mt-1" aria-live="polite">
                  {ageValidation.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="gender" className="text-white">
                Gênero
              </Label>
              <Select onValueChange={(value) => handleSelectChange("gender", value)} value={formData.gender}>
                <SelectTrigger
                  className={cn(
                    "w-full bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary",
                    errors.gender && "border-red-500",
                  )}
                >
                  <SelectValue placeholder="Selecione seu gênero" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
            <div>
              <Label htmlFor="phone" className="text-white">
                Celular
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(XX) XXXXX-XXXX"
                maxLength={15}
                className={cn(
                  "bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary",
                  errors.phone && "border-red-500",
                )}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="text-white">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu.email@example.com"
                className={cn(
                  "bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary",
                  errors.email && "border-red-500",
                  emailValidation.isValid === true && formData.email && !errors.email && "border-green-500",
                  emailValidation.isValid === false && formData.email && "border-red-500",
                )}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              {emailValidation.isValid === true && formData.email && !errors.email && (
                <p className="text-green-500 text-sm mt-1" aria-live="polite">
                  ✓ {emailValidation.message}
                </p>
              )}
              {emailValidation.isValid === false && formData.email && !errors.email && (
                <p className="text-red-500 text-sm mt-1" aria-live="polite">
                  {emailValidation.message}
                </p>
              )}
            </div>
          </motion.div>
        )
      // Removed case 2 (Address step)
      case 2: // This is now the Password step
        return (
          <motion.div
            key="step2"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-6">Senha</h2>
            <div className="relative">
              <Label htmlFor="password" className="text-white">
                Nova Senha
              </Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className={cn(
                  "bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary pr-10",
                  errors.password && "border-red-500",
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-7 h-8 w-8 p-0 text-gray-400 hover:bg-transparent hover:text-primary"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </Button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              <p className="text-gray-400 text-sm mt-1">
                8+ caracteres, maiúscula, minúscula, número e caractere especial.
              </p>
            </div>
            <div className="relative">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                className={cn(
                  "bg-gray-800 border-gray-700 text-white focus:ring-primary focus:border-primary pr-10",
                  errors.confirmPassword && "border-red-500",
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-7 h-8 w-8 p-0 text-gray-400 hover:bg-transparent hover:text-primary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </Button>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="termsAccepted"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => handleCheckboxChange("termsAccepted", checked as boolean)}
                className={cn(
                  "border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:text-white",
                  errors.termsAccepted && "border-red-500",
                )}
              />
              <Label htmlFor="termsAccepted" className="text-white text-sm cursor-pointer">
                Li e estou de acordo com o{" "}
                <a href="#" className="text-primary hover:underline">
                  Termo de Adesão
                </a>
                ,{" "}
                <a href="#" className="text-primary hover:underline">
                  Condições Gerais de Uso da Plataforma
                </a>{" "}
                e{" "}
                <a href="#" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
                .
              </Label>
            </div>
            {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>}
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      {/* Background blobs for visual flair */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-center mb-6">
          <img src="/images/raspepix-logo.png" alt="RaspePix Logo" className="h-8 animate-pulse-glow-golden" />
        </div>
        <h1 className="text-2xl font-extrabold text-white text-center mb-8 animate-text-glow">Cadastro</h1>

        <div className="mb-6 flex justify-center items-center">
          {" "}
          {/* Changed justify-between to justify-center */}
          {[1, 2].map(
            (
              stepNum,
              index, // Added index for conditional line rendering
            ) => (
              <React.Fragment key={stepNum}>
                <div className="flex flex-col items-center mx-2">
                  {" "}
                  {/* Added mx-2 for spacing */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                      currentStep === stepNum
                        ? "bg-primary text-[#1a323a] shadow-glow"
                        : "bg-gray-700 text-gray-400 border border-gray-600",
                    )}
                  >
                    {stepNum}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-sm",
                      currentStep === stepNum ? "text-primary font-semibold" : "text-gray-400",
                    )}
                  >
                    {stepNum === 1 && "Pessoal"}
                    {stepNum === 2 && "Senha"}
                  </span>
                </div>
                {index < 1 && ( // Only render line after step 1 (before step 2)
                  <div
                    className={cn(
                      "h-1 w-16 rounded-full transition-colors duration-300", // Fixed width for the line
                      currentStep > stepNum ? "bg-primary" : "bg-gray-700", // Line active if currentStep is past this step
                    )}
                  />
                )}
              </React.Fragment>
            ),
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait" initial={false}>
            {renderStep()}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handleBack}
                className="bg-gray-700 text-white hover:bg-gray-600 border border-gray-600"
              >
                Voltar
              </Button>
            )}
            {currentStep < 2 && ( // Changed from currentStep < 3
              <Button
                type="button"
                onClick={handleNext}
                className={cn(
                  "bg-primary text-[#1a323a] hover:bg-primary/90 shadow-glow-sm",
                  currentStep === 1 ? "ml-auto" : "",
                )}
              >
                Próximo
              </Button>
            )}
            {currentStep === 2 && ( // Changed from currentStep === 3
              <Button 
                type="submit" 
                className="bg-primary text-[#202937] hover:bg-primary/90 shadow-glow-sm ml-auto"
                disabled={isLoading}
              >
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            )}
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          )}
        </form>
      </div>
    </div>
  )
}
