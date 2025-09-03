import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verifica se o usuário é um influencer
    // TODO: Implementar a verificação real do status de influencer
    const isInfluencer = true // Substitua pela lógica real

    if (!isInfluencer) {
      return NextResponse.json(
        { error: 'Usuário não é um influencer' },
        { status: 403 }
      )
    }

    // Gera ou recupera o link de referência do usuário
    const referralLink = `https://raspepix.com/cadastro/${session.user.id}`

    return NextResponse.json({
      code: session.user.id,
      referralLink
    })
  } catch (error) {
    console.error('Erro ao gerar link de referência:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}