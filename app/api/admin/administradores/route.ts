import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Verificar o token de autenticação
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    // Obter o body da requisição
    const body = await request.json();
    const { nome_completo, cpf, email, senha, funcao, permissoes_pagina } = body;

    // Validações básicas
    if (!nome_completo || !cpf || !email || !senha || !funcao || !permissoes_pagina) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissoes_pagina)) {
      return NextResponse.json(
        { error: "Permissões devem ser um array" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar email existente:', checkError);
      return NextResponse.json(
        { error: "Erro ao verificar dados do administrador" },
        { status: 500 }
      );
    }

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    // Verificar se o CPF já existe
    const { data: existingCpf, error: cpfCheckError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('cpf', cpf)
      .single();

    if (cpfCheckError && cpfCheckError.code !== 'PGRST116') {
      console.error('Erro ao verificar CPF existente:', cpfCheckError);
      return NextResponse.json(
        { error: "Erro ao verificar dados do administrador" },
        { status: 500 }
      );
    }

    if (existingCpf) {
      return NextResponse.json(
        { error: "CPF já cadastrado" },
        { status: 409 }
      );
    }

    // Inserir novo administrador
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        nome_completo,
        cpf,
        email,
        senha, // Em produção, deve ser hash da senha
        funcao,
        permissoes_pagina,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir administrador:', insertError);
      return NextResponse.json(
        { error: "Erro ao cadastrar administrador" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Administrador cadastrado com sucesso",
      data: {
        id: newAdmin.id,
        nome_completo: newAdmin.nome_completo,
        cpf: newAdmin.cpf,
        email: newAdmin.email,
        funcao: newAdmin.funcao,
        permissoes_pagina: newAdmin.permissoes_pagina,
        is_active: newAdmin.is_active,
        created_at: newAdmin.created_at
      }
    });

  } catch (error) {
    console.error('Erro interno do servidor:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
