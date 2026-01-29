

# Plano: Conexao Supabase + Sistema de Leads

## Resumo

Vamos conectar seu projeto Supabase 'blackboy' e criar um sistema completo de leads que armazena todos os formularios de contato no banco de dados, incluindo tracking de UTMs e origem.

---

## Etapa 1: Conectar Projeto Supabase

**Acao:** Usar o conector Supabase para vincular o projeto 'blackboy' ao Lovable.

Apos a conexao, serao gerados automaticamente:
- `src/integrations/supabase/client.ts` - Cliente Supabase configurado
- `src/integrations/supabase/types.ts` - Tipos TypeScript do banco
- Configuracoes de ambiente

---

## Etapa 2: Criar Tabela de Leads no Banco

**Migracao SQL** para criar a tabela `leads` com todos os campos do PRD:

```text
+--------------------+------------------------+
|  Campo             |  Tipo                  |
+--------------------+------------------------+
|  id                |  uuid (PK)             |
|  created_at        |  timestamp             |
|  name              |  text                  |
|  phone             |  text (mascara BR)     |
|  phone_e164        |  text (formato limpo)  |
|  email             |  text                  |
|  niche             |  text                  |
|  city              |  text (opcional)       |
|  message           |  text                  |
|  source            |  text (como conheceu)  |
|  source_page       |  text (URL origem)     |
|  utm_source        |  text (opcional)       |
|  utm_medium        |  text (opcional)       |
|  utm_campaign      |  text (opcional)       |
|  utm_content       |  text (opcional)       |
|  utm_term          |  text (opcional)       |
|  status            |  text (enum logico)    |
|  notes             |  text (admin)          |
|  consent           |  boolean               |
+--------------------+------------------------+
```

**Status possiveis:** `novo`, `em_contato`, `proposta_enviada`, `fechado`, `perdido`

---

## Etapa 3: Configurar RLS (Row Level Security)

Para o MVP publico, precisamos de:

1. **Politica INSERT publica** - Permitir que visitantes anonimos enviem leads
2. **Politica SELECT/UPDATE restrita** - Apenas usuarios autenticados (admin) podem ler/editar

```text
Visitante (anonimo)  -->  INSERT apenas
Admin (autenticado)  -->  SELECT, UPDATE, DELETE
```

---

## Etapa 4: Atualizar Formulario de Contato

Modificar `src/pages/Contato.tsx` para:

1. **Importar cliente Supabase**
2. **Capturar UTMs da URL** automaticamente
3. **Salvar lead no banco** ao submeter
4. **Remover simulacao** (setTimeout atual)
5. **Tratar erros** de forma amigavel

**Fluxo de dados:**

```text
Usuario preenche form
       |
       v
Validacao frontend
       |
       v
Captura UTMs + URL origem
       |
       v
INSERT no Supabase
       |
       v
Tela de sucesso + WhatsApp
```

---

## Etapa 5: Criar Hook para Captura de UTMs

Novo arquivo `src/hooks/useUTMParams.ts`:
- Extrai parametros UTM da URL atual
- Armazena em estado/sessionStorage
- Retorna objeto pronto para salvar junto ao lead

---

## Etapa 6: Corrigir Warnings de Console

Os logs mostram warnings sobre `forwardRef` nos componentes:
- `ProcessoPreview`
- `CTASection`
- `SectionTitle`

Vamos ajustar esses componentes para usar `forwardRef` corretamente e eliminar os avisos.

---

## Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `src/integrations/supabase/client.ts` | Criado automaticamente |
| `src/integrations/supabase/types.ts` | Criado automaticamente |
| `supabase/migrations/001_create_leads.sql` | Criar tabela + RLS |
| `src/hooks/useUTMParams.ts` | Novo hook para UTMs |
| `src/pages/Contato.tsx` | Integrar com Supabase |
| `src/components/ui/SectionTitle.tsx` | Corrigir forwardRef |
| `src/components/home/ProcessoPreview.tsx` | Corrigir forwardRef |
| `src/components/home/CTASection.tsx` | Corrigir forwardRef |

---

## Secao Tecnica

### Migracao SQL Completa

```sql
-- Enum para status do lead
CREATE TYPE lead_status AS ENUM (
  'novo',
  'em_contato',
  'proposta_enviada',
  'fechado',
  'perdido'
);

-- Tabela de leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Dados do formulario
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_e164 TEXT,
  email TEXT NOT NULL,
  niche TEXT NOT NULL,
  city TEXT,
  message TEXT NOT NULL,
  source TEXT,
  
  -- Tracking
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  
  -- Admin
  status TEXT DEFAULT 'novo',
  notes TEXT,
  
  -- LGPD
  consent BOOLEAN DEFAULT false
);

-- Indices para buscas
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_niche ON public.leads(niche);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_email ON public.leads(email);

-- Habilitar RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Politica: Qualquer um pode inserir (formulario publico)
CREATE POLICY "Allow public inserts"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politica: Apenas autenticados podem ler
CREATE POLICY "Authenticated users can read"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Politica: Apenas autenticados podem atualizar
CREATE POLICY "Authenticated users can update"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (true);
```

### Codigo do Hook useUTMParams

```typescript
import { useMemo } from "react";

export function useUTMParams() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || null,
      utm_medium: params.get("utm_medium") || null,
      utm_campaign: params.get("utm_campaign") || null,
      utm_content: params.get("utm_content") || null,
      utm_term: params.get("utm_term") || null,
      source_page: window.location.pathname,
    };
  }, []);
}
```

### Integracao no Contato.tsx

```typescript
import { supabase } from "@/integrations/supabase/client";
import { useUTMParams } from "@/hooks/useUTMParams";

// Dentro do componente:
const utmParams = useUTMParams();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  setIsLoading(true);
  
  const phoneE164 = "+55" + formData.telefone.replace(/\D/g, "");
  
  const { error } = await supabase.from("leads").insert({
    name: formData.nome,
    phone: formData.telefone,
    phone_e164: phoneE164,
    email: formData.email,
    niche: formData.nicho,
    city: formData.cidade || null,
    message: formData.mensagem,
    source: formData.comoConheceu || null,
    consent: formData.consentimento,
    ...utmParams,
  });
  
  if (error) {
    toast({
      title: "Erro ao enviar",
      description: "Por favor, tente novamente.",
      variant: "destructive",
    });
  } else {
    setIsSubmitted(true);
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
  }
  
  setIsLoading(false);
};
```

---

## Proximos Passos Apos Aprovacao

1. Clique em **Aprovar** para iniciar a implementacao
2. Sera solicitada a conexao do projeto Supabase 'blackboy'
3. Apos conectar, criarei a tabela e farei a integracao do formulario
4. Voce podera testar enviando um lead pelo formulario

---

## Resultado Esperado

- Leads salvos no banco Supabase com todos os campos
- Captura automatica de UTMs para tracking de campanhas
- Formulario funcionando sem simulacao
- Base pronta para o modulo Admin (proxima fase)

