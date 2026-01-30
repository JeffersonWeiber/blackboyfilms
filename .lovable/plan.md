

## Plano: Atualizar Imagem do Hero + Webhook Server-Side

### 1. Trocar Imagem do Hero

**Acao**: Substituir a imagem de fundo da Home pela nova imagem fornecida.

| Item | Detalhes |
|------|----------|
| Imagem atual | `src/assets/hero-background.png` |
| Nova imagem | `user-uploads://Inicio_2.png` |
| Componente | `src/components/home/HeroSection.tsx` |

O arquivo sera copiado para `src/assets/hero-background.png`, substituindo o atual.

---

### 2. Problema do Webhook (Atual)

O envio atual e feito **client-side** com `mode: "no-cors"`:

```text
fetch(url, {
  method: "POST",
  mode: "no-cors",  // <-- PROBLEMA!
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});
```

**Consequencias do no-cors:**
- Browser ignora os headers personalizados
- `Content-Type` vira `text/plain`
- n8n recebe o payload como string dentro de `body`
- Impossivel enviar headers de autenticacao

---

### 3. Solucao: Edge Function como Proxy

Criar uma **Edge Function** no Supabase que:

1. Recebe os dados do lead do frontend
2. Busca a URL do webhook no banco
3. Faz o POST **server-to-server** com headers corretos
4. Retorna status de sucesso/erro

```text
Frontend -> Edge Function -> n8n/Zapier/Make
           (server-side)

Headers enviados pela Edge Function:
- Content-Type: application/json
- x-webhook-secret: <secret> (opcional, para seguranca)
```

---

### 4. Arquitetura Tecnica

#### 4.1 Edge Function: `webhook-proxy`

```text
supabase/functions/webhook-proxy/index.ts
```

**Funcionalidades:**
- Recebe: `{ event, data, previous_status? }`
- Busca config do banco (`site_settings.webhook_config`)
- Valida se webhook esta ativo e se o evento deve ser enviado
- Envia POST para a URL configurada com:
  - `Content-Type: application/json`
  - `x-webhook-secret` (se configurado)
- Retorna resposta do webhook

**Payload enviado para n8n:**
```json
{
  "event": "lead_created",
  "timestamp": "2026-01-30T12:00:00.000Z",
  "source": "blackboy_films",
  "data": {
    "id": "uuid",
    "name": "Nome Completo",
    "email": "email@exemplo.com",
    "phone": "(11) 99999-9999",
    "phone_e164": "+5511999999999",
    "niche": "casamento",
    "city": "Cascavel",
    "message": "Mensagem...",
    "status": "novo",
    "source_page": "/contato",
    "utm_source": "instagram",
    "consent": true,
    "created_at": "2026-01-30T12:00:00.000Z"
  }
}
```

#### 4.2 Atualizacao do Hook `useWebhook.ts`

Modificar para chamar a Edge Function ao inves de fazer fetch direto:

```text
// Antes (client-side, no-cors)
fetch(config.url, { mode: "no-cors", ... });

// Depois (via Edge Function)
supabase.functions.invoke("webhook-proxy", {
  body: { event, data, previous_status }
});
```

#### 4.3 Opcao de Secret para Seguranca

Adicionar campo opcional no Admin (`/admin/config`) para configurar um secret:

| Campo | Descricao |
|-------|-----------|
| `webhook_secret` | Token secreto enviado no header `x-webhook-secret` |

O n8n pode validar este header para garantir que a requisicao veio do seu servidor.

---

### 5. Configuracao do Supabase

Atualizar `supabase/config.toml`:

```toml
[functions.webhook-proxy]
verify_jwt = false
```

O JWT nao sera verificado para permitir chamadas publicas (o formulario de contato e publico).

---

### 6. Atualizacao da Pagina Admin/Config

Adicionar campo para o webhook secret:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `webhook_secret` | Input (senha) | Token para validacao no n8n |

---

### 7. Teste no Admin

Atualizar o botao "Testar Webhook" para usar a Edge Function tambem, garantindo que o teste simule o fluxo real.

---

### 8. Resumo dos Arquivos

| Arquivo | Acao |
|---------|------|
| `src/assets/hero-background.png` | Substituir pela nova imagem |
| `supabase/functions/webhook-proxy/index.ts` | Criar (Edge Function) |
| `supabase/config.toml` | Adicionar config da function |
| `src/hooks/useWebhook.ts` | Modificar para usar Edge Function |
| `src/pages/admin/Config.tsx` | Adicionar campo de secret |

---

### 9. Fluxo Apos Implementacao

```text
1. Lead envia formulario
2. Contato.tsx salva no banco + chama triggerWebhook()
3. useWebhook.ts chama Edge Function webhook-proxy
4. Edge Function busca config no banco
5. Edge Function faz POST server-side para n8n
6. n8n recebe JSON parseado corretamente:
   - Content-Type: application/json
   - Campos acessiveis: data.name, data.phone, etc.
```

---

### 10. Resultado Esperado no n8n

**Antes (problema):**
```json
{
  "body": "{\"event\":\"lead_created\",\"data\":{...}}"
}
```

**Depois (correto):**
```json
{
  "event": "lead_created",
  "timestamp": "2026-01-30T12:00:00.000Z",
  "source": "blackboy_films",
  "data": {
    "name": "Nome Completo",
    "phone": "(11) 99999-9999",
    "email": "email@exemplo.com",
    ...
  }
}
```

