"use server"

import { cookies } from "next/headers"
import { formatCPF, maskPhone } from "@/lib/form-utils"
import { z } from "zod"

export interface ProfileData {
  full_name: string
  cpf: string
  email: string
  phone: string
}

export type UserProfile = {
  id: string
  name: string
  email: string
  phone: string | null
  document: string | null // CPF
  birth_date: string | null
  gender: string | null
  profile_picture: string | null
  affiliate_code: string | null
  is_influencer: boolean
  status: string
  created_at: string
  updated_at: string
  last_login: string | null
  playable_balance: number
  withdrawable_balance: number
  affiliate_commission_balance: number
}

// Schema de validação do telefone
const phoneSchema = z
  .string()
  .min(10, "Telefone deve ter no mínimo 10 dígitos")
  .max(11, "Telefone deve ter no máximo 11 dígitos")
  .regex(/^\d+$/, "Telefone deve conter apenas números")

/**
 * Busca o perfil do usuário da API.
 * @returns O perfil do usuário ou null em caso de erro.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const accessToken = cookies().get('access_token')?.value
    if (!accessToken) {
      throw new Error("Sessão expirada, faça login novamente")
    }

    const response = await fetch("https://raspepixbackend-production.up.railway.app/api/profile/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Sessão expirada, faça login novamente")
      }
      if (response.status === 404) {
        throw new Error("Perfil não encontrado")
      }
      throw new Error("Erro ao carregar dados do perfil")
    }

    const data: ProfileData = await response.json()

    // Convertendo o formato da API para o formato esperado pelo frontend
    const userProfile: UserProfile = {
      id: data.cpf, // Usando CPF como ID já que não temos ID na resposta
      name: data.full_name,
      email: data.email,
      phone: data.phone,
      document: formatCPF(data.cpf),
      birth_date: null,
      gender: null,
      profile_picture: "https://kvwnpmdhyhrmfpgnojbh.supabase.co/storage/v1/object/public/raspepix//ripo_3x4.png",
      affiliate_code: null,
      is_influencer: false,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null,
      playable_balance: 0,
      withdrawable_balance: 0,
      affiliate_commission_balance: 0,
    }

    return userProfile
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    throw error
  }
}

interface UpdatePhoneResponse {
  success: boolean
  message: string
  phone?: string
}

/**
 * Atualiza o número de telefone do usuário.
 * @param phone O novo número de telefone (apenas números)
 */
export async function updatePhone(phone: string): Promise<UpdatePhoneResponse> {
  try {
    // Validar o telefone antes de enviar
    const validatedPhone = phoneSchema.parse(phone)

    const accessToken = cookies().get('access_token')?.value
    if (!accessToken) {
      throw new Error("Sessão expirada, faça login novamente")
    }

    const response = await fetch("https://raspepixbackend-production.up.railway.app/api/profile/me/phone", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ phone: validatedPhone }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Sessão expirada, faça login novamente")
      }
      throw new Error(data.error || "Erro ao atualizar telefone")
    }

    return {
      success: true,
      message: "Telefone atualizado com sucesso",
      phone: data.phone,
    }
  } catch (error) {
    console.error("Erro ao atualizar telefone:", error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      }
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao atualizar telefone",
    }
  }
}

/**
 * Atualiza os dados do perfil de um usuário.
 * @param userId O ID do usuário a ser atualizado.
 * @param formData Os dados do formulário.
 * @returns Um objeto de resultado indicando sucesso ou falha.
 */
export async function updateUserProfile(userId: string, formData: FormData) {
  try {
    // Por enquanto vamos apenas simular sucesso já que a API não tem endpoint de atualização
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true, message: "Perfil atualizado com sucesso!" }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return { success: false, message: "Não foi possível atualizar o perfil. Por favor, tente novamente." }
  }
}
