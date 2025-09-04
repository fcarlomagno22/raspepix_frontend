import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PATCH(
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

    const tituloId = params.id;
    const body = await request.json();
    const { status_pagamento } = body;

    if (!status_pagamento || !['PAGO', 'PENDENTE'].includes(status_pagamento)) {
      return NextResponse.json(
        { error: "status_pagamento deve ser 'PAGO' ou 'PENDENTE'" },
        { status: 400 }
      );
    }

    // Atualizar o status de pagamento
    const { data, error } = await supabase
      .from('numeros_capitalizadora')
      .update({ 
        status_pagamento,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', tituloId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      return NextResponse.json(
        { error: "Erro ao atualizar status de pagamento" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Título não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Status de pagamento atualizado com sucesso",
      data
    });

  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
