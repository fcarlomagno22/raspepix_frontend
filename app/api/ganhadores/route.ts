import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Buscar ganhadores da tabela
    const { data, error } = await supabase
      .from('ganhadores')
      .select('*')
      .order('data_premiacao', { ascending: false })

    if (error) {
      console.error('Erro ao buscar ganhadores:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar ganhadores' },
        { status: 500 }
      )
    }

    // Formatar os dados para o formato esperado pelo frontend
    const formattedData = data.map(winner => ({
      nome: winner.nome,
      cpf: winner.cpf,
      valor_premio: winner.valor_premio,
      numero_titulo: winner.numero_titulo,
      tipo: winner.tipo || 'sorteio',
      edicao: winner.edicao,
      data_premiacao: winner.data_premiacao,
      nome_raspadinha: winner.nome_raspadinha,
      numero_sorte: winner.numero_sorte
    }))

    return NextResponse.json({
      data: formattedData,
      total: formattedData.length
    })

  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}