

## Plano: Sistema Completo de Gestão de Portfólio no Admin

Criar um módulo profissional de CMS para gerenciar o portfólio, com suporte a vídeos do YouTube e Google Drive, autoplay limpo e gestão completa.

---

### 1. Banco de Dados (Supabase)

**Nova tabela: `portfolio_items`**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primaria |
| `title` | TEXT | Titulo do projeto (obrigatorio) |
| `description` | TEXT | Descricao curta |
| `niche` | TEXT | casamento, eventos, clinicas, marcas, food, imobiliario |
| `video_url` | TEXT | URL completa (YouTube ou Drive) |
| `video_type` | TEXT | "youtube" ou "drive" (detectado automaticamente) |
| `thumbnail_url` | TEXT | URL da thumbnail (auto-extraida ou customizada) |
| `is_featured` | BOOLEAN | Destaque na home |
| `is_published` | BOOLEAN | Visivel no site publico |
| `display_order` | INTEGER | Ordem de exibicao |
| `created_at` | TIMESTAMP | Data de criacao |
| `updated_at` | TIMESTAMP | Ultima atualizacao |
| `created_by` | UUID | Usuario que criou |

**Politicas RLS:**
- SELECT publico para `is_published = true`
- SELECT/INSERT/UPDATE para admin e editor autenticados
- DELETE apenas para admin

---

### 2. Suporte a YouTube e Google Drive

**Deteccao automatica do tipo de video:**

| Fonte | Formato da URL | Video ID |
|-------|----------------|----------|
| YouTube | `youtube.com/watch?v=ID`, `youtu.be/ID` | Extrai o ID do video |
| Drive | `drive.google.com/file/d/ID/view` | Extrai o ID do arquivo |

**Thumbnails automaticas:**
- YouTube: `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg`
- Drive: Usa a thumbnail do Google ou permite upload customizado

**Embed URLs (com autoplay limpo):**
- YouTube: Usa os parametros ja configurados (autoplay, mute, controls=0, etc.)
- Drive: `https://drive.google.com/file/d/ID/preview` (nota: Drive tem menos controle sobre UI)

---

### 3. Interface Admin - Paginas

**3.1 Lista de Portfolio (`/admin/portfolio`)**

```text
┌─────────────────────────────────────────────────────────────┐
│  PORTFOLIO                              [+ Novo Projeto]    │
├─────────────────────────────────────────────────────────────┤
│  [Buscar...]  [Nicho ▼]  [Status ▼]                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────┬────────────────┬──────────┬────────┬───────────┐  │
│  │Thumb │ Titulo         │ Nicho    │ Status │ Acoes     │  │
│  ├──────┼────────────────┼──────────┼────────┼───────────┤  │
│  │ 🖼   │ Wedding Film   │ Casamento│ ✅ Pub │ ⭐ ✏️ 🗑️  │  │
│  │ 🖼   │ Evento Corp    │ Eventos  │ 📝 Ras │ ✏️ 🗑️     │  │
│  └──────┴────────────────┴──────────┴────────┴───────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- Tabela com thumbnail, titulo, nicho, status, acoes
- Filtros por nicho e status (publicado/rascunho)
- Busca por titulo
- Badge para itens "Destaque"
- Acoes: Editar, Publicar/Despublicar, Destaque, Excluir

**3.2 Formulario Criar/Editar (`/admin/portfolio/new` e `/admin/portfolio/:id/edit`)**

```text
┌─────────────────────────────────────────────────────────────┐
│  ← NOVO PROJETO                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Titulo do Projeto *                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Wedding Film - Ana & Pedro                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Descricao                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Um lindo casamento ao ar livre em Trancoso...       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Nicho *                    ┌ YouTube  ┐ ┌ Drive ┐          │
│  ┌──────────────────┐       │    ⬤     │ │   ○   │          │
│  │ Casamento      ▼ │       └──────────┘ └───────┘          │
│  └──────────────────┘                                       │
│                                                             │
│  URL do Video *                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ https://youtube.com/watch?v=abc123                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │              PREVIEW DO VIDEO                       │    │
│  │           (carrega ao colar URL)                    │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Thumbnail (opcional - auto-extraida do YouTube)            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ URL da imagem customizada (deixe vazio para auto)   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ☐ Publicado     ☐ Destaque                                 │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Cancelar      │  │   Salvar        │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Atualizacao do VideoModal

**Suporte a multiplas fontes:**
- Detecta se eh YouTube ou Drive
- Aplica parametros de autoplay/esconder controles para YouTube
- Para Drive: mostra preview limpo (Drive tem limitacoes de customizacao)

---

### 5. Pagina Works Dinamica

**Alteracoes em `src/pages/Works.tsx`:**
- Remover array estatico `projects`
- Buscar do Supabase: `portfolio_items` onde `is_published = true`
- Ordenar por `display_order` e `created_at`
- Manter filtros por nicho funcionando
- Passar `video_url` e `video_type` para o modal

---

### 6. Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| **Migration SQL** | Criar | Tabela `portfolio_items` + RLS |
| `src/lib/videoUtils.ts` | Criar | Funcoes para detectar tipo, extrair ID, gerar embed URL |
| `src/pages/admin/Portfolio.tsx` | Criar | Lista de projetos com acoes |
| `src/pages/admin/PortfolioForm.tsx` | Criar | Formulario criar/editar |
| `src/components/admin/VideoPreview.tsx` | Criar | Preview do video no formulario |
| `src/components/admin/AdminSidebar.tsx` | Modificar | Adicionar link "Portfolio" |
| `src/pages/Works.tsx` | Modificar | Buscar dados do Supabase |
| `src/components/ui/VideoModal.tsx` | Modificar | Suporte a YouTube e Drive |
| `src/App.tsx` | Modificar | Adicionar rotas do portfolio |

---

### 7. Funcoes Utilitarias (videoUtils.ts)

```text
detectVideoType(url) → "youtube" | "drive" | "unknown"
extractVideoId(url, type) → string
generateThumbnailUrl(url, type) → string
generateEmbedUrl(url, type, autoplay) → string
```

---

### 8. Nota sobre Google Drive

**Limitacoes:**
- Google Drive nao oferece controle total sobre a UI do player
- Autoplay pode nao funcionar em todos os navegadores
- Requer que o arquivo esteja compartilhado publicamente

**Recomendacao:**
- YouTube oferece melhor experiencia (autoplay, sem controles, loop)
- Drive eh util para videos privados ou nao hospedados no YouTube

---

### 9. Fluxo de Trabalho do Usuario

```text
1. Admin acessa /admin/portfolio
2. Clica em "+ Novo Projeto"
3. Preenche titulo, seleciona nicho
4. Cola URL do YouTube ou Drive
5. Sistema detecta automaticamente o tipo
6. Preview do video aparece
7. Thumbnail eh extraida automaticamente (pode customizar)
8. Marca como "Publicado" e "Destaque" se quiser
9. Salva
10. Video aparece no site publico em /works
```

