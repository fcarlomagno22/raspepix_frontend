import { parse, isBefore, isAfter, subYears } from "date-fns"

// --- Masking Functions ---

export const maskCPF = (value: string) => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
}

export const maskCEP = (value: string) => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length <= 5) return cleaned
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
}

export const maskDate = (value: string) => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
}

export const maskPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length <= 2) return `(${cleaned}`
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

// --- Validation Functions ---

export const validateCPF = (cpf: string): boolean => {
  const cleanedCpf = cpf.replace(/\D/g, "")
  if (cleanedCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanedCpf)) {
    return false
  }

  let sum = 0
  let remainder

  for (let i = 1; i <= 9; i++) {
    sum += Number.parseInt(cleanedCpf.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cleanedCpf.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += Number.parseInt(cleanedCpf.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cleanedCpf.substring(10, 11))) return false

  return true
}

export const validateAge = (dobString: string): boolean => {
  if (!dobString || dobString.length !== 10) return false
  const dob = parse(dobString, "dd/MM/yyyy", new Date())
  if (isNaN(dob.getTime())) return false

  const today = new Date()
  const minDate = subYears(today, 100) // Max 100 years old
  const maxDate = subYears(today, 16) // Min 16 years old

  return isAfter(dob, minDate) && isBefore(dob, maxDate)
}

export const validatePassword = (password: string): boolean => {
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)
  return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
}

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validateFullName = (fullName: string): boolean => {
  if (!fullName || fullName.trim().length === 0) return false
  
  const trimmedName = fullName.trim()
  const nameParts = trimmedName.split(/\s+/)
  
  // Deve ter pelo menos 2 partes (nome + sobrenome)
  // Cada parte deve ter pelo menos 2 caracteres
  return nameParts.length >= 2 && nameParts.every(part => part.length >= 2)
}

// --- Stub de formatação de CPF ---
// Para manter compatibilidade com importações antigas.
export const formatCPF = (value: string) => maskCPF(value)
