import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(
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

    // Validar o ID da promoção
    if (!params.id) {
      return NextResponse.json(
        { error: "ID da promoção não fornecido" },
        { status: 400 }
      );
    }

    console.log('Tentando excluir promoção:', {
      promocaoId: params.id
    });

    // Excluir a promoção no Supabase
    const { error } = await supabase
      .from('promocoes')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Erro ao excluir promoção:', error);
      return NextResponse.json(
        { error: "Erro ao excluir promoção" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Promoção deletada com sucesso"
    });

  } catch (error) {
    console.error('Erro ao excluir promoção:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

