"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useReferral } from '@/contexts/ReferralContext'
import RegistrationForm from "@/components/registration-form"

export default function CadastroComReferralPage() {
  const { setReferralCode } = useReferral()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return

    // Extrai o código de referral da URL usando string manipulation
    const segments = pathname.split('/')
    const lastSegment = segments[segments.length - 1]

    if (lastSegment && lastSegment.startsWith('ref:')) {
      const code = lastSegment.substring(4) // Remove o prefixo 'ref:'
      setReferralCode(code)
    } else {
      // Se não tiver o prefixo correto, redireciona para a página de cadastro normal
      router.replace('/cadastro')
    }
  }, [pathname, setReferralCode, router])

  return <RegistrationForm />
}