import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verifica se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Verifica se já existe um registro para este usuário
    const { data: existingInfluencer } = await supabase
      .from('influencers')
      .select('id, termos_aceitos_em')
      .eq('profile_id', user.id)
      .single()

    if (existingInfluencer?.termos_aceitos_em) {
      // Usuário já aceitou os termos
      return NextResponse.json(existingInfluencer)
    }

    // Gera um código único para o influencer (8 caracteres hexadecimais)
    const codigoInfluencer = Math.random().toString(16).substring(2, 10).toUpperCase()

    // Cria ou atualiza o registro do influencer
    const { data: influencer, error: insertError } = await supabase
      .from('influencers')
      .upsert({
        profile_id: user.id,
        codigo_influencer: codigoInfluencer,
        termos_aceitos_em: new Date().toISOString(),
        status: 'ativo'
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json(influencer)
  } catch (error) {
    console.error('Erro ao aceitar termos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}