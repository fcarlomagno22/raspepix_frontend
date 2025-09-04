import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar o token de autenticação
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const sorteioId = params.id;

    // Buscar total de títulos pendentes
    const { count, error } = await supabase
      .from('numeros_capitalizadora')
      .select('*', { count: 'exact', head: true })
      .eq('edicao_sorteio_id', sorteioId)
      .eq('status_pagamento', 'PENDENTE');

    if (error) {
      console.error('Erro ao buscar total de títulos pendentes:', error);
      return NextResponse.json(
        { error: "Erro ao buscar total de títulos pendentes" },
        { status: 500 }
      );
    }

    return NextResponse.json(count || 0);

  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
