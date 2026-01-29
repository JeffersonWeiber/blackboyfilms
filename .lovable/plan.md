
# Plano: Sistema de Autenticacao e Login Admin

## Resumo

Implementar sistema de autenticacao seguro para o painel administrativo, incluindo:
- Tabelas de banco para leads e controle de roles
- Pagina de login para admin
- Rotas protegidas para o painel
- RBAC (Role-Based Access Control) com admin/editor

---

## Arquitetura de Seguranca

```text
+------------------+     +------------------+     +------------------+
|   Visitante      |     |   Editor         |     |   Admin          |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
   [Site Publico]          [Ver Leads]            [Tudo + Config]
   [Enviar Form]           [Editar Conteudo]      [Tracking]
                                                  [Gerenciar Users]
```

---

## Etapa 1: Criar Estrutura do Banco de Dados

### 1.1 Tabela de Leads

Armazena todos os formularios de contato enviados:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | Chave primaria |
| created_at | timestamptz | Data/hora do envio |
| name | text | Nome completo |
| phone | text | Telefone com mascara |
| phone_e164 | text | Telefone formato internacional |
| email | text | E-mail |
| niche | text | Tipo de projeto |
| city | text | Cidade/Estado (opcional) |
| message | text | Mensagem |
| source | text | Como conheceu (opcional) |
| source_page | text | URL de origem |
| utm_source | text | UTM source |
| utm_medium | text | UTM medium |
| utm_campaign | text | UTM campaign |
| utm_content | text | UTM content |
| utm_term | text | UTM term |
| status | text | Status do lead (novo, em_contato, etc) |
| notes | text | Notas internas do admin |
| consent | boolean | Consentimento LGPD |

### 1.2 Tabela de Roles (Seguranca)

Seguindo as melhores praticas, roles ficam em tabela separada:

```text
+------------------+
|   user_roles     |
+------------------+
| id (uuid)        |
| user_id (uuid)   | --> auth.users
| role (app_role)  |
+------------------+
```

Enum `app_role`: `admin`, `editor`

### 1.3 Funcao Security Definer

Funcao `has_role()` para verificar roles sem recursao em RLS:

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;
```

---

## Etapa 2: Politicas RLS (Row Level Security)

### Tabela `leads`

| Operacao | Quem | Condicao |
|----------|------|----------|
| INSERT | anon, authenticated | Sempre permitido (formulario publico) |
| SELECT | authenticated | has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor') |
| UPDATE | authenticated | has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor') |
| DELETE | authenticated | has_role(auth.uid(), 'admin') |

### Tabela `user_roles`

| Operacao | Quem | Condicao |
|----------|------|----------|
| SELECT | authenticated | user_id = auth.uid() (ver proprio role) |
| INSERT/UPDATE/DELETE | authenticated | has_role(auth.uid(), 'admin') |

---

## Etapa 3: Pagina de Login Admin

### Rota: `/admin/login`

Componentes:
- Logo Blackboy Films
- Campo e-mail
- Campo senha
- Botao "Entrar"
- Tratamento de erros

Design: Mantendo a estetica cinematografica do site

### Fluxo de Autenticacao

```text
Usuario acessa /admin
       |
       v
Verifica sessao ativa?
       |
   +---+---+
   |       |
  Sim     Nao
   |       |
   v       v
Dashboard  Login
```

---

## Etapa 4: Hook de Autenticacao

Criar hook `useAuth` para gerenciar estado de autenticacao:

- Estado: user, session, role, loading
- Metodos: signIn, signOut
- Listener: onAuthStateChange
- Verificacao de role via funcao do banco

---

## Etapa 5: Rotas Protegidas

### Componente `ProtectedRoute`

Wrapper que verifica:
1. Usuario autenticado
2. Possui role necessario (admin ou editor)
3. Redireciona para login se falhar

### Estrutura de Rotas Admin

| Rota | Componente | Permissao |
|------|------------|-----------|
| /admin/login | AdminLogin | Publica |
| /admin | Dashboard | admin, editor |
| /admin/leads | LeadsList | admin, editor |
| /admin/leads/:id | LeadDetail | admin, editor |
| /admin/tracking | TrackingConfig | admin apenas |

---

## Etapa 6: Layout do Admin

Criar layout separado para o painel:
- Sidebar com navegacao
- Header com info do usuario
- Botao de logout
- Area de conteudo principal

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| Migration SQL | Criar leads, user_roles, funcoes, RLS |
| src/hooks/useAuth.ts | Hook de autenticacao |
| src/hooks/useUTMParams.ts | Captura UTMs da URL |
| src/components/auth/ProtectedRoute.tsx | Wrapper para rotas protegidas |
| src/pages/admin/Login.tsx | Pagina de login |
| src/pages/admin/Dashboard.tsx | Dashboard principal |
| src/pages/admin/LeadsList.tsx | Lista de leads |
| src/pages/admin/LeadDetail.tsx | Detalhe do lead |
| src/components/admin/AdminLayout.tsx | Layout do painel |
| src/components/admin/AdminSidebar.tsx | Sidebar navegacao |

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| src/App.tsx | Adicionar rotas /admin/* |
| src/pages/Contato.tsx | Integrar com Supabase para salvar leads |

---

## Secao Tecnica

### Migracao SQL Completa

```sql
-- 1. Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- 2. Tabela de leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_e164 TEXT,
  email TEXT NOT NULL,
  niche TEXT NOT NULL,
  city TEXT,
  message TEXT NOT NULL,
  source TEXT,
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  status TEXT DEFAULT 'novo',
  notes TEXT,
  consent BOOLEAN DEFAULT false
);

-- 3. Indices para performance
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_niche ON public.leads(niche);
CREATE INDEX idx_leads_status ON public.leads(status);

-- 4. Tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 5. Funcao security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Habilitar RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 7. Politicas para leads
CREATE POLICY "Allow public inserts on leads"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin and editor can view leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admin and editor can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Only admin can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. Politicas para user_roles
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### Hook useAuth

```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'editor' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => fetchUserRole(session.user.id), 0);
        } else {
          setRole(null);
        }
      }
    );

    // Depois verificar sessao existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    setRole(data?.role as AppRole ?? null);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, role, loading, signIn, signOut };
}
```

---

## Proximos Passos Apos Implementacao

1. Criar primeiro usuario admin diretamente no Supabase Auth
2. Inserir role admin na tabela user_roles via SQL
3. Testar login e acesso ao painel
4. Configurar URL de redirecionamento no Supabase Auth

---

## Nota Importante

Apos a implementacao, voce precisara:

1. **Criar usuario admin** no Supabase Dashboard:
   - Authentication > Users > Add User
   - Email: seu-email@exemplo.com
   - Senha: sua-senha-segura

2. **Atribuir role admin** via SQL Editor:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('UUID-DO-USUARIO', 'admin');
   ```

3. **Configurar redirect URLs** no Supabase:
   - Authentication > URL Configuration
   - Site URL: URL do seu app
   - Redirect URLs: URLs permitidas

