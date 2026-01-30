
## Plano: Secao "Alguns de Nossos Clientes" com Carrossel Marquee

### 1. Visao Geral

Criar uma nova secao na Home com carrossel infinito de logos de clientes, gerenciavel pelo Admin:

| Aspecto | Implementacao |
|---------|---------------|
| Posicao | Entre CTASection e Footer |
| Visual | Fundo escuro + faixa gold no topo (igual referencia) |
| Carrossel | Loop infinito marquee (CSS puro) |
| Admin | CRUD completo de clientes + configuracoes |
| Storage | Supabase Storage bucket para uploads |

---

### 2. Banco de Dados

#### 2.1 Nova Tabela: `clients`

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | uuid | Sim | Chave primaria |
| name | text | Sim | Nome do cliente |
| logo_url | text | Sim | URL da logo (Supabase Storage) |
| website_url | text | Nao | Link externo (abre em nova aba) |
| category | text | Nao | Categoria opcional |
| is_featured | boolean | Sim | Exibir na secao da Home |
| is_active | boolean | Sim | Pausar sem apagar |
| display_order | integer | Sim | Ordem manual |
| created_at | timestamp | Sim | Data de criacao |
| updated_at | timestamp | Sim | Data de atualizacao |

#### 2.2 RLS Policies

| Operacao | Regra |
|----------|-------|
| SELECT (publico) | `is_active = true AND is_featured = true` |
| SELECT (admin/editor) | Todos os registros |
| INSERT/UPDATE | admin + editor |
| DELETE | apenas admin |

#### 2.3 Configuracoes em `site_settings`

Nova chave `clients_section_config`:

```json
{
  "enabled": true,
  "title": "ALGUNS DE NOSSOS CLIENTES",
  "carousel_speed": 40,
  "pause_on_hover": true,
  "logo_height": 48
}
```

---

### 3. Supabase Storage

Criar bucket `client-logos`:

| Configuracao | Valor |
|--------------|-------|
| Nome | client-logos |
| Publico | Sim (para exibir no site) |
| Tamanho maximo | 2MB |
| Tipos permitidos | image/svg+xml, image/png, image/webp |

---

### 4. Componente da Home: ClientsSection

#### 4.1 Layout Visual

```text
+--------------------------------------------------+
|  =========== FAIXA GOLD (40px) =================  |
+--------------------------------------------------+
|                                                  |
|        ALGUNS DE NOSSOS CLIENTES                 |
|                                                  |
|  [Logo] [Logo] [Logo] [Logo] [Logo] [Logo] >>>   |
|  <<< [Logo] [Logo] [Logo] [Logo] [Logo] [Logo]   |
|                                                  |
+--------------------------------------------------+
```

#### 4.2 Comportamento do Marquee

| Recurso | Implementacao |
|---------|---------------|
| Animacao | CSS `@keyframes marquee` (translate linear infinito) |
| Duplicacao | Logos duplicados para loop suave sem "pulo" |
| Pause on hover | Desktop: pausar animacao no hover |
| Mobile | Scroll horizontal nativo + animacao suave |
| Reduced motion | Grid estatico (sem animacao) |

#### 4.3 CSS Marquee

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-track {
  display: flex;
  animation: marquee var(--speed, 40s) linear infinite;
}

.marquee-track:hover {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
    flex-wrap: wrap;
    justify-content: center;
  }
}
```

#### 4.4 Hover nos Logos

- Opacidade: 0.7 -> 1.0
- Zoom: scale(1) -> scale(1.08)
- Transicao: 200ms ease

---

### 5. Admin: Gerenciamento de Clientes

#### 5.1 Nova Pagina: `/admin/clients`

| Secao | Funcionalidade |
|-------|----------------|
| Header | Titulo + Botao "Novo Cliente" |
| Filtros | Busca, Featured, Ativos |
| Tabela | Logo, Nome, Categoria, Featured, Ativo, Ordem, Acoes |
| Acoes | Toggle Featured, Toggle Ativo, Editar, Excluir |

#### 5.2 Formulario: `/admin/clients/new` e `/admin/clients/:id/edit`

| Campo | Tipo | Validacao |
|-------|------|-----------|
| Nome | Input text | Obrigatorio, max 100 chars |
| Logo | Upload file | Obrigatorio, SVG/PNG/WebP, max 2MB |
| Website | Input URL | Opcional, validar URL |
| Categoria | Input text | Opcional |
| Featured | Checkbox | - |
| Ativo | Checkbox | - |
| Ordem | Input number | Min 0 |

#### 5.3 Upload de Logo

Fluxo:
1. Usuario seleciona arquivo
2. Preview da imagem
3. Ao salvar, upload para Supabase Storage
4. Armazena URL publica no campo `logo_url`

---

### 6. Configuracoes da Secao (Admin)

Adicionar nova tab/secao em `/admin/config` ou criar `/admin/clients/settings`:

| Campo | Tipo | Default |
|-------|------|---------|
| Secao habilitada | Switch | true |
| Titulo | Input | "ALGUNS DE NOSSOS CLIENTES" |
| Velocidade do carrossel | Slider (20-80s) | 40 |
| Pausar no hover | Switch | true |
| Altura das logos | Input (32-64px) | 48 |

---

### 7. Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| src/components/home/ClientsSection.tsx | Componente da secao de clientes |
| src/pages/admin/ClientsList.tsx | Lista de clientes no Admin |
| src/pages/admin/ClientsForm.tsx | Formulario de criar/editar cliente |
| src/hooks/useClients.ts | Hooks para buscar clientes |

---

### 8. Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| src/pages/Index.tsx | Adicionar ClientsSection antes do Footer |
| src/components/admin/AdminSidebar.tsx | Adicionar link "Clientes" |
| src/App.tsx | Adicionar rotas /admin/clients/* |
| src/index.css | Adicionar keyframes marquee |

---

### 9. Diagrama de Fluxo (Upload de Logo)

```text
[Usuario seleciona arquivo]
         |
         v
[Validar tipo e tamanho]
         |
   +-----+-----+
   |           |
 Invalido    Valido
   |           |
   v           v
[Erro]   [Preview local]
                |
                v
         [Clique Salvar]
                |
                v
   [Upload para Supabase Storage]
                |
                v
   [Retorna URL publica]
                |
                v
   [Salva registro na tabela clients]
```

---

### 10. Consideracoes de Performance

| Item | Solucao |
|------|---------|
| Lazy loading | Logos com loading="lazy" |
| Formato otimizado | Preferir SVG/WebP |
| Cache | Supabase Storage tem cache nativo |
| Animacao | CSS puro (sem JS no loop) |
| Bundle | Sem dependencias externas para o marquee |

---

### 11. Acessibilidade

| Recurso | Implementacao |
|---------|---------------|
| Reduced motion | Respeitar `prefers-reduced-motion` |
| Alt text | Usar `name` do cliente como alt |
| Keyboard | Links acessiveis via Tab |
| Contraste | Logos em fundo escuro (legibilidade) |

---

### 12. Seed Inicial (Opcional)

Criar 5-10 clientes de exemplo com logos placeholder para demonstracao.

---

### 13. Ordem de Implementacao

1. **Migracao DB**: Criar tabela `clients` + RLS + trigger updated_at
2. **Storage**: Criar bucket `client-logos`
3. **Hook useClients**: Buscar clientes featured
4. **ClientsSection**: Componente com marquee
5. **Index.tsx**: Integrar secao na Home
6. **Admin - ClientsList**: Pagina de listagem
7. **Admin - ClientsForm**: Formulario com upload
8. **Rotas + Sidebar**: Integrar no sistema
9. **Configuracoes**: Adicionar settings em site_settings

---

### 14. Resumo Visual Final

**Home - Secao Clientes:**

```text
+================================================+
|  ================== GOLD BAR ================  |
+================================================+
|                                                |
|        ALGUNS DE NOSSOS CLIENTES               |
|        ─────────────────────────               |
|                                                |
|   [logo1] [logo2] [logo3] [logo4] [logo5] >>> |
|                                                |
+------------------------------------------------+
```

**Admin - Lista de Clientes:**

```text
+------------------------------------------------+
|  CLIENTES                    [+ Novo Cliente]  |
+------------------------------------------------+
| [Buscar...          ]  [Filtro: Todos v]       |
+------------------------------------------------+
| Logo | Nome          | Cat     | F | A | Ordem |
+------------------------------------------------+
| [img]| Cargill       | Food    | * | o |   1   |
| [img]| PESA CAT      | Indust. | * | o |   2   |
| [img]| MHP Cars      | Auto    | * | o |   3   |
+------------------------------------------------+
```

