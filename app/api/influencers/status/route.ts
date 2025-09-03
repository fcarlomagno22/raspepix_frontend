import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
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

    console.log('Verificando status para usuário:', user.id)

    // Busca o registro do influencer
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    console.log('Resultado da busca:', JSON.stringify({ influencer, error: influencerError }, null, 2))

    if (influencerError) {
      if (influencerError.code === 'PGRST116') {
        // Nenhum registro encontrado
        return NextResponse.json(
          { error: 'Usuário não é influencer' },
          { status: 404 }
        )
      }
      throw influencerError
    }

    // Verifica se os termos foram aceitos
    if (!influencer.termos_aceitos_em) {
      return NextResponse.json(
        { error: 'Termos não aceitos' },
        { status: 404 }
      )
    }

    return NextResponse.json(influencer)
  } catch (error) {
    console.error('Erro ao verificar status de influencer:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}