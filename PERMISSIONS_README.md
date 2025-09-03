# Sistema de Permissões de Administradores

Este documento descreve como funciona o sistema de permissões implementado para o painel administrativo.

## Visão Geral

O sistema de permissões permite controlar quais páginas e funcionalidades cada administrador pode acessar no painel administrativo. As permissões são baseadas em páginas específicas e são verificadas tanto no frontend (sidebar) quanto no backend (API).

## Estrutura de Permissões

### Tipos de Permissão

As permissões são definidas no tipo `PagePermission` em `types/admin.ts`:

```typescript
export type PagePermission =
  | "*"                    // Acesso total a todas as páginas
  | "dashboard"
  | "clientes"
  | "auditoria"
  | "portaldosorteado"
  | "integracao"
  | "influencers"
  | "afiliados"
  | "hq"
  | "configuracoes"
  | "financeiro"
  | "sorteio"
  | "marketing"
  | "playlist"
  | "notificacoes"
  | "suporte"
  | "logs_auditoria"
  | "raspadinhas"
```

**Nota**: A permissão `"*"` concede acesso total a todas as páginas do painel administrativo.

### Mapeamento de Páginas

Cada página do admin está mapeada para uma permissão específica:

- `/admin/dashboard` → `"dashboard"`
- `/admin/clientes` → `"clientes"`
- `/admin/financeiro` → `"financeiro"`
- `/admin/sorteios` → `"sorteio"`
- `/admin/portaldosorteado` → `"portaldosorteado"`
- `/admin/marketing` → `"marketing"`
- `/admin/hq` → `"hq"`
- `/admin/playlist` → `"playlist"`
- `/admin/notificacoes` → `"notificacoes"`
- `/admin/suporte` → `"suporte"`
- `/admin/integracao` → `"integracao"`
- `/admin/auditoria` → `"logs_auditoria"`
- `/admin/configuracoes` → `"configuracoes"`
- `/admin/afiliados` → `"afiliados"`
- `/admin/influencers` → `"influencers"`
- `/admin/raspadinhas` → `"raspadinhas"`

## Como Funciona

### 1. Cadastro de Administrador

Ao cadastrar um novo administrador, você especifica:
- **Nome completo**
- **CPF**
- **Email**
- **Senha**
- **Função** (Administrador, Gestão, Financeiro, Suporte)
- **Permissões de página** (array de strings)

### 2. API de Cadastro

A API `/admin/administradores` recebe o payload:

```json
{
  "nome_completo": "Nome do Administrador",
  "cpf": "12345678901",
  "email": "admin@exemplo.com",
  "senha": "senha123",
  "funcao": "Gerente",
  "permissoes_pagina": ["dashboard", "usuarios", "sorteios"]
}
```

### 3. Armazenamento de Permissões

As permissões são salvas no banco de dados e também armazenadas em cookies quando o administrador faz login.

### 4. Verificação de Permissões

#### Frontend (Sidebar)
- O sidebar verifica as permissões do administrador logado
- Apenas os itens de menu para os quais o administrador tem permissão são exibidos
- Se um administrador não tem permissão para nenhum item de um dropdown, o dropdown não é exibido

#### Backend (Páginas)
- Cada página pode ser protegida usando o componente `PermissionGuard`
- Se o administrador não tem permissão, é redirecionado para o dashboard

## Implementação

### Hook de Permissões

```typescript
import { useAdminPermissions } from "@/hooks/use-admin-permissions"

const { hasPermission, loading, permissions } = useAdminPermissions()

// Verificar se tem permissão para uma página específica
if (hasPermission("financeiro")) {
  // Mostrar conteúdo financeiro
}
```

### Componente de Proteção

```typescript
import { PermissionGuard } from "@/components/admin/permission-guard"

<PermissionGuard requiredPermission="financeiro">
  <div>
    {/* Conteúdo da página financeiro */}
  </div>
</PermissionGuard>
```

### Sidebar com Permissões

O sidebar automaticamente filtra os itens baseado nas permissões do administrador logado.

## Exemplo de Uso

### 1. Cadastrar um Administrador com Permissões Limitadas

```typescript
const adminData = {
  nome_completo: "João Silva",
  cpf: "12345678901",
  email: "joao@exemplo.com",
  senha: "senha123",
  funcao: "Suporte",
  permissoes_pagina: ["dashboard", "suporte", "notificacoes"]
}
```

### 2. Cadastrar um Administrador com Acesso Total

```typescript
const adminData = {
  nome_completo: "Admin Master",
  cpf: "98765432100",
  email: "admin@exemplo.com",
  senha: "senha123",
  funcao: "Administrador",
  permissoes_pagina: ["*"]  // Acesso total a todas as páginas
}
```

### 3. Proteger uma Página

```typescript
// app/admin/sorteios/page.tsx
export default function SorteiosPage() {
  return (
    <PermissionGuard requiredPermission="sorteio">
      <div>
        {/* Conteúdo da página de sorteios */}
      </div>
    </PermissionGuard>
  )
}
```

### 4. Verificar Permissões em Componentes

```typescript
const { hasPermission } = useAdminPermissions()

return (
  <div>
    {hasPermission("financeiro") && (
      <button>Ver Relatórios Financeiros</button>
    )}
  </div>
)
```

## Segurança

- As permissões são verificadas tanto no frontend quanto no backend
- O token de autenticação é validado em todas as requisições
- As permissões são armazenadas de forma segura em cookies
- O sistema redireciona automaticamente usuários sem permissão
- A permissão `"*"` concede acesso total a todas as páginas do painel admin

## Manutenção

Para adicionar uma nova permissão:

1. Adicione o novo tipo em `types/admin.ts`
2. Atualize o mapeamento no sidebar (`components/admin/admin-sidebar.tsx`)
3. Atualize o mapeamento no header mobile (`components/admin/admin-header-mobile.tsx`)
4. Adicione a nova permissão em `lib/admin-data.ts` (availablePages)
5. Use o `PermissionGuard` nas páginas que precisam da nova permissão
