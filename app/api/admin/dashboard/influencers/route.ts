import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // Log dos parâmetros recebidos
    console.log('Filtro de data:', { from, to })

    // Simular dados da API real
    // Em produção, aqui você conectaria com o banco de dados e usaria os parâmetros from e to
    const dashboardData = {
      total_influencers: 3,
      receita_total: "25514.13",
      total_comissoes: {
        pagas: "0.00",
        pendentes: "3825.18"
      },
      taxa_media_comissao: "15.00",
      valor_medio_deposito: "1159.73"
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
