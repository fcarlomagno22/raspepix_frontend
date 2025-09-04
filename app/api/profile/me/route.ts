import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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

    // Busca os dados do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, cpf, phone, gender, birth_date, state_uf, city, is_active, created_at')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError)
      return NextResponse.json(
        { error: 'Erro ao buscar dados do usuário' },
        { status: 500 }
      )
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Busca o saldo da carteira de prêmios
    const { data: carteiraData, error: carteiraError } = await supabase
      .from('carteira_premios')
      .select('saldo_sacavel, chances_instantaneas')
      .eq('user_id', user.id)
      .single()

    // Busca se o usuário é influencer
    const { data: influencerData } = await supabase
      .from('influencers')
      .select('codigo_influencer, status')
      .eq('profile_id', user.id)
      .single()

    // Formata o CPF para exibição
    const formatCPF = (cpf: string) => {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }

    const profile = {
      id: userData.id,
      name: userData.full_name,
      email: userData.email,
      cpf: userData.cpf,
      phone: userData.phone,
      document: formatCPF(userData.cpf),
      affiliate_code: influencerData?.codigo_influencer || null,
      is_influencer: !!influencerData,
      status: userData.is_active ? 'active' : 'inactive',
      saldo_sacavel: carteiraData?.saldo_sacavel || 0,
      chances_instantaneas: carteiraData?.chances_instantaneas || 0,
      created_at: userData.created_at,
      last_login: userData.created_at, // Usando created_at como fallback para last_login
      profile_picture: null
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
