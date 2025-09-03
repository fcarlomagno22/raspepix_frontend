import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Pegar o token dos cookies
    const cookies = request.headers.get('cookie')
    if (!cookies) {
      return new NextResponse(JSON.stringify({ error: 'Token não fornecido' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Extrair o token do cookie
    const tokenMatch = cookies.match(/token=([^;]+)/)
    if (!tokenMatch) {
      return new NextResponse(JSON.stringify({ error: 'Token não encontrado nos cookies' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const token = tokenMatch[1]

    // Fazer a requisição para a API externa
    const response = await fetch('http://localhost:3000/api/influencers/listar', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar influencers')
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar influencers:', error)
    return new NextResponse(JSON.stringify({ error: 'Erro ao buscar influencers' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}