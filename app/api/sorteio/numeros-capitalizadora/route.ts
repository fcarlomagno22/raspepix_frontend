import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Verificar o token de autenticação
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    // Obter parâmetros da query
    const searchParams = request.nextUrl.searchParams;
    const edicaoId = searchParams.get("edicao_id");
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "25");
    const search = searchParams.get("search");
    const status_pagamento = searchParams.get("status_pagamento");

    if (!edicaoId) {
      return NextResponse.json(
        { error: "edicao_id é obrigatório" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * per_page;

    // Construir query base
    let query = supabase
      .from('numeros_capitalizadora')
      .select(`
        id,
        numero,
        premiado,
        descricao_premio,
        utilizado,
        criado_em,
        atualizado_em,
        comprador_id,
        comprado_em,
        status_pagamento,
        edicao_sorteio_id,
        comprador_nome,
        comprador_cpf
      `, { count: 'exact' })
      .eq('edicao_sorteio_id', edicaoId);

    // Aplicar filtros
    if (search && search.trim() !== '') {
      query = query.or(`numero.ilike.%${search}%,comprador_nome.ilike.%${search}%,comprador_cpf.ilike.%${search}%`);
    }

    if (status_pagamento && status_pagamento !== 'todos') {
      query = query.eq('status_pagamento', status_pagamento.toUpperCase());
    }

    // Aplicar paginação
    query = query.range(offset, offset + per_page - 1);

    // Ordenar por número
    query = query.order('numero', { ascending: true });

    const { data: numbers, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar números da capitalizadora:', error);
      return NextResponse.json(
        { error: "Erro ao buscar números da capitalizadora" },
        { status: 500 }
      );
    }

    // Calcular total de páginas
    const totalPages = Math.ceil((count || 0) / per_page);

    return NextResponse.json({
      data: numbers || [],
      total: count || 0,
      page,
      per_page,
      total_pages: totalPages
    });

  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
