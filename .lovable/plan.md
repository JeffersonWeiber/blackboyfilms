

## Plano: Pagina de Configuracao de Tracking

### 1. Visao Geral

Criar uma pagina completa no Admin para configurar os pixels de rastreamento (GA4, Meta Pixel, TikTok Pixel) de forma dinamica, sem necessidade de editar codigo. A configuracao sera salva no banco de dados e injetada automaticamente no site.

---

### 2. Estrutura da Pagina

A pagina `/admin/tracking` tera as seguintes secoes:

| Secao | Descricao |
|-------|-----------|
| Google Analytics 4 | ID de medicao, toggle ativar/desativar |
| Meta Pixel (Facebook) | ID do Pixel, toggle ativar/desativar |
| TikTok Pixel | ID do Pixel, toggle ativar/desativar |
| Configuracoes LGPD | Anonimizar IP, Modo de Consentimento |
| Eventos Customizados | Visualizacao dos eventos trackeados |

---

### 3. Pixels e Melhores Praticas

#### 3.1 Google Analytics 4 (GA4)

**Campos necessarios:**
- GA4 Measurement ID (ex: G-XXXXXXXXXX)
- Toggle: Ativar/Desativar
- Toggle: Debug Mode (para desenvolvimento)

**Eventos recomendados para trackear:**
- `page_view` - Automatico ao navegar
- `generate_lead` - Ao enviar formulario
- `click_whatsapp` - Clique no WhatsApp
- `view_content` - Visualizacao de portfolio/nicho

**Melhores praticas:**
- Usar Consent Mode V2 para LGPD
- Configurar eventos como `send_page_view: false` para SPAs
- Usar `transport_type: 'beacon'` para confiabilidade

#### 3.2 Meta Pixel (Facebook/Instagram)

**Campos necessarios:**
- Meta Pixel ID (ex: 1234567890123456)
- Toggle: Ativar/Desativar

**Eventos recomendados:**
- `PageView` - Todas as paginas
- `Lead` - Formulario enviado
- `ViewContent` - Ver pagina de nicho
- `Contact` - Clique no WhatsApp

**Melhores praticas:**
- Inicializar com `fbq('consent', 'revoke')` ate consentimento LGPD
- Usar `fbq('consent', 'grant')` apos aceite

#### 3.3 TikTok Pixel

**Campos necessarios:**
- TikTok Pixel ID (ex: XXXXXXXXXXXX)
- Toggle: Ativar/Desativar

**Eventos recomendados:**
- `PageView` - Todas as paginas
- `SubmitForm` - Formulario enviado
- `ViewContent` - Ver portfolio
- `ClickButton` - Cliques em CTAs

---

### 4. Configuracoes LGPD/Privacidade

#### Opcoes disponiveis:

| Opcao | Descricao |
|-------|-----------|
| Anonimizar IP | Nao envia IP completo ao GA4 |
| Modo Consentimento | Ativa Consent Mode do Google |
| Cookies Essenciais | Carrega pixels apenas apos consentimento |
| Exibir Banner de Cookies | Mostra banner de aceite (futuro) |

#### Consent Mode V2 (Google):
- `ad_storage`: denied/granted
- `analytics_storage`: denied/granted
- `ad_user_data`: denied/granted
- `ad_personalization`: denied/granted

---

### 5. Banco de Dados

Criar tabela `site_settings` para armazenar as configuracoes:

```text
Tabela: site_settings
Colunas:
- id: uuid (PK)
- key: text (UNIQUE) - nome da configuracao
- value: jsonb - valor da configuracao
- updated_at: timestamp
- updated_by: uuid (FK -> auth.users)
```

**Chaves previstas:**
- `tracking_ga4`: { enabled: bool, measurement_id: string, debug_mode: bool }
- `tracking_meta`: { enabled: bool, pixel_id: string }
- `tracking_tiktok`: { enabled: bool, pixel_id: string }
- `tracking_lgpd`: { anonymize_ip: bool, consent_mode: bool, cookies_required: bool }

**RLS Policies:**
- Admin pode ler/escrever
- Editor pode apenas ler

---

### 6. Componente de Injecao de Scripts

Criar componente `TrackingScripts.tsx` que:

1. Busca configuracoes do banco de dados
2. Injeta scripts dinamicamente no `<head>`
3. Respeita configuracoes de LGPD
4. Dispara eventos personalizados

**Fluxo:**
```text
App carrega -> TrackingScripts busca config -> Se ativo, injeta script -> Trackeia pageview
```

---

### 7. Hook para Eventos

Criar hook `useTracking.ts` para facilitar o disparo de eventos em qualquer lugar:

```text
const { trackEvent } = useTracking();

// Uso:
trackEvent('generate_lead', { niche: 'casamento' });
trackEvent('click_whatsapp', { page: '/contato' });
```

O hook verifica quais pixels estao ativos e dispara para todos.

---

### 8. Arquitetura Tecnica

#### Arquivos a Criar:

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/admin/Tracking.tsx` | Pagina de configuracao |
| `src/components/tracking/TrackingScripts.tsx` | Injeta scripts no site |
| `src/hooks/useTracking.ts` | Hook para disparar eventos |
| `src/hooks/useTrackingConfig.ts` | Busca configuracoes do DB |

#### Arquivos a Modificar:

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar rota /admin/tracking + TrackingScripts |
| `src/pages/Contato.tsx` | Adicionar eventos de lead |
| `src/components/layout/Header.tsx` | Evento click_whatsapp |
| `src/components/layout/WhatsAppFloat.tsx` | Evento click_whatsapp |

---

### 9. UI da Pagina Tracking

Layout com cards organizados:

```text
+------------------------------------------+
|  CONFIGURACOES DE TRACKING               |
|  Configure os pixels sem mexer no codigo |
+------------------------------------------+

+------------------+  +------------------+
| GOOGLE ANALYTICS |  | META PIXEL       |
| [Toggle] Ativo   |  | [Toggle] Ativo   |
| ID: G-XXXXXXXX   |  | ID: 123456789    |
| [x] Debug Mode   |  |                  |
+------------------+  +------------------+

+------------------+  +------------------+
| TIKTOK PIXEL     |  | LGPD / PRIVAC.   |
| [Toggle] Ativo   |  | [x] Anonimizar   |
| ID: XXXXXXXXXXXX |  | [x] Consent Mode |
+------------------+  +------------------+

+------------------------------------------+
| EVENTOS CONFIGURADOS                     |
| - page_view: GA4, Meta, TikTok           |
| - generate_lead: GA4, Meta               |
| - click_whatsapp: GA4, Meta, TikTok      |
+------------------------------------------+

           [Salvar Configuracoes]
```

---

### 10. Eventos Pre-configurados

Lista de eventos que serao trackeados automaticamente:

| Evento | Gatilho | Plataformas |
|--------|---------|-------------|
| `page_view` | Navegacao entre paginas | GA4, Meta, TikTok |
| `generate_lead` | Envio do formulario de contato | GA4, Meta, TikTok |
| `click_whatsapp_header` | Clique no WhatsApp do header | GA4, Meta, TikTok |
| `click_whatsapp_floating` | Clique no botao flutuante | GA4, Meta, TikTok |
| `view_portfolio_item` | Clique em projeto do portfolio | GA4, Meta |
| `click_niche_card` | Clique em card de nicho | GA4, Meta |
| `cta_primary_click` | Clique no CTA do hero | GA4, Meta |
| `form_start` | Inicio do preenchimento do form | GA4 |

---

### 11. Seguranca

- IDs de pixels sao armazenados no banco (Supabase)
- Apenas admins podem editar configuracoes
- Scripts sao carregados via HTTPS
- Validacao de formato dos IDs antes de salvar

---

### 12. Ordem de Implementacao

1. **Passo 1**: Criar tabela `site_settings` no Supabase com RLS
2. **Passo 2**: Criar pagina `/admin/tracking` com formulario
3. **Passo 3**: Criar hook `useTrackingConfig` para buscar configs
4. **Passo 4**: Criar componente `TrackingScripts` para injetar scripts
5. **Passo 5**: Criar hook `useTracking` para disparar eventos
6. **Passo 6**: Integrar TrackingScripts no App.tsx
7. **Passo 7**: Adicionar eventos nos componentes existentes
8. **Passo 8**: Adicionar rota no App.tsx

---

### 13. Resumo

Esta implementacao permite que voce configure tracking completo sem tocar no codigo:

- **GA4**: Analise completa de trafego e conversoes
- **Meta Pixel**: Retargeting no Facebook/Instagram
- **TikTok Pixel**: Retargeting no TikTok
- **LGPD**: Conformidade com privacidade brasileira

Os eventos serao disparados automaticamente nos pontos criticos de conversao do site.

