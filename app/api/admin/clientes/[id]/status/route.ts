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

    const token = authHeader.split(" ")[1];
    
    // Obter o body da requisição
    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "O campo is_active deve ser um booleano" },
        { status: 400 }
      );
    }

    // Validar o ID do usuário
    if (!params.id) {
      return NextResponse.json(
        { error: "ID do usuário não fornecido" },
        { status: 400 }
      );
    }

    console.log('Tentando atualizar usuário:', {
      userId: params.id,
      is_active
    });

    // Atualizar o status do usuário no Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ is_active })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return NextResponse.json(
        { error: "Erro ao atualizar status do usuário" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Usuário ${is_active ? "desbloqueado" : "bloqueado"} com sucesso`,
      user: data
    });

  } catch (error) {
    console.error("Erro ao atualizar status do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}